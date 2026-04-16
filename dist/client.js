import { readFile } from "fs/promises";
import { basename } from "path";
const retryableStatusCodes = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isRetryableError = (err) => {
    if (!(err instanceof Error))
        return false;
    const message = err.message.toLowerCase();
    return (message.includes("network") ||
        message.includes("fetch") ||
        message.includes("timeout") ||
        message.includes("aborted"));
};
function jsonHeaders(apiKey) {
    return {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
    };
}
function apiKeyHeaders(apiKey) {
    return { "X-API-Key": apiKey };
}
function parseFilenameFromContentDisposition(header) {
    if (!header)
        return undefined;
    const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        try {
            return decodeURIComponent(utf8Match[1].trim().replace(/^"(.*)"$/, "$1"));
        }
        catch {
            return utf8Match[1].trim().replace(/^"(.*)"$/, "$1");
        }
    }
    const plainMatch = header.match(/filename=([^;]+)/i);
    if (plainMatch?.[1]) {
        return plainMatch[1].trim().replace(/^"(.*)"$/, "$1");
    }
    return undefined;
}
export function createTealfabricClient(options) {
    const baseUrl = options.baseUrl.replace(/\/$/, "");
    async function request(method, path, body) {
        const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
        const maxAttempts = options.retryCount + 1;
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), options.requestTimeoutMs);
            try {
                const res = await fetch(url, {
                    method,
                    headers: jsonHeaders(options.apiKey),
                    body: body !== undefined ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                });
                const text = await res.text();
                if (!res.ok) {
                    if (attempt < maxAttempts && retryableStatusCodes.has(res.status)) {
                        const jitter = Math.floor(Math.random() * 100);
                        await sleep(options.retryBaseDelayMs * attempt + jitter);
                        continue;
                    }
                    throw new Error(`Tealfabric API ${res.status}: ${text || res.statusText}`);
                }
                if (!text)
                    return undefined;
                try {
                    return JSON.parse(text);
                }
                catch {
                    return text;
                }
            }
            catch (err) {
                lastError = err;
                if (attempt >= maxAttempts || !isRetryableError(err)) {
                    throw err;
                }
                const jitter = Math.floor(Math.random() * 100);
                await sleep(options.retryBaseDelayMs * attempt + jitter);
            }
            finally {
                clearTimeout(timeout);
            }
        }
        throw lastError instanceof Error ? lastError : new Error("Unknown Tealfabric request error");
    }
    return {
        // --- Connectors ---
        async listConnectors(params) {
            const q = new URLSearchParams();
            if (params?.action)
                q.set("action", params.action);
            if (params?.connector_id)
                q.set("connector_id", params.connector_id);
            return request("GET", `/api/v1/connectors${q.toString() ? `?${q.toString()}` : ""}`);
        },
        async testConnector(body) {
            return request("POST", "/api/v1/connectors?action=test", body);
        },
        async getConnectorOAuth2Required(connectorId) {
            return request("GET", `/api/v1/connectors/${encodeURIComponent(connectorId)}/oauth2-required`);
        },
        // --- Integrations ---
        async listIntegrations(params) {
            const q = new URLSearchParams();
            if (params?.action)
                q.set("action", params.action);
            if (params?.integration_id)
                q.set("integration_id", params.integration_id);
            if (params?.execution_id)
                q.set("execution_id", params.execution_id);
            if (params?.limit != null)
                q.set("limit", String(params.limit));
            if (params?.search)
                q.set("search", params.search);
            if (params?.type)
                q.set("type", params.type);
            if (params?.status)
                q.set("status", params.status);
            if (params?.is_active != null)
                q.set("is_active", String(params.is_active));
            if (params?.page != null)
                q.set("page", String(params.page));
            if (params?.items_per_page != null)
                q.set("items_per_page", String(params.items_per_page));
            if (params?.sort_by)
                q.set("sort_by", params.sort_by);
            if (params?.sort_direction)
                q.set("sort_direction", params.sort_direction);
            return request("GET", `/api/v1/integrations${q.toString() ? `?${q.toString()}` : ""}`);
        },
        async createIntegration(body) {
            return request("POST", "/api/v1/integrations?action=create", body);
        },
        async updateIntegration(integrationId, body) {
            return request("PUT", "/api/v1/integrations?action=update", { integration_id: integrationId, ...body });
        },
        async listWebapps(params) {
            const q = new URLSearchParams();
            if (params?.search)
                q.set("search", params.search);
            if (params?.limit)
                q.set("limit", String(params.limit));
            const query = q.toString();
            return request("GET", `/api/v1/webapps${query ? `?${query}` : ""}`);
        },
        async getWebapp(webappId, version) {
            const q = version != null ? `?version=${version}` : "";
            return request("GET", `/api/v1/webapps/${encodeURIComponent(webappId)}${q}`);
        },
        async createWebapp(body) {
            return request("POST", "/api/v1/webapps", body);
        },
        async updateWebapp(webappId, body) {
            return request("PUT", `/api/v1/webapps/${encodeURIComponent(webappId)}`, body);
        },
        async publishWebapp(webappId) {
            return request("POST", `/api/v1/webapps/${encodeURIComponent(webappId)}/publish`, {});
        },
        async listProcesses() {
            return request("GET", "/api/v1/processflow?action=processes");
        },
        async getProcess(processId) {
            return request("GET", `/api/v1/processflow?action=process&process_id=${encodeURIComponent(processId)}`);
        },
        async listProcessSteps(processId) {
            return request("GET", `/api/v1/processflow?action=steps&process_id=${encodeURIComponent(processId)}`);
        },
        async getProcessStep(stepId) {
            return request("GET", `/api/v1/processflow?action=step&step_id=${encodeURIComponent(stepId)}`);
        },
        async executeProcess(processId, input) {
            return request("POST", "/api/v1/processflow?action=execute-process", { process_id: processId, input_data: input ?? {} });
        },
        async createProcess(body) {
            return request("POST", "/api/v1/processes?action=create", body);
        },
        async updateProcess(processId, body) {
            return request("PUT", "/api/v1/processes?action=update", { process_id: processId, ...body });
        },
        async createProcessStep(body) {
            return request("POST", "/api/v1/processes?action=create-step", body);
        },
        async updateProcessStep(stepId, body) {
            return request("PUT", "/api/v1/processes?action=update-step", { step_id: stepId, ...body });
        },
        // --- Documents (package files for delivery) ---
        async listDocuments(params) {
            const q = new URLSearchParams({ action: "list" });
            if (params?.path)
                q.set("path", params.path);
            if (params?.tenant_id)
                q.set("tenant_id", params.tenant_id);
            return request("GET", `/api/v1/documents?${q.toString()}`);
        },
        async getDocumentMetadata(params) {
            const q = new URLSearchParams({ action: "metadata", file_path: params.file_path });
            if (params.tenant_id)
                q.set("tenant_id", params.tenant_id);
            return request("GET", `/api/v1/documents?${q.toString()}`);
        },
        async downloadDocument(params) {
            const q = new URLSearchParams({ action: "download", file_path: params.file_path });
            if (params.tenant_id)
                q.set("tenant_id", params.tenant_id);
            const url = `${baseUrl}/api/v1/documents?${q.toString()}`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), options.requestTimeoutMs);
            try {
                const res = await fetch(url, {
                    method: "GET",
                    headers: apiKeyHeaders(options.apiKey),
                    signal: controller.signal,
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Tealfabric API ${res.status}: ${text || res.statusText}`);
                }
                const contentType = (res.headers.get("content-type") || "").toLowerCase();
                if (contentType.includes("application/json")) {
                    return (await res.json());
                }
                const buffer = Buffer.from(await res.arrayBuffer());
                const filename = parseFilenameFromContentDisposition(res.headers.get("content-disposition")) ||
                    basename(params.file_path);
                return {
                    success: true,
                    data: {
                        file_path: params.file_path,
                        filename,
                        content_type: res.headers.get("content-type") || "application/octet-stream",
                        content_base64: buffer.toString("base64"),
                    },
                };
            }
            finally {
                clearTimeout(timeout);
            }
        },
        async uploadDocument(params) {
            if (!options.allowLocalFileUpload) {
                throw new Error("Local file upload is disabled. Set TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD=true to enable tealfabric_upload_document.");
            }
            const q = new URLSearchParams({ action: "upload" });
            if (params.tenant_id)
                q.set("tenant_id", params.tenant_id);
            const url = `${baseUrl}/api/v1/documents?${q.toString()}`;
            const fileBuffer = await readFile(params.file_path);
            const filename = basename(params.file_path);
            const formData = new FormData();
            formData.append("destination_path", params.destination_path);
            formData.append("file", new Blob([fileBuffer]), filename);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), options.requestTimeoutMs);
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: apiKeyHeaders(options.apiKey),
                    body: formData,
                    signal: controller.signal,
                });
                const text = await res.text();
                if (!res.ok) {
                    throw new Error(`Tealfabric API ${res.status}: ${text || res.statusText}`);
                }
                if (!text)
                    return { success: true };
                try {
                    return JSON.parse(text);
                }
                catch {
                    return { success: true, data: text };
                }
            }
            finally {
                clearTimeout(timeout);
            }
        },
        async moveDocument(params) {
            const q = new URLSearchParams({ action: "move" });
            if (params.tenant_id)
                q.set("tenant_id", params.tenant_id);
            return request("PUT", `/api/v1/documents?${q.toString()}`, { old_path: params.old_path, new_path: params.new_path });
        },
        async deleteDocument(params) {
            const q = new URLSearchParams({ action: "delete", path: params.path });
            if (params.tenant_id)
                q.set("tenant_id", params.tenant_id);
            return request("DELETE", `/api/v1/documents?${q.toString()}`);
        },
    };
}
