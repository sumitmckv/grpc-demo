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

function main() {
    const client = new user_proto.User("localhost:50051", grpc.credentials.createInsecure());
    const arg = parseInt(process.argv[2]);
    switch(arg) {
        // Unary RPC
        case 1: {
            client.getUser({id: 1}, (_err, res) => console.log("User details:", res.user));
            break;
        }
        // Server streaming RPC
        case 2: {
            const call = client.getUserStream({userIdList: [1,2,4]});
            call.on("data", console.log);
            call.on("end", () => console.log("Request completed.."));
            break;
        }
        // Client streaming RPC
        case 3: {
            const call = client.addUsersStream((_err, res) => console.log("Added users details:\n", res.users));
            const newUsers = [{email: "test4@test.com", name: "Test4 Test4"}, {email: "test5@test.com", name: "Test5 Test5"}];
            newUsers.forEach(call.write);
            call.end();
            break;
        }
        // Bidirectional streaming RPC
        case 4: {
            const readline = require("readline");
            const r = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const user = process.argv[3];
            if (!user) {
                console.log("Please provide username");
                r.close();
            } else {
                let metadata = new grpc.Metadata();
                metadata.add("username", user);
    
                const call = client.chat(metadata);
                call.on("data", console.log);
                call.on("end", () => {
                    console.log("Connection ended by server..");
                    call.end();
                    r.close();
                });
    
                r.on("line", (line) => {
                    if (line === "Q") {
                        call.end();
                        r.close();
                    }
                    call.write({message: line});
                });
                console.log("Enter message:");
            }
            break;
        }
        default:
            console.log("Invalid option.");
    }
}

main();