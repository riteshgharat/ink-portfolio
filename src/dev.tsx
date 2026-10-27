import React from 'react';
import { render } from 'ink';
import { App } from './App';

console.log("Starting local dev mode...");
const { waitUntilExit } = render(<App />, { exitOnCtrlC: true });

waitUntilExit().catch(console.error);
