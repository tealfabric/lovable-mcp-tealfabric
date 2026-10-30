/**
 * Tealfabric API client for the MCP server.
 * Factory client with retries/timeouts for Lovable Desktop (stdio/HTTP).
 * Aligned with backend-next REST contracts (webapps, integrations, processflow, documents).
 */

import { readFile } from "fs/promises";
import { basename } from "path";

export interface TealfabricClientOptions {
  baseUrl: string;
  apiKey: string;
  requestTimeoutMs: number;
  retryCount: number;
  retryBaseDelayMs: number;
  allowLocalFileUpload: boolean;
}

export type IntegrationType =
  | "api"
  | "webhook"
  | "message_queue"
  | "file_transfer"
  | "database"
  | "email"
  | "sms"
  | "other";

export type IntegrationStatus = "active" | "inactive" | "error" | "testing";

export type WebappType =
  | "webapp"
  | "webhook"
  | "websocket"
  | "callback"
  | "document-viewer"
  | "document_viewer";

export type ProcessStatus = "draft" | "active" | "inactive" | "archived";

export type AuthTransport = "cookie" | "bearer" | "both";

export type StepLanguage = "javascript" | "typescript" | "php";

export interface TealfabricClient {
  listConnectors(params?: {
    action?: "get" | "parameters";
    connector_id?: string;
  }): Promise<{ success: boolean; data?: unknown; connectors?: unknown[] }>;
  testConnector(params: {
    connector_id: string;
    configuration?: Record<string, unknown>;
  }): Promise<{ success: boolean; data?: unknown; error?: string }>;
  getConnectorOAuth2Required(connectorId: string): Promise<{
    success: boolean;
    oauth2_required?: boolean;
    authentication_type?: string;
  }>;
  listIntegrations(params?: {
    action?: "get" | "statistics" | "test" | "status" | "execution-history";
    integration_id?: string;
    execution_id?: string;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    is_active?: 0 | 1;
    page?: number;
    items_per_page?: 10 | 25 | 50 | 100;
    sort_by?: "name" | "type" | "status" | "is_active" | "created_at" | "updated_at";
    sort_direction?: "ASC" | "DESC";
  }): Promise<{ success: boolean; data?: unknown; integrations?: unknown[] }>;
  createIntegration(body: {
    name: string;
    type: IntegrationType | string;
    description?: string;
    connector_id?: string;
    status?: IntegrationStatus | string;
    is_active?: boolean;
    configuration?: Record<string, unknown>;
    connector_configuration?: Record<string, unknown>;
    executable_by_ai_agents?: boolean;
  }): Promise<{ success: boolean; data?: unknown; error?: string }>;
  updateIntegration(
    integrationId: string,
    body: {
      name?: string;
      type?: IntegrationType | string;
      description?: string;
      connector_id?: string;
      status?: IntegrationStatus | string;
      is_active?: boolean;
      configuration?: Record<string, unknown>;
      connector_configuration?: Record<string, unknown>;
      executable_by_ai_agents?: boolean;
    }
  ): Promise<{ success: boolean; data?: unknown; error?: string }>;
  executeIntegration(params: {
    integration_id: string;
    data?: Record<string, unknown>;
    async?: boolean;
  }): Promise<{ success: boolean; data?: unknown; error?: string }>;
  deleteIntegration(integrationId: string): Promise<{ success: boolean; message?: string }>;
  listWebapps(params?: {
    search?: string;
    page?: number;
    items_per_page?: 10 | 25 | 50 | 100;
    type?: string;
    published_only?: boolean;
    process_id?: string;
    sort_by?: "name" | "type" | "created_at" | "updated_at" | "version";
    sort_direction?: "ASC" | "DESC";
  }): Promise<{ success: boolean; webapps?: unknown[]; data?: unknown; count?: number }>;
  getWebapp(webappId: string, version?: number): Promise<{ success: boolean; webapp?: unknown }>;
  createWebapp(body: {
    name: string;
    type: WebappType | string;
    page_content: string;
    webapp_user_id: string;
    description?: string;
    code_snippet?: string;
    page_head?: string;
    page_header?: string;
    page_footer?: string;
    custom_css?: string;
    custom_js?: string;
    process_id?: string;
    version?: number;
    is_published?: boolean;
    http_headers?: unknown;
    custom_security_policy?: string;
    custom_referrer_policy?: string;
    auth_transport?: AuthTransport;
    auth_require?: boolean;
    public_uri_host?: string;
    public_uri_path?: string;
    public_uris?: unknown;
  }): Promise<{
    success: boolean;
    webapp_id?: string;
    webapp?: { webapp_id: string };
    error?: string;
    errors?: string[];
  }>;
  updateWebapp(
    webappId: string,
    body: {
      name?: string;
      description?: string;
      webapp_user_id?: string;
      process_id?: string | null;
      page_content?: string;
      code_snippet?: string;
      page_head?: string;
      page_header?: string;
      page_footer?: string;
      custom_css?: string;
      custom_js?: string;
      http_headers?: unknown;
      custom_security_policy?: string;
      custom_referrer_policy?: string;
      auth_transport?: AuthTransport;
      auth_require?: boolean;
      public_uri_host?: string;
      public_uri_path?: string;
      public_uris?: unknown;
      version?: number;
      version_id?: string | number;
    }
  ): Promise<{ success: boolean; webapp?: unknown; error?: string }>;
  publishWebapp(webappId: string, version: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    errors?: string[];
  }>;
  unpublishWebapp(webappId: string): Promise<{ success: boolean; message?: string; error?: string }>;
  createWebappVersion(webappId: string): Promise<{
    success: boolean;
    version?: number;
    message?: string;
    error?: string;
  }>;
  deleteWebapp(webappId: string): Promise<{ success: boolean; message?: string; error?: string }>;
  listProcesses(): Promise<{ success: boolean; processes?: unknown[]; data?: unknown }>;
  getProcess(processId: string): Promise<{ success: boolean; process?: unknown; data?: unknown }>;
  listProcessSteps(processId: string): Promise<{ success: boolean; steps?: unknown[]; data?: unknown }>;
  getProcessStep(stepId: string): Promise<{ success: boolean; step?: unknown; data?: unknown }>;
  executeProcess(
    processId: string,
    input?: Record<string, unknown>
  ): Promise<{ success: boolean; result?: unknown; error?: string }>;
  createProcess(body: {
    name: string;
    description?: string;
    type?: string;
    status?: ProcessStatus;
    category?: string;
    configuration?: Record<string, unknown>;
    is_template?: boolean;
    priority?: string;
    executable_by_ai_agents?: boolean;
  }): Promise<{ success: boolean; data?: { process_id?: string }; error?: string }>;
  updateProcess(
    processId: string,
    body: {
      name?: string;
      description?: string;
      type?: string;
      status?: ProcessStatus;
      category?: string;
      configuration?: Record<string, unknown>;
      is_template?: boolean;
      priority?: string;
      executable_by_ai_agents?: boolean;
    }
  ): Promise<{ success: boolean; data?: unknown; error?: string }>;
  deleteProcess(processId: string): Promise<{ success: boolean; data?: unknown; message?: string }>;
  retireProcess(processId: string): Promise<{ success: boolean; data?: unknown; error?: string }>;
  createProcessStep(body: {
    process_id: string;
    name?: string;
    step_name?: string;
    step_type?: string;
    description?: string;
    code_snippet?: string;
    sequence?: number;
    sequence_order?: number;
    input_schema?: Record<string, unknown>;
    output_schema?: Record<string, unknown>;
    configuration?: Record<string, unknown>;
    language?: StepLanguage | string;
    execution_timeout?: number;
  }): Promise<{ success: boolean; data?: { step_id?: string }; error?: string }>;
  updateProcessStep(
    stepId: string,
    body: {
      name?: string;
      step_name?: string;
      step_type?: string;
      description?: string;
      code_snippet?: string;
      sequence?: number;
      sequence_order?: number;
      position_x?: number;
      position_y?: number;
      input_schema?: Record<string, unknown>;
      output_schema?: Record<string, unknown>;
      configuration?: Record<string, unknown>;
      language?: StepLanguage | string;
      execution_timeout?: number;
    }
  ): Promise<{ success: boolean; data?: unknown; error?: string }>;
  deleteProcessStep(stepId: string): Promise<{ success: boolean; data?: unknown; message?: string }>;
  listDocuments(params?: { path?: string; tenant_id?: string }): Promise<{ success: boolean; data?: unknown }>;
  listDocumentTree(params?: {
    path?: string;
    max_depth?: number;
    tenant_id?: string;
  }): Promise<{ success: boolean; data?: unknown }>;
  getDocumentMetadata(params: { file_path: string; tenant_id?: string }): Promise<{
    success: boolean;
    data?: unknown;
  }>;
  readDocumentText(params: { file_path: string; tenant_id?: string }): Promise<{
    success: boolean;
    data?: unknown;
  }>;
  writeDocumentText(params: {
    file_path: string;
    content: string;
    encoding?: string;
    tenant_id?: string;
  }): Promise<{ success: boolean; data?: unknown }>;
  downloadDocument(params: { file_path: string; tenant_id?: string }): Promise<{
    success: boolean;
    data?: unknown;
  }>;
  uploadDocument(params: {
    destination_path: string;
    file_path: string;
    tenant_id?: string;
  }): Promise<{ success: boolean; data?: unknown }>;
  moveDocument(params: {
    old_path: string;
    new_path: string;
    tenant_id?: string;
  }): Promise<{ success: boolean; data?: unknown }>;
  deleteDocument(params: { path: string; tenant_id?: string }): Promise<{ success: boolean }>;
}

