export function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

export function resultContent(data: unknown) {
  return jsonContent(typeof data === "string" ? data : JSON.stringify(data, null, 2));
}
