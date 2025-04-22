import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { InMemoryEventStore } from "./lib/inMemoryEventStore.js";

import express, { Request, Response } from "express";

const { TRANSPORT } = process.env

const server = new McpServer({
  name: "Echo",
  version: "1.0.0"
});

server.resource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  async (uri, { message }) => ({
    contents: [{
      uri: uri.href,
      text: `Resource echo: ${message}`
    }]
  })
);

server.tool(
  "echo",
  { message: z.string() },
  async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }]
  })
);

server.tool(
  "currentTime",
  {},
  async () => {
    const res = await fetch("https://postman-echo.com/time/now");
    const time = await res.text();

    return {
      content: [
        {
          type: "text",
          text: `🕒 Current UTC time: ${time || "Unavailable"}`
        }
      ]
    };
  }
);

// Tool: Validate a timestamp (ISO 8601)
server.tool(
  "validateTime",
  {
    timestamp: z.string()
  },
  async ({ timestamp }) => {
    const res = await fetch(
      `https://postman-echo.com/time/valid?timestamp=${encodeURIComponent(timestamp)}`
    );
    const data = await res.json();

    return {
      content: [
        {
          type: "text",
          text: data.valid
            ? `✅ "${timestamp}" is a valid ISO 8601 timestamp.`
            : `❌ "${timestamp}" is NOT a valid ISO 8601 timestamp.`
        }
      ]
    };
  }
);

server.tool(
  "formatTimestamp",
  {
    timestamp: z.string(),
    format: z.string()
  },
  async ({ timestamp, format }) => {
    const url = `https://postman-echo.com/time/format?timestamp=${encodeURIComponent(timestamp)}&format=${encodeURIComponent(format)}`;
    const res = await fetch(url);
    const formatted = await res.text();

    return {
      content: [
        {
          type: "text",
          text: `🧾 Formatted timestamp: ${formatted}`
        }
      ]
    };
  }
);

// Tool: Convert a timestamp to UTC date string
server.tool(
  "convertTimestamp",
  {
    timestamp: z.string()
  },
  async ({ timestamp }) => {
    const res = await fetch(
      `https://postman-echo.com/time/timestamp?timestamp=${encodeURIComponent(timestamp)}`
    );
    const data = await res.json();

    return {
      content: [
        {
          type: "text",
          text: `📅 Converted timestamp: ${data.utc || "Conversion failed"}`
        }
      ]
    };
  }
);

server.prompt(
  "echo",
  { message: z.string() },
  ({ message }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please process this message: ${message}`
      }
    }]
  })
);

if (TRANSPORT === 'sse' || TRANSPORT === 'streamable-http') {
  const app = express();

  app.use(express.json());

  // to support multiple simultaneous connections we have a lookup object from
  // sessionId to transport
  const transports: Record<string, StreamableHTTPServerTransport | SSEServerTransport> = {};
  app.all('/', async (req: Request, res: Response) => {
    console.log(`Received ${req.method} request to /mcp`);
  
    try {
      // Check for existing session ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;
  
      if (sessionId && transports[sessionId]) {
        // Check if the transport is of the correct type
        const existingTransport = transports[sessionId];
        if (existingTransport instanceof StreamableHTTPServerTransport) {
          // Reuse existing transport
          transport = existingTransport;
        } else {
          // Transport exists but is not a StreamableHTTPServerTransport (could be SSEServerTransport)
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: Session exists but uses a different transport protocol',
            },
            id: null,
          });
          return;
        }
      } else if (!sessionId && req.method === 'POST' && isInitializeRequest(req.body)) {
        const eventStore = new InMemoryEventStore();
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          eventStore, // Enable resumability
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID when session is initialized
            console.log(`StreamableHTTP session initialized with ID: ${sessionId}`);
            transports[sessionId] = transport;
          }
        });
  
        // Set up onclose handler to clean up transport when closed
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            console.log(`Transport closed for session ${sid}, removing from transports map`);
            delete transports[sid];
          }
        };
  
        // Connect the transport to the MCP server
        await server.connect(transport);
      } else {
        // Invalid request - no session ID or not initialization request
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }
  
      // Handle the request with the transport
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });
    app.listen(3001, () => {
      console.info(`mcp.postman-echo.com running with transport:${TRANSPORT}`);
    });
} else {
  async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.info("mcp.postman-echo.com running on stdio");
  }
  
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
}
