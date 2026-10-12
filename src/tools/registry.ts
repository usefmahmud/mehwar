import { z } from "zod";
import type { ToolDefinition } from "../providers/types";
import type { Tool, ToolContext } from "./types";
import { ToolError } from "./tool-error";

export type ToolOutcome = { output: string; isError: boolean };

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool) {
    this.tools.set(tool.name, tool);
    return this;
  }

  definitions(): ToolDefinition[] {
    return [...this.tools.values()].map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: z.toJSONSchema(tool.parameters) as Record<string, unknown>,
    }));
  }

  async execute(
    name: string,
    args: unknown,
    ctx: ToolContext,
  ): Promise<ToolOutcome> {
    const tool = this.tools.get(name);
    if (!tool) return { output: `Unknown tool "${name}"`, isError: true };

    const parsed = tool.parameters.safeParse(args);
    if (!parsed.success) {
      return {
        output: `Invalid arguments: ${z.prettifyError(parsed.error)}`,
        isError: true,
      };
    }

    try {
      return { output: await tool.execute(parsed.data, ctx), isError: false };
    } catch (err) {
      if (err instanceof ToolError) {
        return { output: err.message, isError: true };
      }

      const message = err instanceof Error ? err.message : String(err);
      return {
        output: `Tool "${name}" failed unexpectedly: ${message}`,
        isError: true,
      };
    }
  }
}
