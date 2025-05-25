import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPostmanEchoDateTimeTools(server: McpServer, namespace = "datetime") {
  // 🕒 1. Current UTC Time
  server.tool(
    `${namespace}/currentTime`,
    "Get the current UTC time",
    {},
    async () => {
      const res = await fetch("https://postman-echo.com/time/now");
      const time = await res.text();
      return {
        content: [
          {
            type: "text",
            text: `🕒 Current UTC time: ${time || "Unavailable"}`,
          },
        ],
      };
    }
  );

  // 📅 2. Validate ISO 8601 Timestamp
  server.tool(
    `${namespace}/validateTime`,
    "Validate an ISO 8601 timestamp",
    { timestamp: z.string() },
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
              : `❌ "${timestamp}" is NOT a valid ISO 8601 timestamp.`,
          },
        ],
      };
    }
  );

  // 🧾 3. Format Timestamp
  server.tool(
    `${namespace}/formatTimestamp`,
    "Format a timestamp into a specified format",
    { timestamp: z.string(), format: z.string() },
    async ({ timestamp, format }) => {
      const url = `https://postman-echo.com/time/format?timestamp=${encodeURIComponent(
        timestamp
      )}&format=${encodeURIComponent(format)}`;
      const res = await fetch(url);
      const formatted = await res.text();
      return {
        content: [
          {
            type: "text",
            text: `🧾 Formatted timestamp: ${formatted}`,
          },
        ],
      };
    }
  );

  // 🔁 4. Convert Timestamp to UTC
  server.tool(
    `${namespace}/convertTimestamp`,
    "Convert a timestamp to UTC format",
    { timestamp: z.string() },
    async ({ timestamp }) => {
      const res = await fetch(
        `https://postman-echo.com/time/timestamp?timestamp=${encodeURIComponent(timestamp)}`
      );
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `📅 Converted timestamp: ${data.utc || "Conversion failed"}`,
          },
        ],
      };
    }
  );

  // ➕ 5. Add Time Units to Timestamp
  server.tool(
    `${namespace}/addTime`,
    "Add time units to a timestamp",
    {
      timestamp: z.string(),
      years: z.number().optional(),
      months: z.number().optional(),
      days: z.number().optional(),
      hours: z.number().optional(),
      minutes: z.number().optional(),
      seconds: z.number().optional(),
      milliseconds: z.number().optional(),
    },
    async (params) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`https://postman-echo.com/time/add?${query}`);
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `➕ Resulting timestamp: ${data.sum || "Addition failed"}`,
          },
        ],
      };
    }
  );

  // ➖ 6. Subtract Time Units from Timestamp
  server.tool(
    `${namespace}/subtractTime`,
    "Subtract time units from a timestamp",
    {
      timestamp: z.string(),
      years: z.number().optional(),
      months: z.number().optional(),
      days: z.number().optional(),
      hours: z.number().optional(),
      minutes: z.number().optional(),
      seconds: z.number().optional(),
      milliseconds: z.number().optional(),
    },
    async (params) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`https://postman-echo.com/time/subtract?${query}`);
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `➖ Resulting timestamp: ${data.difference || "Subtraction failed"}`,
          },
        ],
      };
    }
  );

  // 🏁 7. Start of Time Unit
  server.tool(
    `${namespace}/startOfTime`,
    "Get the start of a time unit for a timestamp",
    { timestamp: z.string(), unit: z.string() },
    async ({ timestamp, unit }) => {
      const res = await fetch(
        `https://postman-echo.com/time/start?timestamp=${encodeURIComponent(timestamp)}&unit=${encodeURIComponent(unit)}`
      );
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `🏁 Start of ${unit}: ${data.start || "Calculation failed"}`,
          },
        ],
      };
    }
  );

  // 🧱 8. Extract Time Unit
  server.tool(
    `${namespace}/extractTimeUnit`,
    "Extract a specific unit from a timestamp",
    { timestamp: z.string(), unit: z.string() },
    async ({ timestamp, unit }) => {
      const res = await fetch(
        `https://postman-echo.com/time/unit?timestamp=${encodeURIComponent(timestamp)}&unit=${encodeURIComponent(unit)}`
      );
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `🧱 Extracted ${unit}: ${data.unit || "Extraction failed"}`,
          },
        ],
      };
    }
  );

  // 🔍 9. Is Before Comparison
  server.tool(
    `${namespace}/isBefore`,
    "Check if a timestamp is before another",
    { timestamp: z.string(), target: z.string() },
    async ({ timestamp, target }) => {
      const res = await fetch(
        `https://postman-echo.com/time/before?timestamp=${encodeURIComponent(timestamp)}&target=${encodeURIComponent(target)}`
      );
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `🔍 Is before: ${data.before}`,
          },
        ],
      };
    }
  );

  // 🔎 10. Is After Comparison
  server.tool(
    `${namespace}/isAfter`,
    "Check if a timestamp is after another",
    { timestamp: z.string(), target: z.string() },
    async ({ timestamp, target }) => {
      const res = await fetch(
        `https://postman-echo.com/time/after?timestamp=${encodeURIComponent(timestamp)}&target=${encodeURIComponent(target)}`
      );
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `🔎 Is after: ${data.after}`,
          },
        ],
      };
    }
  );

  // 🔄 11. Is Between Comparison
  server.tool(
    `${namespace}/isBetween`,
    "Check if a timestamp is between two others",
    { timestamp: z.string(), start: z.string(), end: z.string() },
    async ({ timestamp, start, end }) => {
      const res = await fetch(
        `https://postman-echo.com/time/between?timestamp=${encodeURIComponent(timestamp)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
      );
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `🔄 Is between: ${data.between}`,
          },
        ],
      };
    }
  );

  // 🗓️ 12. Is Leap Year Check
  server.tool(
    `${namespace}/isLeapYear`,
    "Check if a year is a leap year",
    { timestamp: z.string() },
    async ({ timestamp }) => {
      const res = await fetch(
        `https://postman-echo.com/time/leap?timestamp=${encodeURIComponent(timestamp)}`
      );
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `🗓️ Is leap year: ${data.leap}`,
          },
        ],
      };
    }
  );
}
