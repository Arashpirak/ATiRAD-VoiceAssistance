const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs').promises;

if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
}
require("dotenv").config(); // importing environment variables from .env file

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname }); // Explicitly set app directory
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 10000; // Default to 10000 if not set

// Handle uncaught exceptions gracefully
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

      
      // ✅ 1. New API route for Gemini quotes
      if (pathname === "/api/quote") {
        try {
          // Make request to Gemini API
        const response = await fetchWithTimeout(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
                process.env.GEMINI_API_KEY,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                contents: [{ parts: [{ text: "Give me one short motivational quote." }] }]
                }),
                timeout: 5000
            }
            );

          // If HTTP status is not 200–299
          if (!response.ok) {
            console.error(
              `Gemini API error: ${response.status} ${response.statusText}`
            );
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

          // Try to parse JSON
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

          // Debug: log raw Gemini response (only in dev mode)
          if (process.env.NODE_ENV !== "production") {
            console.log("Gemini raw response:", JSON.stringify(data, null, 2));
          }

          // Try to extract a quote safely
          const quote =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Stay motivated! (fallback)";

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ quote }));
        } catch (err) {
          // Catch network or runtime errors
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
        return; // stop further handling
      }


      // Serve static files from public/dist (e.g., voice widget plugin)
      if (pathname.startsWith('/dist/')) {
        const filePath = path.join(__dirname, 'public', pathname.replace('/dist/', ''));
        try {
          const stat = await fs.stat(filePath);
          if (stat.isFile()) {
            const content = await fs.readFile(filePath);
            res.setHeader('Content-Type', 'application/javascript'); // Default for JS
            if (pathname.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
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

      // Handle Next.js routes (App Router compatible)
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