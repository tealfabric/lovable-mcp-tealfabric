import type { TealfabricClient } from "../client.js";
import type { ToolExtra } from "../runtime.js";

export type ToolContent = Array<{ type: "text"; text: string }>;

export type ToolRunner = (
  extra: ToolExtra,
  execute: (client: TealfabricClient) => Promise<unknown>
) => Promise<{ content: ToolContent }>;
