#!/usr/bin/env node
/**
 * figma-browser-mcp
 * Local MCP server that captures screenshots of Figma running in your browser
 * so Claude can see your designs visually.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execSync, spawnSync } from "child_process";
import { readFileSync, unlinkSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { z } from "zod";

const server = new McpServer({
  name: "figma-browser-mcp",
  version: "1.0.0",
});

function runAppleScript(script: string): string {
  const result = spawnSync("osascript", ["-e", script], {
    encoding: "utf8",
    timeout: 10000,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || "AppleScript failed");
  }
  return result.stdout?.trim() ?? "";
}

function captureScreen(region?: { x: number; y: number; w: number; h: number }): string {
  const tmpPath = join(tmpdir(), `figma-screenshot-${Date.now()}.png`);
  const args = ["-x", tmpPath];
  if (region) {
    args.splice(1, 0, "-R", `${region.x},${region.y},${region.w},${region.h}`);
  }
  spawnSync("screencapture", args, { timeout: 10000 });
  const data = readFileSync(tmpPath).toString("base64");
  if (existsSync(tmpPath)) unlinkSync(tmpPath);
  return data;
}

// Tool: Take a full screenshot
server.tool(
  "figma_screenshot",
  "Take a screenshot of the entire screen. Use this to see what is currently displayed, including Figma open in the browser.",
  {},
  async () => {
    const imageData = captureScreen();
    return {
      content: [{ type: "image", data: imageData, mimeType: "image/png" }],
    };
  }
);

// Tool: Focus Figma browser window and screenshot
server.tool(
  "figma_focus_and_screenshot",
  "Focus the browser window that has figma.com open and take a screenshot of it. Returns the screenshot so Claude can see the Figma design.",
  {},
  async () => {
    // Try to focus Figma in Chrome or Safari
    const focusScript = `
set found to false
repeat with appName in {"Google Chrome", "Safari"}
  try
    tell application appName
      repeat with w in windows
        set tabList to tabs of w
        repeat with t in tabList
          if URL of t contains "figma.com" then
            activate
            set index of w to 1
            set active tab of w to t
            set found to true
            exit repeat
          end if
        end repeat
        if found then exit repeat
      end repeat
    end tell
  end try
  if found then exit repeat
end repeat
if found then
  return "focused"
else
  return "not found"
end if
`;
    let msg: string;
    try {
      msg = runAppleScript(focusScript);
    } catch {
      msg = "error focusing window";
    }

    // Brief pause for window to come to front
    spawnSync("sleep", ["0.5"]);

    const imageData = captureScreen();
    return {
      content: [
        {
          type: "text",
          text: msg === "focused" ? "Focused Figma window and captured screenshot." : `Note: ${msg}. Capturing current screen.`,
        },
        { type: "image", data: imageData, mimeType: "image/png" },
      ],
    };
  }
);

// Tool: List browser windows
server.tool(
  "figma_list_windows",
  "List all open tabs in Chrome and Safari so you can identify which window has Figma open.",
  {},
  async () => {
    const results: Record<string, string[]> = {};

    const chromeScript = `
tell application "Google Chrome"
  set out to {}
  repeat with w in windows
    repeat with t in tabs of w
      set end of out to (title of t & " | " & URL of t)
    end repeat
  end repeat
  return out
end tell
`;
    try {
      const raw = runAppleScript(chromeScript);
      results.Chrome = raw.split(", ").map((s) => s.trim()).filter(Boolean);
    } catch (e) {
      results.Chrome = [`Error: ${String(e)}`];
    }

    const safariScript = `
tell application "Safari"
  set out to {}
  repeat with w in windows
    repeat with t in tabs of w
      set end of out to (name of t & " | " & URL of t)
    end repeat
  end repeat
  return out
end tell
`;
    try {
      const raw = runAppleScript(safariScript);
      results.Safari = raw.split(", ").map((s) => s.trim()).filter(Boolean);
    } catch (e) {
      results.Safari = [`Error: ${String(e)}`];
    }

    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

// Tool: Navigate browser to URL
server.tool(
  "figma_navigate",
  "Navigate the active browser tab to a given URL. Useful for switching between Figma screens or preview routes.",
  {
    url: z.string().describe("The URL to navigate to"),
    browser: z.enum(["chrome", "safari"]).default("chrome").describe("Which browser to use"),
  },
  async ({ url, browser }) => {
    const script =
      browser === "safari"
        ? `tell application "Safari"
  activate
  set URL of current tab of front window to "${url}"
end tell`
        : `tell application "Google Chrome"
  activate
  set URL of active tab of front window to "${url}"
end tell`;

    try {
      runAppleScript(script);
      spawnSync("sleep", ["1"]);
      const imageData = captureScreen();
      return {
        content: [
          { type: "text", text: `Navigated to ${url}` },
          { type: "image", data: imageData, mimeType: "image/png" },
        ],
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error navigating: ${String(e)}` }],
      };
    }
  }
);

// Tool: Screenshot a specific region
server.tool(
  "figma_screenshot_region",
  "Capture a specific rectangular region of the screen for a closer look at part of the Figma design.",
  {
    x: z.number().describe("Left edge in pixels"),
    y: z.number().describe("Top edge in pixels"),
    width: z.number().describe("Width in pixels"),
    height: z.number().describe("Height in pixels"),
  },
  async ({ x, y, width, height }) => {
    const imageData = captureScreen({ x, y, w: width, h: height });
    return {
      content: [{ type: "image", data: imageData, mimeType: "image/png" }],
    };
  }
);

// Tool: Scroll in browser
server.tool(
  "figma_scroll",
  "Scroll the currently focused browser window up or down to reveal more of the Figma design.",
  {
    direction: z.enum(["up", "down"]).describe("Scroll direction"),
    amount: z.number().default(500).describe("Pixels to scroll"),
  },
  async ({ direction, amount }) => {
    const delta = direction === "down" ? amount : -amount;
    const script = `
tell application "System Events"
  key code 125
end tell
`;
    // Use JavaScript execution in Chrome instead
    const jsScript = `
tell application "Google Chrome"
  execute active tab of front window javascript "window.scrollBy(0, ${delta})"
end tell
`;
    try {
      runAppleScript(jsScript);
    } catch {
      // Fallback to keyboard
      try {
        runAppleScript(script);
      } catch {
        // ignore
      }
    }
    spawnSync("sleep", ["0.3"]);
    const imageData = captureScreen();
    return {
      content: [
        { type: "text", text: `Scrolled ${direction} by ${amount}px` },
        { type: "image", data: imageData, mimeType: "image/png" },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
