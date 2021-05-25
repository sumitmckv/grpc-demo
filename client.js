const PROTO_PATH = __dirname + "/user.proto";
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
    const arg = parseInt(process.argv[2]);
    switch(arg) {
        // Server streaming RPC
        case 2: {
            const call = client.getUserStream({userIdList: [1,2,4]});
            call.on("data", (response) => console.log(response));
            call.on("end", () => console.log("Request completed!!"));
            break;
        }
        // Client streaming RPC
        case 3: {
            const call = client.addUsersStream((_err, res) => console.log("Added users details:\n", res.users));
            const newUsers = [{email: "test4@test.com", name: "Test4 Test4"}, {email: "test5@test.com", name: "Test5 Test5"}];
            newUsers.forEach(user => call.write(user));
            call.end();
            break;
        }
        // Unary RPC
        default:
            client.getUser({id: 1}, (_err, res) => console.log("User details:", res.user));
    }
}

main();