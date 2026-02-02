#!/usr/bin/env node
/**
 * Electron launcher script
 * This script removes ELECTRON_RUN_AS_NODE from the environment
 * before launching Electron, ensuring it runs as a proper Electron app
 * instead of as a Node.js runtime.
 */

const { spawn } = require("child_process");
const path = require("path");

// Remove the problematic environment variable
delete process.env.ELECTRON_RUN_AS_NODE;

// Find electron executable
const electronPath = require("electron");

// Get the app directory (project root)
const appPath = path.join(__dirname, "..");

// Spawn electron with the app
const child = spawn(electronPath, [appPath], {
  stdio: "inherit",
  env: process.env,
});

child.on("close", (code) => {
  process.exit(code || 0);
});

child.on("error", (err) => {
  console.error("Failed to start Electron:", err);
  process.exit(1);
});
