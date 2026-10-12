import path from "path";
import { ToolError } from "../tool-error";

export const isInside = (root: string, target: string): boolean => {
  const relativePath = path.relative(root, target);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
};

export const fsFailure = (err: unknown, filePath: string): never => {
  const code = (err as NodeJS.ErrnoException).code;

  if (code === "ENOENT") {
    throw new ToolError(
      `file not found: ${filePath}. Check the path or create the file first.`,
    );
  }

  if (code === "EACCES") {
    throw new ToolError(`permission denied: ${filePath}.`);
  }

  throw err;
};
