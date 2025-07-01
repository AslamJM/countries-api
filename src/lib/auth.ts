import { isAdmin } from "../db/users";

export function validateRegister(body: unknown) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new Error("Bad Request")
    }

    const maybeBody = body as Record<string, unknown>;

    if (
        typeof maybeBody.email !== "string" ||
        typeof maybeBody.password !== "string"
    ) {
        throw new Error("Bad Request");
    }

    let isAdmin = 0

    if (maybeBody.isAdmin && maybeBody.isAdmin === true) {
        isAdmin = 1
    }

    return {
        email: maybeBody.email,
        password: maybeBody.password,
        isAdmin
    };
}