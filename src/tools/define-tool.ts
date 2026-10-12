import { z } from "zod";
import type { Tool } from "./types";

export const defineTool = <TSchema extends z.ZodType>(tool: Tool<TSchema>) => {
  return tool;
};
