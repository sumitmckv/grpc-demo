const PROTO_PATH = __dirname + "/proto/user.proto";
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

function main() {
    const client = new user_proto.User("localhost:50051", grpc.credentials.createInsecure());
    client.getUser({id: 1}, (err, res) => {
        console.log("User details:", res.user);
    })
}

main();