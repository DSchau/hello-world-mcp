import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
/**
 * Create and configure the MCP server with resources, tools, and prompts.
 */
export function createMcpServer() {
  const server = new McpServer({
    name: "Echo",
    version: "1.0.0"
  });

  // Resource: echo
  server.resource(
    "echo",
    new ResourceTemplate("echo://{message}", { list: undefined }),
    async (uri, { message }) => ({
      contents: [{ uri: uri.href, text: `Resource echo: ${message}` }]
    })
  );

  // Tool: echo
  server.tool(
    "echo",
    "Echoes back the provided message",
    { message: z.string() },
    async (args) => ({ content: [{ type: "text", text: `Tool echo: ${args.message}` }] })
  );

  // Tool: currentTime
  server.tool(
    "currentTime",
    "Retrieves the current UTC time from Postman Echo API",
    {},
    async () => {
      const res = await fetch("https://postman-echo.com/time/now");
      const time = await res.text();
      return { content: [{ type: "text", text: `🕒 Current UTC time: ${time || "Unavailable"}` }] };
    }
  );

  // Tool: validateTime
  server.tool(
    "validateTime",
    "Validates if a given string is a valid ISO 8601 timestamp",
    { timestamp: z.string() },
    async (args) => {
      const res = await fetch(
        `https://postman-echo.com/time/valid?timestamp=${encodeURIComponent(args.timestamp)}`
      );
      const data = await res.json();
      return {
        content: [{ type: "text", text: data.valid
          ? `✅ "${args.timestamp}" is a valid ISO 8601 timestamp.`
          : `❌ "${args.timestamp}" is NOT a valid ISO 8601 timestamp.`
        }]
      };
    }
  );

  // Tool: formatTimestamp
  server.tool(
    "formatTimestamp",
    "Formats a timestamp according to the specified format string",
    { timestamp: z.string(), format: z.string() },
    async (args) => {
      const url = `https://postman-echo.com/time/format?timestamp=${encodeURIComponent(args.timestamp)}&format=${encodeURIComponent(args.format)}`;
      const res = await fetch(url);
      const formatted = await res.text();
      return { content: [{ type: "text", text: `🧾 Formatted timestamp: ${formatted}` }] };
    }
  );

  // Tool: convertTimestamp
  server.tool(
    "convertTimestamp",
    "Converts a timestamp to UTC format",
    { timestamp: z.string() },
    async (args) => {
      const res = await fetch(
        `https://postman-echo.com/time/timestamp?timestamp=${encodeURIComponent(args.timestamp)}`
      );
      const data = await res.json();
      return { content: [{ type: "text", text: `📅 Converted timestamp: ${data.utc || "Conversion failed"}` }] };
    }
  );

  // Prompt: echo
  server.prompt(
    "echo",
    { message: z.string() },
    ({ message }) => ({ messages: [{ role: "user", content: { type: "text", text: `Please process this message: ${message}` } }] })
  );

  return server;
}