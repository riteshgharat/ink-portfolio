import figlet from "figlet";
import { fileURLToPath } from "bun";

import slantFontData from "./assets/slant.flf" with { type: "text" };
// Manually register the font data with normalized line endings
figlet.parseFont("slant", slantFontData.replace(/\r/g, ""));

// "ritesh" in slant font
const assciiText = figlet
  .textSync("ritesh", { font: "slant" })
  .replace(/\r/g, "");

const asciiME = Bun.file(
  fileURLToPath(new URL("./assets/ascii-me.txt", import.meta.url)),
);
const asciiMEText = (await asciiME.text()).replace(/\r/g, "");

const asciiPC = Bun.file(
  fileURLToPath(new URL("./assets/ascii-pc.txt", import.meta.url)),
);
const asciiPCText = (await asciiPC.text()).replace(/\r/g, "");

export { assciiText, asciiMEText, asciiPCText };
