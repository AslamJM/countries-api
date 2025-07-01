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

    return {
        email: maybeBody.email,
        password: maybeBody.password
    };
}