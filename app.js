const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs').promises;

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

      
      // ✅ 1. New API route for Gemini quotes
      if (pathname === "/api/quote") {
        try {
          const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  { parts: [{ text: "Give me one short motivational quote." }] }
                ]
              })
            }
          );

          const data = await response.json();
          const quote = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Stay motivated!";

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ quote }));
        } catch (err) {
          console.error("Gemini error:", err);
          res.statusCode = 500;
          res.end(JSON.stringify({ quote: "Error fetching quote." }));
        }
        return; // don’t let Next.js handle this route
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