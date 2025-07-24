import { db } from "./db";

const insertUsage = db.query(`INSERT INTO usage(key,time) VALUES ($key,$time)`)
const usageView = db.query(`SELECT time FROM usage WHERE key=$key`)

export async function registerUsage(key: string) {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19)
    try {
        insertUsage.run({ $key: key, $time: time })
    } catch (error) {
        throw error
    }
}

export async function usageForKey(key: string) {
    try {
        const usage = usageView.all({ $key: key })
        return usage
    } catch (error) {
        throw error
    }
}

export type Country = {
    name: { common: string },
    capital: string[],
    languages: Record<string, string>,
    flags: {svg:string}
    currencies: Record<string, { name: string }>
}

export function formatJSON(data: Country[]) {
    return data.map(d => {
        return {
            name: d.name.common,
            capital: d.capital[0],
            languages: Object.values(d.languages),
            flag: d.flags.svg,
            currency: Object.values(d.currencies)[0]?.name
        }
    })
}