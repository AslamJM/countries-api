export function onMothAfter() {
    const exp = new Date();
    exp.setMonth((exp.getMonth() + 1) % 12)
    return exp.toISOString().replace('T', ' ').substring(0, 19);
}