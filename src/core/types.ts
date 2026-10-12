export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_call"; id: string; name: string; args: unknown }
  | { type: "tool_result"; callId: string; output: string; isError: boolean };

export type Message = {
  role: "user" | "assistant" | "tool";
  content: ContentBlock[];
};

export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "tool_call"; id: string; name: string; args: unknown }
  | { type: "tool_result"; callId: string; output: string; isError: boolean }
  | { type: "error"; message: string }
  | { type: "done" };
