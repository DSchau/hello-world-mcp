import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { McpAgent } from "agents/mcp";

const { TRANSPORT, LOCAL } = process.env;

const app = new Hono();
export class MCPEcho extends McpAgent {
  static server = new McpServer({
    name: "Echo",
    version: "1.0.0",
  });

  server = MCPEcho.server

  async init() {
    this.server.resource(
      "echo",
      new ResourceTemplate("echo://{message}", { list: undefined }),
      async (uri, { message }) => ({
        contents: [{ uri: uri.href, text: `Resource echo: ${message}` }],
      })
    );
    
    this.server.tool("echo", { message: z.string() }, async ({ message }) => ({
      content: [{ type: "text", text: `Tool echo: ${message}` }],
    }));
    
    this.server.tool("currentTime", {}, async () => {
      const res = await fetch("https://postman-echo.com/time/now");
      const time = await res.text();
      return {
        content: [{ type: "text", text: `🕒 Current UTC time: ${time || "Unavailable"}` }],
      };
    });
    
    this.server.tool("validateTime", { timestamp: z.string() }, async ({ timestamp }) => {
      const res = await fetch(`https://postman-echo.com/time/valid?timestamp=${encodeURIComponent(timestamp)}`);
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: data.valid
              ? `✅ "${timestamp}" is a valid ISO 8601 timestamp.`
              : `❌ "${timestamp}" is NOT a valid ISO 8601 timestamp.`,
          },
        ],
      };
    });
    
    this.server.tool(
      "formatTimestamp",
      { timestamp: z.string(), format: z.string() },
      async ({ timestamp, format }) => {
        const url = `https://postman-echo.com/time/format?timestamp=${encodeURIComponent(timestamp)}&format=${encodeURIComponent(format)}`;
        const res = await fetch(url);
        const formatted = await res.text();
        return {
          content: [{ type: "text", text: `🧾 Formatted timestamp: ${formatted}` }],
        };
      }
    );
    
    this.server.tool("convertTimestamp", { timestamp: z.string() }, async ({ timestamp }) => {
      const res = await fetch(`https://postman-echo.com/time/timestamp?timestamp=${encodeURIComponent(timestamp)}`);
      const data = await res.json();
      return {
        content: [{ type: "text", text: `📅 Converted timestamp: ${data.utc || "Conversion failed"}` }],
      };
    });
    
    this.server.prompt("echo", { message: z.string() }, ({ message }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please process this message: ${message}`,
          },
        },
      ],
    }));
  }
}

app.mount('/', MCPEcho.serve('/').fetch, { replaceRequest: false });
app.mount('/sse', MCPEcho.serveSSE('/sse').fetch, { replaceRequest: false })

export default app
