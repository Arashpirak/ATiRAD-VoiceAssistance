const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
}

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 10000;

// CORS middleware
const corsMiddleware = cors({
  origin: ['https://www.atiradco.com', 'http://localhost:3000'], // Add allowed origins
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

      async function fetchWithTimeout(resource, options) {
        const { timeout = 5000 } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(id);
        return response;
      }

      // Handle /api/quote
      if (pathname === "/api/quote") {
        corsMiddleware(req, res, async () => {
          try {
            let prompt = "Give me one short motivational quote."; // Default prompt
            if (req.method === "POST") {
              // Parse POST body
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

            // Validate prompt
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

            // Make request to Gemini API
            const response = await fetchWithTimeout(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                }),
                timeout: 15000,
              }
            );

            if (!response.ok) {
              console.error(`Gemini API error: ${response.status} ${response.statusText}`);
              res.statusCode = response.status;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: true,
                  status: response.status,
                  message: "Gemini API returned an error",
                })
              );
              return;
            }

            let data;
            try {
              data = await response.json();
            } catch (parseErr) {
              console.error("Failed to parse Gemini response:", parseErr);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: true,
                  message: "Invalid JSON from Gemini API",
                })
              );
              return;
            }

            if (process.env.NODE_ENV !== "production") {
              console.log("Gemini raw response:", JSON.stringify(data, null, 2));
            }

            const quote =
              data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
              "Stay motivated! (fallback)";

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ quote }));
          } catch (err) {
            console.error("Gemini request failed:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: true,
                message: "Server error while calling Gemini API",
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