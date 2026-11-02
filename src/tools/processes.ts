import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { objectRecord, processStatusEnum, stepLanguageEnum } from "./schemas.js";
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
        input: objectRecord.optional().describe("Process input payload"),
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
        status: processStatusEnum.optional().default("draft"),
        category: z.string().optional(),
        configuration: objectRecord.optional(),
        is_template: z.boolean().optional(),
        priority: z.string().optional(),
        executable_by_ai_agents: z.boolean().optional(),
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
        status: processStatusEnum.optional(),
        category: z.string().optional(),
        configuration: objectRecord.optional(),
        is_template: z.boolean().optional(),
        priority: z.string().optional(),
        executable_by_ai_agents: z.boolean().optional(),
      }),
    },
    async ({ process_id, ...body }, extra) => run(extra, (client) => client.updateProcess(process_id, body))
  );

  server.registerTool(
    "tealfabric_delete_process",
    {
      description: "Hard-delete a Tealfabric process by ID.",
      inputSchema: z.object({
        process_id: z.string().describe("Process ID"),
      }),
    },
    async ({ process_id }, extra) => run(extra, (client) => client.deleteProcess(process_id))
  );

  server.registerTool(
    "tealfabric_retire_process",
    {
      description:
        "Soft-retire a process (sets status inactive and prefixes name with <retired>). Prefer this over hard delete when preserving history.",
      inputSchema: z.object({
        process_id: z.string().describe("Process ID"),
      }),
    },
    async ({ process_id }, extra) => run(extra, (client) => client.retireProcess(process_id))
  );

  server.registerTool(
    "tealfabric_create_process_step",
    {
      description: "Create a new process step in a process flow. Returns the new step_id.",
      inputSchema: z.object({
        process_id: z.string().describe("Process ID to add the step to"),
        name: z.string().optional().describe("Step name (preferred)"),
        step_name: z.string().optional().describe("Alias for name"),
        step_type: z.string().optional().default("action"),
        description: z.string().optional(),
        code_snippet: z.string().optional(),
        sequence: z.number().optional(),
        sequence_order: z.number().optional(),
        input_schema: objectRecord.optional(),
        output_schema: objectRecord.optional(),
        configuration: objectRecord.optional(),
        language: stepLanguageEnum.optional(),
        execution_timeout: z.number().optional().describe("Execution timeout in seconds"),
      }),
    },
    async (args, extra) => {
      if (!args.name && !args.step_name) {
        return {
          content: [{ type: "text" as const, text: "Error: name or step_name is required" }],
        };
      }
      return run(extra, (client) => client.createProcessStep(args));
    }
  );

  server.registerTool(
    "tealfabric_update_process_step",
    {
      description: "Update an existing process step in a process flow.",
      inputSchema: z.object({
        step_id: z.string().describe("Step ID"),
        name: z.string().optional().describe("Step name (preferred)"),
        step_name: z.string().optional().describe("Alias for name"),
        step_type: z.string().optional(),
        description: z.string().optional(),
        code_snippet: z.string().optional(),
        sequence: z.number().optional(),
        sequence_order: z.number().optional(),
        position_x: z.number().optional(),
        position_y: z.number().optional(),
        input_schema: objectRecord.optional(),
        output_schema: objectRecord.optional(),
        configuration: objectRecord.optional(),
        language: stepLanguageEnum.optional(),
        execution_timeout: z.number().optional().describe("Execution timeout in seconds"),
      }),
    },
    async ({ step_id, ...body }, extra) => run(extra, (client) => client.updateProcessStep(step_id, body))
  );

  server.registerTool(
    "tealfabric_delete_process_step",
    {
      description: "Delete a process step by step_id.",
      inputSchema: z.object({
        step_id: z.string().describe("Step ID"),
      }),
    },
    async ({ step_id }, extra) => run(extra, (client) => client.deleteProcessStep(step_id))
  );
}
