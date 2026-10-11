import { z } from "zod";
import type { Tool } from "./types";

export function defineTool<TSchema extends z.ZodType>(
  tool: Tool<TSchema>,
): Tool<TSchema> {
  return tool;
}
