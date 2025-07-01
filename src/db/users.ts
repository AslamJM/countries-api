import { db } from "./db"

export type User = {
    id: number
    email: string
    password: string
    isAdmin: number
}

export type ApiKey = {
    key: string
    expireAt: Date
    userId: string
}

const insertToUsers = db.query(`INSERT INTO users(id,email,password,isAdmin) VALUES ($id,$email,$password,$isAdmin)`)
const insertApiKey = db.query(`INSERT INTO api_keys(key,expiryAt,userId) VALUES ($key,$expiryAt,$userId) RETURNING *`)
const selectUser = db.query(`SELECT * FROM users WHERE email=$email`)
const userById = db.query(`SELECT * FROM users WHERE id=$id`)
const queryApiKey = db.query(`SELECT * FROM api_keys WHERE key=$key`)
const allUsers = db.query(`SELECT id,email,isAdmin FROM users`)


export async function registerUser(email: string, password: string, isAdmin: number = 0) {
    try {
        const id = Bun.randomUUIDv7();
        const hashed = await Bun.password.hash(password);
        insertToUsers.run({ $id: id, $email: email, $password: hashed, $isAdmin: isAdmin })
        return true
    } catch (error) {
        throw error
    }
}

export async function getAllUsers() {
    try {
        const users = allUsers.all() as User[]
        return users
    } catch (error) {
        throw error
    }
}

export async function registerApiKey(userId: string) {
    try {
        const key = Bun.randomUUIDv7();
        const exp = new Date();
        exp.setMonth((exp.getMonth() + 1) % 12)
        const apikey = insertApiKey.get({
            $key: key,
            $expiryAt: exp.toISOString().replace('T', ' ').substring(0, 19),
            $userId: userId
        })
        return apikey
    } catch (error) {
        throw error
    }
}

export async function loginUser(email: string, password: string) {
    try {
        const user = selectUser.get({ $email: email }) as User;
        if (!user) {
            throw new Error("User not found")
        }
        if (!await Bun.password.verify(password, user.password)) {
            throw new Error("Invalid Credentials")
        }
        return {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        }
    } catch (error) {
        throw error
    }
}

export async function getUserById(id: string) {
    try {
        const user = userById.get({ $id: id }) as User
        if (!user) {
            throw new Error("User not found")
        }
        const { password, ...rest } = user
        return rest
    } catch (error) {
        throw error
    }
}

export async function validateKey(key: string) {
    try {
        const apikey = queryApiKey.get({ $key: key }) as ApiKey
        if (!apikey) throw new Error("Unauthorized")
        return true;
    } catch (error) {
        throw error
    }
}

export async function isAdmin(userId: string) {
    try {
        const user = await getUserById(userId)

        return user.isAdmin === 1
    } catch (error) {
        throw error
    }
}