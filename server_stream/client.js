const path = require("path");
const PROTO_PATH = path.resolve(__dirname, "..") + "/proto/user.proto";

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
    const call = client.getUserStream({userIdList: [1,2,4]});
    call.on("data", (response) => console.log(response));
    call.on("end", () => console.log("Request completed!!"));
}

main();