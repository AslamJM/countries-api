import { deleteSession, validateSession } from "./src/db/session";
import { formatJSON, registerUsage, usageForKey, type Country } from "./src/db/usage";
import { getAllUsers, isAdmin, loginUser, registerApiKey, registerUser } from "./src/db/users";
import { validateRegister } from "./src/lib/auth";

const REST_COUNTRIES_URL = "https://restcountries.com/v3.1/independent?status=true&fields=languages,capital,name,currencies,flags"


const server = Bun.serve({
    port: 3001,


    routes: {

        "/users": {
            GET: async (req) => {
                try {
                    const cookies = req.cookies
                    const sessionId = cookies.get("session")

                    if (!sessionId) {
                        return Response.json({ message: "Unauthorized" }, { status: 401 })
                    }
                    const userId = await validateSession(sessionId)

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
                    const { email, password, isAdmin } = validateRegister(body)
                    await registerUser(email, password, isAdmin);
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
                    const cookies = req.cookies
                    const { email, password } = validateRegister(body)
                    const { session, ...user } = await loginUser(email, password);
                    cookies.set("session", session.id)
                    return Response.json(user)

                } catch (error: any) {
                    return Response.json({ success: false, message: error.message }, { status: 500 })
                }
            }
        },

        "/users/logout": {
            POST: async (req) => {
                try {
                    const cookies = req.cookies
                    const sessionId = cookies.get("session")
                    if (!sessionId) {
                        return Response.json({ message: "Unauthorized" }, { status: 401 })
                    }
                    await deleteSession(sessionId)
                    cookies.delete("session")
                    return Response.json({ success: true })

                } catch (error: any) {
                    return Response.json({ success: false, message: error.message }, { status: 500 })
                }
            }
        },

        "/api-key": {
            POST: async (req) => {
                try {

                    const cookies = req.cookies
                    const sessionId = cookies.get("session")

                    if (!sessionId) {
                        return Response.json({ message: "Unauthorized" }, { status: 401 })
                    }
                    const userId = await validateSession(sessionId)
                    const apiKey = await registerApiKey(userId)
                    return Response.json(apiKey)

                } catch (error: any) {
                    return Response.json({ success: false, message: error.message }, { status: 500 })
                }
            }
        },

        "/api-key/usage": {
            GET: async (req) => {
                try {
                    const apiKey = req.headers.get("x-api-key");
                    if (!apiKey) {
                        return Response.json({ message: "Unauthorized" }, { status: 401 })
                    }
                    const usage = await usageForKey(apiKey)
                    return Response.json(usage)
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
        },

        "/social": {
            GET: async (req) => {
                const res = await fetch(REST_COUNTRIES_URL)
                const data = await res.json() as Country[]
                const r = new Response(JSON.stringify(formatJSON(data)))
                r.headers.set('Access-Control-Allow-Origin', '*');
                r.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                return r;
            }
        },


    }
})

console.log(`server started at port:${server.port}`)