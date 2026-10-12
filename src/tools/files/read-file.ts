import fs from "fs/promises";
import path from "path";
import z from "zod";
import { defineTool } from "../define-tool";
import { ToolError } from "../tool-error";
import { fsFailure, isInside } from "./utils";

const MAX_READ_LINES = 1000;
const BINARY_SNIFF_BYTES = 8192;

export const readFile = defineTool({
  name: "read_file",
  description: [
    "Reads the content of a file and returns it as text with line numbers.",
    "Use this when you need to inspect a file's contents, such as source code, configuration, logs, or documentation, before editing or reasoning about it.",
    "Notes:",
    "- `file_path` may be absolute, or relative to the working directory (`ctx.cwd`).",
    "- Paths outside the working directory are rejected, including via `..` traversal or symlinks.",
    "- If the path is a directory, the tool tells you to use a directory-listing tool instead.",
    "- Intended for text files; binary files are refused.",
    `- At most ${MAX_READ_LINES} lines are returned; longer files are truncated with a note.`,
    "- This tool only reads; it never modifies the file.",
  ].join("\n"),
  parameters: z.object({
    file_path: z.string().describe("The path to the file to read."),
  }),
  execute: async (args, ctx) => {
    const resolvedPath = path.resolve(ctx.cwd, args.file_path);
    if (!isInside(ctx.cwd, resolvedPath)) {
      throw new ToolError(
        `"${args.file_path}" resolves outside the working directory (${ctx.cwd}). Only files inside the working directory can be read.`,
      );
    }

    const stats = await fs
      .stat(resolvedPath)
      .catch((err) => fsFailure(err, args.file_path));
    if (stats.isDirectory()) {
      throw new ToolError(
        `"${args.file_path}" is a directory, not a file. Use a directory-listing tool to see its contents.`,
      );
    }

    const [realPath, realCwd] = await Promise.all([
      fs.realpath(resolvedPath),
      fs.realpath(ctx.cwd),
    ]);
    if (!isInside(realCwd, realPath)) {
      throw new ToolError(
        `"${args.file_path}" is a symlink that resolves outside the working directory (${ctx.cwd}).`,
      );
    }

    const buffer = await fs
      .readFile(resolvedPath)
      .catch((err) => fsFailure(err, args.file_path));
    if (buffer.subarray(0, BINARY_SNIFF_BYTES).includes(0)) {
      throw new ToolError(
        `"${args.file_path}" appears to be a binary file. read_file only supports text files.`,
      );
    }

    const content = buffer.toString("utf8");
    if (content.length === 0) {
      return `File is empty: ${args.file_path}`;
    }

    const lines = content.split(/\r?\n/);
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    const total = lines.length;
    const shownLines = lines.slice(0, MAX_READ_LINES);
    const finalFileContent = shownLines.join("\n");

    if (total > MAX_READ_LINES) {
      return `${finalFileContent}\n\n...truncated: showing lines ${MAX_READ_LINES} of ${total}.`;
    }

    return finalFileContent;
  },
});
