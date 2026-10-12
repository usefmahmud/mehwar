import type { Message } from "../core/types";

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ProviderRequest = {
  system?: string;
  messages: Message[];
  tools: ToolDefinition[];
  signal?: AbortSignal;
};

export type ProviderChunk =
  | { type: "text"; delta: string }
  | { type: "tool_call"; id: string; name: string; args: unknown }
  | { type: "usage"; promptTokens: number; completionTokens: number }
  | { type: "error"; message: string }
  | { type: "done"; reason: "stop" | "tool_calls" | "length" | "error" };

export interface LLMProvider {
  stream(req: ProviderRequest): AsyncIterable<ProviderChunk>;
}
