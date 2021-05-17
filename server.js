const PROTO_PATH = __dirname + "/proto/user.proto";
const {users} = require("./data");

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
 * Implements the getUser RPC method.
 */
function getUser(call, cb) {
    const user = users.find(u => u.id === call.request.id) || null;
    cb(null, {user});
}


/**
 * Starts an RPC server that receives requests for the User service at the
 * sample server port
 */
function main() {
    var server = new grpc.Server();
    server.addService(user_proto.User.service, {getUser});
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
      server.start();
      console.log(`gRPC server has started`)
    });
  }
  
  main();