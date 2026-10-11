import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";
import { PROMPT_PLACEHOLDER } from "../constants/prompt-placeholder.ts";

export type PromptBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export function PromptBox({ value, onChange, onSubmit }: PromptBoxProps) {
  const [placeholder] = useState(
    () =>
      PROMPT_PLACEHOLDER[Math.floor(Math.random() * PROMPT_PLACEHOLDER.length)],
  );

  return (
    <Box
      borderStyle="single"
      borderColor="white"
      paddingX={1}
      width={100}
      flexDirection="row"
    >
      <Text color="cyan">{"> "}</Text>
      <TextInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
      />
    </Box>
  );
}
