const path = require("path");
const PROTO_PATH = path.resolve(__dirname, "..") + "/proto/user.proto";
const {users} = require("./../data");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const user_proto = grpc.loadPackageDefinition(packageDef).user;

/**
 * Implements the getUserStream RPC method.
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
 * Starts an RPC server that receives requests for the User service at the
 * sample server port
 */
function main() {
    var server = new grpc.Server();
    server.addService(user_proto.User.service, {getUserStream});
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
      server.start();
      console.log(`gRPC server has started`)
    });
  }
  
  main();