import { db } from "./db";

const insertUsage = db.query(`INSERT INTO usage(key,time) VALUES ($key,$time)`)

export async function registerUsage(key: string) {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19)
    try {
        insertUsage.run({ $key: key, $time: time })
    } catch (error) {
        throw error
    }
}

export type Country = {
    name: { common: string },
    capital: string[],
    languages: Record<string, string>,
    flag: string
}

export function formatJSON(data: Country[]) {
    return data.map(d => {
        return {
            name: d.name.common,
            capital: d.capital[0],
            languages: Object.values(d.languages),
            flag: d.flag
        }
    })
}