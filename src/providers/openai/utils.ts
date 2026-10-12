import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions/completions.js";
import type { ProviderRequest, ToolDefinition } from "../types";

export const toOpenAIMessages = (
  req: ProviderRequest,
): ChatCompletionMessageParam[] => {
  const out: ChatCompletionMessageParam[] = [];

  if (req.system) out.push({ role: "system", content: req.system });

  for (const message of req.messages) {
    if (message.role === "user") {
      const text = message.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      out.push({ role: "user", content: text });
      continue;
    }

    if (message.role === "assistant") {
      const text = message.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
      const calls = message.content.filter((b) => b.type === "tool_call");

      out.push({
        role: "assistant",
        content: text || null,
        ...(calls.length && {
          tool_calls: calls.map((c) => ({
            id: c.id,
            type: "function" as const,
            function: { name: c.name, arguments: JSON.stringify(c.args ?? {}) },
          })),
        }),
      });
      continue;
    }

    for (const b of message.content) {
      if (b.type === "tool_result") {
        out.push({
          role: "tool",
          tool_call_id: b.callId,
          content: b.isError ? `Error: ${b.output}` : b.output,
        });
      }
    }
  }

  return out;
};

export const toOpenAITool = (def: ToolDefinition): ChatCompletionTool => {
  return {
    type: "function",
    function: {
      name: def.name,
      description: def.description,
      parameters: def.parameters,
    },
  };
};
