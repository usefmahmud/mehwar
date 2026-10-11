import figlet from "figlet";
import { Text } from "ink";

export function Logo() {
  const art = figlet
    .textSync("mehwar", { font: "Standard" })
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n");

  return <Text>{art}</Text>;
}
