/**
 * Tealfabric API client for the MCP server.
 * Factory client with retries/timeouts for Lovable Desktop (stdio/HTTP).
 * Aligned with backend-next REST contracts (webapps, integrations, processflow, documents).
 */
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
    const client = {
        // --- Connectors ---
        async listConnectors(params) {
            const q = new URLSearchParams();
            if (params?.action)
                q.set("action", params.action);
            if (params?.connector_id)
                q.set("connector_id", params.connector_id);
            return request("GET", `/api/v1/connectors${q.toString() ? `?${q.toString()}` : ""}`);
        },
        async testConnector(params) {
            return request("POST", "/api/v1/connectors?action=test", {
                connector_id: params.connector_id,
                ...(params.configuration !== undefined
                    ? { configuration: params.configuration }
                    : {}),
            });
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
        async executeIntegration(params) {
            return request("POST", "/api/v1/integrations?action=execute", {
                integration_id: params.integration_id,
                ...(params.data !== undefined ? { data: params.data } : {}),
                ...(params.async !== undefined ? { async: params.async } : {}),
            });
        },
        async deleteIntegration(integrationId) {
            return request("DELETE", "/api/v1/integrations?action=delete", { integration_id: integrationId });
        },
        // --- Webapps ---
        async listWebapps(params) {
            const q = new URLSearchParams();
            if (params?.search)
                q.set("search", params.search);
            if (params?.page != null)
                q.set("page", String(params.page));
            if (params?.items_per_page != null)
                q.set("items_per_page", String(params.items_per_page));
            if (params?.type)
                q.set("type", params.type);
            if (params?.published_only != null)
                q.set("published_only", params.published_only ? "1" : "0");
            if (params?.process_id)
                q.set("process_id", params.process_id);
            if (params?.sort_by)
                q.set("sort_by", params.sort_by);
            if (params?.sort_direction)
                q.set("sort_direction", params.sort_direction);
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
        async publishWebapp(webappId, version) {
            return request("POST", `/api/v1/webapps/${encodeURIComponent(webappId)}/publish`, { version });
        },
        async unpublishWebapp(webappId) {
            return request("POST", `/api/v1/webapps/${encodeURIComponent(webappId)}/unpublish`, {});
        },
        async createWebappVersion(webappId) {
            return request("POST", `/api/v1/webapps/${encodeURIComponent(webappId)}/version`, {});
        },
        async deleteWebapp(webappId) {
            return request("DELETE", `/api/v1/webapps/${encodeURIComponent(webappId)}`);
        },
        // --- Processes ---
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
        async deleteProcess(processId) {
            return request("DELETE", "/api/v1/processes?action=delete", { process_id: processId });
        },
        /**
         * Soft-retire a process (mirrors ProcessflowService.retireProcess).
         * No tenant REST retire route exists; implemented via get + update.
         */
        async retireProcess(processId) {
            const got = await client.getProcess(processId);
            const process = got.process ??
                got.data ??
                got;
            const currentName = String(process?.name ?? "").trim();
            if (!currentName && !got.success) {
                throw new Error(`Tealfabric API: process not found (${processId})`);
            }
            const retiredName = currentName.startsWith("<retired>")
                ? currentName
                : `<retired> ${currentName || processId}`;
            return client.updateProcess(processId, {
                name: retiredName,
                status: "inactive",
            });
        },
        async createProcessStep(body) {
            const { name, step_name, ...rest } = body;
            const resolvedName = name ?? step_name;
            return request("POST", "/api/v1/processes?action=create-step", {
                ...rest,
                ...(resolvedName !== undefined ? { name: resolvedName, step_name: resolvedName } : {}),
            });
        },
        async updateProcessStep(stepId, body) {
            const { name, step_name, ...rest } = body;
            const resolvedName = name ?? step_name;
            return request("PUT", "/api/v1/processes?action=update-step", {
                step_id: stepId,
                ...rest,
                ...(resolvedName !== undefined ? { name: resolvedName, step_name: resolvedName } : {}),
            });
        },
        async deleteProcessStep(stepId) {
            return request("DELETE", "/api/v1/processes?action=delete-step", { step_id: stepId });
        },
        // --- Documents ---
        // Note: tenant_id query params are ignored by the API (auth tenant wins).
        async listDocuments(params) {
            const q = new URLSearchParams({ action: "list" });
            if (params?.path)
                q.set("path", params.path);
            if (params?.tenant_id)
                q.set("tenant_id", params.tenant_id);
            return request("GET", `/api/v1/documents?${q.toString()}`);
        },
        async listDocumentTree(params) {
            const q = new URLSearchParams({ action: "tree" });
            if (params?.path)
                q.set("path", params.path);
            if (params?.max_depth != null)
                q.set("max_depth", String(params.max_depth));
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
        async readDocumentText(params) {
            const q = new URLSearchParams({ action: "read-text", file_path: params.file_path });
            if (params.tenant_id)
                q.set("tenant_id", params.tenant_id);
            return request("GET", `/api/v1/documents?${q.toString()}`);
        },
        async writeDocumentText(params) {
            const q = new URLSearchParams({ action: "write-text" });
            if (params.tenant_id)
                q.set("tenant_id", params.tenant_id);
            return request("PUT", `/api/v1/documents?${q.toString()}`, {
                file_path: params.file_path,
                content: params.content,
                ...(params.encoding !== undefined ? { encoding: params.encoding } : {}),
            });
        },
        async downloadDocument(params) {
            const q = new URLSearchParams({ file_path: params.file_path });
            if (params.tenant_id)
                q.set("tenant_id", params.tenant_id);
            const url = `${baseUrl}/api/v1/documents/download?${q.toString()}`;
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
    return client;
}
