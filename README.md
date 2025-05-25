# Postman Echo (MCP)

This project runs an [MCP](https://modelcontext.org) Agent on Cloudflare Workers using Durable Objects and Hono.

## Getting Started

### Install dependencies

```shell
npm install
```

### Develop locally

```shell
npm run dev
```

This will run `wrangler dev`, which did not work all that well in my experience.

### Deploy

Ensure you login to wrangler first with `wrangler login` and then `wrangler deploy` to deploy the worker to production.

### Testing

Use Postman's wicked-awesome MCP client 🚀