const retryableStatusCodes = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("aborted")
  );
};

function jsonHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
  };
}

function apiKeyHeaders(apiKey: string): Record<string, string> {
  return { "X-API-Key": apiKey };
}

function parseFilenameFromContentDisposition(header: string | null): string | undefined {
  if (!header) return undefined;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim().replace(/^"(.*)"$/, "$1"));
    } catch {
      return utf8Match[1].trim().replace(/^"(.*)"$/, "$1");
    }
  }

  const plainMatch = header.match(/filename=([^;]+)/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim().replace(/^"(.*)"$/, "$1");
  }

  return undefined;
}

export function createTealfabricClient(options: TealfabricClientOptions): TealfabricClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "");

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    const maxAttempts = options.retryCount + 1;
    let lastError: unknown;

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

        if (!text) return undefined as T;
        try {
          return JSON.parse(text) as T;
        } catch {
          return text as unknown as T;
        }
      } catch (err) {
        lastError = err;
        if (attempt >= maxAttempts || !isRetryableError(err)) {
          throw err;
        }
        const jitter = Math.floor(Math.random() * 100);
        await sleep(options.retryBaseDelayMs * attempt + jitter);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Unknown Tealfabric request error");
  }

  const client: TealfabricClient = {

  // --- Connectors ---
  async listConnectors(params?: {
    action?: "get" | "parameters";
    connector_id?: string;
  }) {
    const q = new URLSearchParams();
    if (params?.action) q.set("action", params.action);
    if (params?.connector_id) q.set("connector_id", params.connector_id);
    return request<{ success: boolean; data?: unknown; connectors?: unknown[] }>(
      "GET",
      `/api/v1/connectors${q.toString() ? `?${q.toString()}` : ""}`
    );
  },

  async testConnector(params: {
    connector_id: string;
    configuration?: Record<string, unknown>;
  }) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "POST",
      "/api/v1/connectors?action=test",
      {
        connector_id: params.connector_id,
        ...(params.configuration !== undefined
          ? { configuration: params.configuration }
          : {}),
      }
    );
  },

  async getConnectorOAuth2Required(connectorId: string) {
    return request<{
      success: boolean;
      oauth2_required?: boolean;
      authentication_type?: string;
    }>("GET", `/api/v1/connectors/${encodeURIComponent(connectorId)}/oauth2-required`);
  },

  // --- Integrations ---
  async listIntegrations(params?: {
    action?: "get" | "statistics" | "test" | "status" | "execution-history";
    integration_id?: string;
    execution_id?: string;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    is_active?: 0 | 1;
    page?: number;
    items_per_page?: 10 | 25 | 50 | 100;
    sort_by?: "name" | "type" | "status" | "is_active" | "created_at" | "updated_at";
    sort_direction?: "ASC" | "DESC";
  }) {
    const q = new URLSearchParams();
    if (params?.action) q.set("action", params.action);
    if (params?.integration_id) q.set("integration_id", params.integration_id);
    if (params?.execution_id) q.set("execution_id", params.execution_id);
    if (params?.limit != null) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    if (params?.type) q.set("type", params.type);
    if (params?.status) q.set("status", params.status);
    if (params?.is_active != null) q.set("is_active", String(params.is_active));
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.items_per_page != null) q.set("items_per_page", String(params.items_per_page));
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.sort_direction) q.set("sort_direction", params.sort_direction);
    return request<{ success: boolean; data?: unknown; integrations?: unknown[] }>(
      "GET",
      `/api/v1/integrations${q.toString() ? `?${q.toString()}` : ""}`
    );
  },

  async createIntegration(body: {
    name: string;
    type: IntegrationType | string;
    description?: string;
    connector_id?: string;
    status?: IntegrationStatus | string;
    is_active?: boolean;
    configuration?: Record<string, unknown>;
    connector_configuration?: Record<string, unknown>;
    executable_by_ai_agents?: boolean;
  }) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "POST",
      "/api/v1/integrations?action=create",
      body
    );
  },

  async updateIntegration(
    integrationId: string,
    body: {
      name?: string;
      type?: IntegrationType | string;
      description?: string;
      connector_id?: string;
      status?: IntegrationStatus | string;
      is_active?: boolean;
      configuration?: Record<string, unknown>;
      connector_configuration?: Record<string, unknown>;
      executable_by_ai_agents?: boolean;
    }
  ) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "PUT",
      "/api/v1/integrations?action=update",
      { integration_id: integrationId, ...body }
    );
  },

  async executeIntegration(params: {
    integration_id: string;
    data?: Record<string, unknown>;
    async?: boolean;
  }) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "POST",
      "/api/v1/integrations?action=execute",
      {
        integration_id: params.integration_id,
        ...(params.data !== undefined ? { data: params.data } : {}),
        ...(params.async !== undefined ? { async: params.async } : {}),
      }
    );
  },

  async deleteIntegration(integrationId: string) {
    return request<{ success: boolean; message?: string }>(
      "DELETE",
      "/api/v1/integrations?action=delete",
      { integration_id: integrationId }
    );
  },

  // --- Webapps ---
  async listWebapps(params?: {
    search?: string;
    page?: number;
    items_per_page?: 10 | 25 | 50 | 100;
    type?: string;
    published_only?: boolean;
    process_id?: string;
    sort_by?: "name" | "type" | "created_at" | "updated_at" | "version";
    sort_direction?: "ASC" | "DESC";
  }) {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.items_per_page != null) q.set("items_per_page", String(params.items_per_page));
    if (params?.type) q.set("type", params.type);
    if (params?.published_only != null) q.set("published_only", params.published_only ? "1" : "0");
    if (params?.process_id) q.set("process_id", params.process_id);
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.sort_direction) q.set("sort_direction", params.sort_direction);
    const query = q.toString();
    return request<{ success: boolean; webapps?: unknown[]; data?: unknown; count?: number }>(
      "GET",
      `/api/v1/webapps${query ? `?${query}` : ""}`
    );
  },

  async getWebapp(webappId: string, version?: number) {
    const q = version != null ? `?version=${version}` : "";
    return request<{ success: boolean; webapp?: unknown }>(
      "GET",
      `/api/v1/webapps/${encodeURIComponent(webappId)}${q}`
    );
  },

  async createWebapp(body: {
    name: string;
    type: WebappType | string;
    page_content: string;
    webapp_user_id: string;
    description?: string;
    code_snippet?: string;
    page_head?: string;
    page_header?: string;
    page_footer?: string;
    custom_css?: string;
    custom_js?: string;
    process_id?: string;
    version?: number;
    is_published?: boolean;
    http_headers?: unknown;
    custom_security_policy?: string;
    custom_referrer_policy?: string;
    auth_transport?: AuthTransport;
    auth_require?: boolean;
    public_uri_host?: string;
    public_uri_path?: string;
    public_uris?: unknown;
  }) {
    return request<{
      success: boolean;
      webapp_id?: string;
      webapp?: { webapp_id: string };
      error?: string;
      errors?: string[];
    }>("POST", "/api/v1/webapps", body);
  },

  async updateWebapp(
    webappId: string,
    body: {
      name?: string;
      description?: string;
      webapp_user_id?: string;
      process_id?: string | null;
      page_content?: string;
      code_snippet?: string;
      page_head?: string;
      page_header?: string;
      page_footer?: string;
      custom_css?: string;
      custom_js?: string;
      http_headers?: unknown;
      custom_security_policy?: string;
      custom_referrer_policy?: string;
      auth_transport?: AuthTransport;
      auth_require?: boolean;
      public_uri_host?: string;
      public_uri_path?: string;
      public_uris?: unknown;
      version?: number;
      version_id?: string | number;
    }
  ) {
    return request<{ success: boolean; webapp?: unknown; error?: string }>(
      "PUT",
      `/api/v1/webapps/${encodeURIComponent(webappId)}`,
      body
    );
  },

  async publishWebapp(webappId: string, version: number) {
    return request<{ success: boolean; message?: string; error?: string; errors?: string[] }>(
      "POST",
      `/api/v1/webapps/${encodeURIComponent(webappId)}/publish`,
      { version }
    );
  },

  async unpublishWebapp(webappId: string) {
    return request<{ success: boolean; message?: string; error?: string }>(
      "POST",
      `/api/v1/webapps/${encodeURIComponent(webappId)}/unpublish`,
      {}
    );
  },

  async createWebappVersion(webappId: string) {
    return request<{ success: boolean; version?: number; message?: string; error?: string }>(
      "POST",
      `/api/v1/webapps/${encodeURIComponent(webappId)}/version`,
      {}
    );
  },

  async deleteWebapp(webappId: string) {
    return request<{ success: boolean; message?: string; error?: string }>(
      "DELETE",
      `/api/v1/webapps/${encodeURIComponent(webappId)}`
    );
  },

  // --- Processes ---
  async listProcesses() {
    return request<{ success: boolean; processes?: unknown[]; data?: unknown }>(
      "GET",
      "/api/v1/processflow?action=processes"
    );
  },

  async getProcess(processId: string) {
    return request<{ success: boolean; process?: unknown; data?: unknown }>(
      "GET",
      `/api/v1/processflow?action=process&process_id=${encodeURIComponent(processId)}`
    );
  },

  async listProcessSteps(processId: string) {
    return request<{ success: boolean; steps?: unknown[]; data?: unknown }>(
      "GET",
      `/api/v1/processflow?action=steps&process_id=${encodeURIComponent(processId)}`
    );
  },

  async getProcessStep(stepId: string) {
    return request<{ success: boolean; step?: unknown; data?: unknown }>(
      "GET",
      `/api/v1/processflow?action=step&step_id=${encodeURIComponent(stepId)}`
    );
  },

  async executeProcess(processId: string, input?: Record<string, unknown>) {
    return request<{ success: boolean; result?: unknown; error?: string }>(
      "POST",
      "/api/v1/processflow?action=execute-process",
      { process_id: processId, input_data: input ?? {} }
    );
  },

  async createProcess(body: {
    name: string;
    description?: string;
    type?: string;
    status?: ProcessStatus;
    category?: string;
    configuration?: Record<string, unknown>;
    is_template?: boolean;
    priority?: string;
    executable_by_ai_agents?: boolean;
  }) {
    return request<{ success: boolean; data?: { process_id?: string }; error?: string }>(
      "POST",
      "/api/v1/processes?action=create",
      body
    );
  },

  async updateProcess(
    processId: string,
    body: {
      name?: string;
      description?: string;
      type?: string;
      status?: ProcessStatus;
      category?: string;
      configuration?: Record<string, unknown>;
      is_template?: boolean;
      priority?: string;
      executable_by_ai_agents?: boolean;
    }
  ) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "PUT",
      "/api/v1/processes?action=update",
      { process_id: processId, ...body }
    );
  },

  async deleteProcess(processId: string) {
    return request<{ success: boolean; data?: unknown; message?: string }>(
      "DELETE",
      "/api/v1/processes?action=delete",
      { process_id: processId }
    );
  },

  /**
   * Soft-retire a process (mirrors ProcessflowService.retireProcess).
   * No tenant REST retire route exists; implemented via get + update.
   */
  async retireProcess(processId: string) {
    const got = await client.getProcess(processId);
    const process =
      (got as { process?: Record<string, unknown>; data?: Record<string, unknown> }).process ??
      (got as { data?: Record<string, unknown> }).data ??
      (got as Record<string, unknown>);
    const currentName = String(
      (process as { name?: unknown })?.name ?? ""
    ).trim();
    if (!currentName && !(got as { success?: boolean }).success) {
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

  async createProcessStep(body: {
    process_id: string;
    name?: string;
    step_name?: string;
    step_type?: string;
    description?: string;
    code_snippet?: string;
    sequence?: number;
    sequence_order?: number;
    input_schema?: Record<string, unknown>;
    output_schema?: Record<string, unknown>;
    configuration?: Record<string, unknown>;
    language?: StepLanguage | string;
    execution_timeout?: number;
  }) {
    const { name, step_name, ...rest } = body;
    const resolvedName = name ?? step_name;
    return request<{ success: boolean; data?: { step_id?: string }; error?: string }>(
      "POST",
      "/api/v1/processes?action=create-step",
      {
        ...rest,
        ...(resolvedName !== undefined ? { name: resolvedName, step_name: resolvedName } : {}),
      }
    );
  },

  async updateProcessStep(
    stepId: string,
    body: {
      name?: string;
      step_name?: string;
      step_type?: string;
      description?: string;
      code_snippet?: string;
      sequence?: number;
      sequence_order?: number;
      position_x?: number;
      position_y?: number;
      input_schema?: Record<string, unknown>;
      output_schema?: Record<string, unknown>;
      configuration?: Record<string, unknown>;
      language?: StepLanguage | string;
      execution_timeout?: number;
    }
  ) {
    const { name, step_name, ...rest } = body;
    const resolvedName = name ?? step_name;
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "PUT",
      "/api/v1/processes?action=update-step",
      {
        step_id: stepId,
        ...rest,
        ...(resolvedName !== undefined ? { name: resolvedName, step_name: resolvedName } : {}),
      }
    );
  },

  async deleteProcessStep(stepId: string) {
    return request<{ success: boolean; data?: unknown; message?: string }>(
      "DELETE",
      "/api/v1/processes?action=delete-step",
      { step_id: stepId }
    );
  },

  // --- Documents ---
  // Note: tenant_id query params are ignored by the API (auth tenant wins).
  async listDocuments(params?: { path?: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "list" });
    if (params?.path) q.set("path", params.path);
    if (params?.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "GET",
      `/api/v1/documents?${q.toString()}`
    );
  },

  async listDocumentTree(params?: {
    path?: string;
    max_depth?: number;
    tenant_id?: string;
  }) {
    const q = new URLSearchParams({ action: "tree" });
    if (params?.path) q.set("path", params.path);
    if (params?.max_depth != null) q.set("max_depth", String(params.max_depth));
    if (params?.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "GET",
      `/api/v1/documents?${q.toString()}`
    );
  },

  async getDocumentMetadata(params: { file_path: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "metadata", file_path: params.file_path });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "GET",
      `/api/v1/documents?${q.toString()}`
    );
  },

  async readDocumentText(params: { file_path: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "read-text", file_path: params.file_path });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "GET",
      `/api/v1/documents?${q.toString()}`
    );
  },

  async writeDocumentText(params: {
    file_path: string;
    content: string;
    encoding?: string;
    tenant_id?: string;
  }) {
    const q = new URLSearchParams({ action: "write-text" });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "PUT",
      `/api/v1/documents?${q.toString()}`,
      {
        file_path: params.file_path,
        content: params.content,
        ...(params.encoding !== undefined ? { encoding: params.encoding } : {}),
      }
    );
  },


  async downloadDocument(params: { file_path: string; tenant_id?: string }) {
    const q = new URLSearchParams({ file_path: params.file_path });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
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
        return (await res.json()) as { success: boolean; data?: unknown };
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      const filename =
        parseFilenameFromContentDisposition(res.headers.get("content-disposition")) ||
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
    } finally {
      clearTimeout(timeout);
    }
  },


  async uploadDocument(params: {
    destination_path: string;
    file_path: string;
    tenant_id?: string;
  }) {
    if (!options.allowLocalFileUpload) {
      throw new Error(
        "Local file upload is disabled. Set TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD=true to enable tealfabric_upload_document."
      );
    }

    const q = new URLSearchParams({ action: "upload" });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
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
      if (!text) return { success: true };
      try {
        return JSON.parse(text) as { success: boolean; data?: unknown };
      } catch {
        return { success: true, data: text };
      }
    } finally {
      clearTimeout(timeout);
    }
  },

  async moveDocument(params: {
    old_path: string;
    new_path: string;
    tenant_id?: string;
  }) {
    const q = new URLSearchParams({ action: "move" });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "PUT",
      `/api/v1/documents?${q.toString()}`,
      { old_path: params.old_path, new_path: params.new_path }
    );
  },

  async deleteDocument(params: { path: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "delete", path: params.path });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean }>("DELETE", `/api/v1/documents?${q.toString()}`);
  },
  };

  return client;
}
