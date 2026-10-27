import React from "react";
import { render } from "ink";
import { App } from "./App";

export interface InkPortfolioSession {
  waitUntilExit: () => Promise<void>;
  unmount: () => void;
}

export function startInkPortfolio(options: {
  stdout: any;
  stdin: any;
}): InkPortfolioSession {
  const instance = render(<App />, {
    stdout: options.stdout,
    stdin: options.stdin,
    patchConsole: false,
    exitOnCtrlC: false,
  });

  return {
    waitUntilExit: async () => {
      await instance.waitUntilExit();
    },
    unmount: () => {
      try {
        instance.unmount();
      } catch {
        // Safe fallback
      }
    },
  };
}
