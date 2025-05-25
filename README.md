# Postman Echo (MCP)

This project runs an [MCP](https://modelcontext.org) Agent on Cloudflare Workers using Durable Objects and Hono.

It deploys streamable HTTP to the root domain (/) and a fallback SSE server as needed to /sse.

## Getting Started

### Install dependencies

```shell
npm install
```

### Develop locally

```shell
npm run dev
```

This will run `wrangler dev` which simulates the deployed worker locally. Typically exposes the worker at localhost:8787.

### Deploy

Ensure you login to wrangler first with `wrangler login` and then `wrangler deploy` to deploy the worker to production.

### Testing

Use Postman's wicked-awesome MCP client 🚀
