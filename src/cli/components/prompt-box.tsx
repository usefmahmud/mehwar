import { Box, Text } from "ink";
import TextInput from "ink-text-input";

export type PromptBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export function PromptBox({ value, onChange, onSubmit }: PromptBoxProps) {
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
        placeholder="Add authentication to this project…"
      />
    </Box>
  );
}
