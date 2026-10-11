import { useState } from "react";
import { Box, Text } from "ink";
import { PromptBox } from "./components/prompt-box.tsx";
import { Logo } from "./components/logo.tsx";

export function App() {
  const [value, setValue] = useState("");

  const handleSubmit = (_value: string) => {
    setValue("");
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      <Logo />
      <Text bold>Describe what you want to build.</Text>
      <Box marginTop={1}>
        <PromptBox value={value} onChange={setValue} onSubmit={handleSubmit} />
      </Box>
    </Box>
  );
}
