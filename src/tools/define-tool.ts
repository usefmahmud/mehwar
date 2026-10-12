import { z } from "zod";
import type { Tool } from "./types";
import { ToolError } from "./tool-error";

export function defineTool<TSchema extends z.ZodType>(
  tool: Tool<TSchema>,
): Tool<TSchema> {
  return {
    ...tool,
    execute: async (args, ctx) => {
      try {
        return await tool.execute(args, ctx);
      } catch (err) {
        if (err instanceof ToolError) {
          return err.message;
        }
        throw err;
      }
    },
  };
}
