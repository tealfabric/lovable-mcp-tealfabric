import { registerConnectorTools } from "./connectors.js";
import { registerDocumentTools } from "./documents.js";
import { registerIntegrationTools } from "./integrations.js";
import { registerProcessTools } from "./processes.js";
import { registerWebappTools } from "./webapps.js";
export function registerTealfabricTools(server, run) {
    registerConnectorTools(server, run);
    registerIntegrationTools(server, run);
    registerWebappTools(server, run);
    registerProcessTools(server, run);
    registerDocumentTools(server, run);
}
