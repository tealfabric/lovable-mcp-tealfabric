import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolRunner } from "./types.js";

export function registerProcessTools(server: McpServer, run: ToolRunner): void {
  server.registerTool(
    "tealfabric_list_processes",
    {
      description: "List Tealfabric ProcessFlow processes for the authenticated tenant.",
      inputSchema: z.object({}),
    },
    async (_, extra) => run(extra, (client) => client.listProcesses())
  );

  server.registerTool(
    "tealfabric_get_process",
    {
      description: "Get a single Tealfabric process by ID.",
      inputSchema: z.object({ process_id: z.string().describe("Process ID") }),
    },
    async ({ process_id }, extra) => run(extra, (client) => client.getProcess(process_id))
  );

  server.registerTool(
    "tealfabric_list_process_steps",
    {
      description: "List process steps for a given process.",
      inputSchema: z.object({ process_id: z.string().describe("Process ID") }),
    },
    async ({ process_id }, extra) => run(extra, (client) => client.listProcessSteps(process_id))
  );

  server.registerTool(
    "tealfabric_get_process_step",
    {
      description: "Get a single process step by step_id.",
      inputSchema: z.object({ step_id: z.string().describe("Step ID") }),
    },
    async ({ step_id }, extra) => run(extra, (client) => client.getProcessStep(step_id))
  );

  server.registerTool(
    "tealfabric_execute_process",
    {
      description: "Execute a Tealfabric process with optional input.",
      inputSchema: z.object({
        process_id: z.string().describe("Process ID"),
        input: z.record(z.unknown()).optional().describe("Process input payload"),
      }),
    },
    async ({ process_id, input }, extra) => run(extra, (client) => client.executeProcess(process_id, input))
  );

  server.registerTool(
    "tealfabric_create_process",
    {
      description: "Create a new Tealfabric process (process flow). Returns the new process_id.",
      inputSchema: z.object({
        name: z.string().describe("Process name"),
        description: z.string().optional(),
        type: z.string().optional(),
        status: z.enum(["draft", "active", "inactive", "archived"]).optional().default("draft"),
        version: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        configuration: z.record(z.unknown()).optional(),
        is_template: z.boolean().optional(),
        template_id: z.string().optional(),
        estimated_duration: z.number().optional(),
        priority: z.string().optional(),
      }),
    },
    async (args, extra) => run(extra, (client) => client.createProcess(args))
  );

  server.registerTool(
    "tealfabric_update_process",
    {
      description: "Update an existing Tealfabric process (process flow).",
      inputSchema: z.object({
        process_id: z.string().describe("Process ID"),
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.string().optional(),
        status: z.enum(["draft", "active", "inactive", "archived"]).optional(),
        version: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        configuration: z.record(z.unknown()).optional(),
        is_template: z.boolean().optional(),
        template_id: z.string().optional(),
        estimated_duration: z.number().optional(),
        priority: z.string().optional(),
      }),
    },
    async ({ process_id, ...body }, extra) => run(extra, (client) => client.updateProcess(process_id, body))
  );

  server.registerTool(
    "tealfabric_create_process_step",
    {
      description: "Create a new process step in a process flow. Returns the new step_id.",
      inputSchema: z.object({
        process_id: z.string().describe("Process ID to add the step to"),
        step_name: z.string().describe("Step name"),
        name: z.string().optional().describe("Alias for step_name"),
        step_type: z.string().optional().default("action"),
        description: z.string().optional(),
        code_snippet: z.string().optional(),
        sequence: z.number().optional(),
        position_x: z.number().optional(),
        position_y: z.number().optional(),
        estimated_duration: z.number().optional(),
        assigned_user_id: z.string().optional(),
        step_status: z.string().optional(),
        input_schema: z.record(z.unknown()).optional(),
        output_schema: z.record(z.unknown()).optional(),
        configuration: z.record(z.unknown()).optional(),
      }),
    },
    async (args, extra) => run(extra, (client) => client.createProcessStep(args))
  );

  server.registerTool(
    "tealfabric_update_process_step",
    {
      description: "Update an existing process step in a process flow.",
      inputSchema: z.object({
        step_id: z.string().describe("Step ID"),
        step_name: z.string().optional(),
        name: z.string().optional().describe("Alias for step_name"),
        step_type: z.string().optional(),
        description: z.string().optional(),
        code_snippet: z.string().optional(),
        sequence: z.number().optional(),
        position_x: z.number().optional(),
        position_y: z.number().optional(),
        estimated_duration: z.number().optional(),
        assigned_user_id: z.string().optional(),
        step_status: z.string().optional(),
        input_schema: z.record(z.unknown()).optional(),
        output_schema: z.record(z.unknown()).optional(),
        configuration: z.record(z.unknown()).optional(),
      }),
    },
    async ({ step_id, ...body }, extra) => run(extra, (client) => client.updateProcessStep(step_id, body))
  );
}
