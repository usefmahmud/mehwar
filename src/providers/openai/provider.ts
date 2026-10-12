import OpenAI from "openai";
import type { LLMProvider, ProviderRequest, ProviderChunk } from "../types";
import { toOpenAIMessages, toOpenAITool } from "./utils";

type Config = { apiKey: string; model: string; baseURL?: string };
type Pending = { id: string; name: string; args: string };

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(private config: Config) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async *stream(req: ProviderRequest): AsyncIterable<ProviderChunk> {
    const stream = await this.client.chat.completions.create(
      {
        model: this.config.model,
        messages: toOpenAIMessages(req),
        tools: req.tools?.map(toOpenAITool),
        stream: true,
        stream_options: {
          include_usage: true,
        },
      },
      {
        signal: req.signal,
      },
    );

    const pending = new Map<number, Pending>();
    let finish: string | null = null;
    let usage: { promptTokens: number; completionTokens: number } | null = null;

    for await (const chunk of stream) {
      if (chunk.usage) {
        usage = {
          promptTokens: chunk.usage.prompt_tokens,
          completionTokens: chunk.usage.completion_tokens,
        };
      }

      const choice = chunk.choices[0];

      if (!choice) continue;

      if (choice.delta.content) {
        yield { type: "text", delta: choice.delta.content };
      }

      for (const toolCall of choice.delta.tool_calls ?? []) {
        const cur = pending.get(toolCall.index) ?? {
          id: "",
          name: "",
          args: "",
        };

        cur.id ||= toolCall.id ?? "";
        cur.name ||= toolCall.function?.name ?? "";
        cur.args += toolCall.function?.arguments ?? "";

        pending.set(toolCall.index, cur);
      }

      if (choice.finish_reason) {
        finish = choice.finish_reason;
      }
    }

    for (const [, toolCall] of pending) {
      let args: unknown;

      try {
        args = toolCall.args ? JSON.parse(toolCall.args) : {};
      } catch (err) {
        yield {
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        };
        return;
      }
      yield { type: "tool_call", id: toolCall.id, name: toolCall.name, args };
    }

    if (usage) {
      yield { type: "usage", ...usage };
    }

    yield { type: "done", reason: mapFinish(finish) };
  }
}

const mapFinish = (
  reason: string | null,
): "stop" | "tool_calls" | "length" | "error" => {
  if (reason === "stop" || reason === "tool_calls" || reason === "length") {
    return reason;
  }

  return "error";
};
