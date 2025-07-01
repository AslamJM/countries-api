import { onMothAfter } from "../lib/utils";
import { db } from "./db";

export type Session = {
    id: string
    expiryAt: Date
    userId: string
}

const insertSession = db.query(`
    INSERT INTO session (id,expiryAt,userId) VALUES ($id,$expiryAt,$userId) RETURNING id
    `)

const getSession = db.query(`
        SELECT * FROM session WHERE id=$id
    `)

const del = db.query(`
        DELETE FROM session WHERE id=$id
    `)

export async function createSession(userId: string) {
    try {
        const exp = onMothAfter()
        const id = Bun.randomUUIDv7()
        const session = await insertSession.get(({ $id: id, $expiryAt: exp, $userId: userId })) as Session
        return session
    } catch (error) {
        throw error
    }
}

export async function validateSession(id: string) {
    try {
        const session = await getSession.get({ $id: id }) as Session
        if (!session) {
            throw new Error("Unauthorized")
        }
        if (new Date() > new Date(session.expiryAt)) {
            throw new Error("Session expired")
        }
        return session.userId
    } catch (error) {
        throw error
    }
}

export async function deleteSession(id: string) {
    try {
        del.run({ $id: id })
    } catch (error) {
        throw error
    }
}