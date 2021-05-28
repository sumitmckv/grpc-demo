const {users} = require("./data");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("./user.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const user_proto = grpc.loadPackageDefinition(packageDef).user;
let clients = new Map();

/**
 * Implements the getUser RPC method.
 * Unary RPC
 */
function getUser(call, cb) {
    const user = users.find(u => u.id === call.request.id) || null;
    cb(null, {user});
}

/**
 * Implements the getUserStream RPC method.
 * Server streaming RPC
 */
 function getUserStream(call) {
  const userIdList = call.request.userIdList;
  userIdList.forEach(id => {
      const user = users.find(u => u.id === id) || null;
      if (user) {
          call.write({response: `User details: Id ${id}, email ${user.email}, name ${user.name}`});
      } else {
          call.write({response: `No user exists with Id: ${id}`});
      }
  });
  call.end();
}

/**
 * Implements the addUsersStream RPC method.
 * Server streaming RPC
 */
function addUsersStream(call, cb) {
  let users = [];
  call.on("data", (req) => {
    req.id = Math.floor(Math.random() * 100) + 1;
    users.push(req);
  });
  call.on("end", () => cb(null, {users}));
}

/**
 * Implements the chat RPC method.
 * Bidirectional streaming RPC
 */
function chat(call) {
  call.on("data", (chatMessage) => {
    const user = call.metadata.get("username");
    clients.forEach((c, u) => {
      if(u !== user) {
        c.write({message: `${user} sent ${chatMessage.message}`});
      }
    });
    if (!clients.has(user)) {
      clients.set(user, call);
    }
  });

  call.on("end", () => {
    call.write({message: "Connection ended by client.."});
    call.end();
  });
}

/**
 * Starts an RPC server that receives requests for the User service at the server port
 */
function main() {
    var server = new grpc.Server();
    server.addService(user_proto.User.service, {getUser, getUserStream, addUsersStream, chat});
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
      server.start();
      console.log(`gRPC server has started`)
    });
  }
  
  main();