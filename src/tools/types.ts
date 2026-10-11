import type z from "zod";

export interface ToolContext {
  cwd: string;
  signal: AbortSignal; // to cancel the tool execution
}

export interface Tool<TSchema extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  parameters: TSchema;
  execute(args: z.infer<TSchema>, ctx: ToolContext): Promise<string>;
}
