export function jsonContent(text) {
    return [{ type: "text", text }];
}
export function resultContent(data) {
    return jsonContent(typeof data === "string" ? data : JSON.stringify(data, null, 2));
}
