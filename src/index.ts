import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Hono } from "hono";
import { McpAgent } from "agents/mcp";

import { registerPostmanEchoDateTimeTools } from "./date-time.js";

const app = new Hono();
export class MCPEcho extends McpAgent {
  static server = new McpServer({
    name: "Echo",
    version: "1.0.0",
  });

  server = MCPEcho.server;

  async init() {
    this.server.resource(
      "echo",
      new ResourceTemplate("echo://{message}", { list: undefined }),
      async (uri, { message }) => ({
        contents: [{ uri: uri.href, text: `Resource echo: ${message}` }],
      }),
    );

    this.server.tool("echo", "Say hello with postman echo's MCP server", { message: z.string() }, async ({ message }) => ({
      content: [{ type: "text", text: `Tool echo: ${message}` }],
    }));

    registerPostmanEchoDateTimeTools(this.server);

    this.server.tool(
      "delay",
      "Delay n seconds which simulates a slow tool call",
      { seconds: z.number() },
      async ({ seconds }) => {
        const url = `https://postman-echo.com/delay/${seconds}`;
        const res = await fetch(url);
        const formatted = await res.text();
        return {
          content: [
            { type: "text", text: formatted },
          ],
        };
      },
    );


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

app.mount("/", MCPEcho.serve("/").fetch, { replaceRequest: false });
app.mount("/sse", MCPEcho.serveSSE("/sse").fetch, { replaceRequest: false });

export default app;
