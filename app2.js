const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const { fetchGeminiQuote } = require('./gemini'); // Import Gemini handler

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 10000;

// CORS middleware
const corsMiddleware = cors({
  origin: ['https://www.atiradco.com', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Handle /api/quote
      if (pathname === "/api/quote") {
        corsMiddleware(req, res, async () => {
          try {
            let prompt = "Give me one short motivational quote.";
            if (req.method === "POST") {
              let body = "";
              req.on("data", (chunk) => {
                body += chunk.toString();
              });
              await new Promise((resolve) => req.on("end", resolve));
              try {
                const parsedBody = JSON.parse(body || "{}");
                if (parsedBody.prompt && typeof parsedBody.prompt === "string") {
                  prompt = parsedBody.prompt.trim();
                }
              } catch (parseErr) {
                console.error("Failed to parse request body:", parseErr);
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: true,
                    message: "Invalid JSON in request body",
                  })
                );
                return;
              }
            }

            if (!prompt) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: true,
                  message: "Prompt cannot be empty",
                })
              );
              return;
            }

            const result = await fetchGeminiQuote(prompt);

            res.statusCode = result.error ? result.status || 500 : 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err) {
            console.error("Server error in /api/quote:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: true,
                message: "Server error processing request",
                details: err.message,
              })
            );
          }
        });
        return;
      }

      // Serve static files from public/dist
      if (pathname.startsWith('/dist/')) {
        const filePath = path.join(__dirname, 'public', pathname.replace('/dist/', ''));
        try {
          const stat = await fs.stat(filePath);
          if (stat.isFile()) {
            const content = await fs.readFile(filePath);
            res.setHeader('Content-Type', pathname.endsWith('.css') ? 'text/css' : 'application/javascript');
            res.statusCode = 200;
            res.end(content);
            return;
          }
        } catch (e) {
          res.statusCode = 404;
          res.end('File not found');
          return;
        }
      }

      // Handle Next.js routes
      await handle(req, res, parsedUrl);
    } catch (error) {
      console.error('Server error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(PORT, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('App preparation failed:', err);
  process.exit(1);
});