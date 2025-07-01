import { formatJSON, registerUsage, type Country } from "./src/db/usage";
import { getAllUsers, isAdmin, loginUser, registerApiKey, registerUser } from "./src/db/users";
import { validateRegister } from "./src/validation/auth";

const REST_COUNTRIES_URL = "https://restcountries.com/v3.1/independent?status=true&fields=languages,capital,name,flag"


const server = Bun.serve({
    port: 3000,

    routes: {

        "/users": {
            GET: async (req) => {
                try {
                    const btoken = req.headers.get("authorization")

                    if (!btoken) {
                        return Response.json({ message: "Unauthorized" }, { status: 401 })
                    }
                    const userId = btoken.split(" ")[1];
                    if (!userId) return Response.json({}, { status: 401 })

                    const admin = await isAdmin(userId);
                    if (!admin) return Response.json({}, { status: 401 })

                    const users = await getAllUsers()
                    return Response.json(users)
                } catch (error: any) {
                    return Response.json({ success: false, message: error.message }, { status: 500 })
                }

            }
        },

        "/users/register": {
            POST: async (req) => {
                try {
                    const body = await req.json();
                    const { email, password } = validateRegister(body)
                    await registerUser(email, password);
                    return Response.json({ success: true }, { status: 201 })

                } catch (error: any) {
                    return Response.json({ success: false, message: error.message }, { status: 500 })
                }
            }
        },

        "/users/login": {
            POST: async (req) => {
                try {
                    const body = await req.json();
                    const { email, password } = validateRegister(body)
                    const user = await loginUser(email, password);
                    return Response.json(user, { status: 201 })

                } catch (error: any) {
                    return Response.json({ success: false, message: error.message }, { status: 500 })
                }
            }
        },

        "/api-key": {
            POST: async (req) => {
                try {
                    const btoken = req.headers.get("authorization")

                    if (!btoken) {
                        return Response.json({ message: "Unauthorized" }, { status: 401 })
                    }

                    const userId = btoken.split(" ")[1];

                    if (!userId) {
                        return Response.json({ message: "Unauthorized" }, { status: 401 })
                    }

                    const apiKey = await registerApiKey(userId)
                    return Response.json(apiKey)

                } catch (error: any) {
                    return Response.json({ success: false, message: error.message }, { status: 500 })
                }
            }
        },

        "/countries": {
            GET: async (req) => {
                const apiKey = req.headers.get("x-api-key");
                if (!apiKey) {
                    return Response.json({ message: "Unauthorized" }, { status: 401 })
                }
                const res = await fetch(REST_COUNTRIES_URL)
                const data = await res.json() as Country[]
                await registerUsage(apiKey);
                return Response.json(formatJSON(data))
            }
        }
    }
})

console.log(`server started at port:${server.port}`)