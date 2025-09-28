if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
}

async function fetchWithTimeout(resource, options, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), options.timeout || 5000);
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      if (i < retries - 1 && (err.name === "AbortError" || err.message.includes("503"))) {
        console.log(`Retrying API request (${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

// Fallback: Fetch quote from OpenRouter
async function fetchOpenRouterQuote(prompt) {
  try {
    // Single default model (uncomment this for simple fallback)
    const model = "deepseek/deepseek-chat-v3-0324:free";

    // Optional: Rotate between free models for variety (uncomment to enable)
    /*
    const freeModels = [
      "deepseek/deepseek-chat-v3-0324:free",  // Fast, reliable free model
      "meta-llama/llama-3.1-8b-instruct:free",  // Llama alternative
      "google/gemini-flash-1.5-exp:free"  // Gemini-like free tier (if available)
    ];
    const model = freeModels[Math.floor(Math.random() * freeModels.length)];
    */

    const requestBody = JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,  // Limit output length for quotes
      temperature: 0.7  // Creative but focused
    });

    console.log(`OpenRouter API request: Model=${model}, Body=${requestBody}`);

    const response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://factoryab.ir",
          "X-Title": "Daily Motivation Widget"
        },
        body: requestBody,
        timeout: 15000,
      },
      3,  // Retry up to 3 times
      2000  // 2-second delay
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} ${response.statusText}`, errorText);
      return {
        error: true,
        status: response.status,
        message: "OpenRouter API returned an error",
        details: errorText,
      };
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Failed to parse OpenRouter response:", parseErr);
      return {
        error: true,
        message: "Invalid JSON from OpenRouter API",
      };
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("OpenRouter raw response:", JSON.stringify(data, null, 2));
    }

    const quote = data?.choices?.[0]?.message?.content?.trim() || "Stay motivated! (fallback)";

    return { quote };
  } catch (err) {
    console.error("OpenRouter request failed:", err);
    return {
      error: true,
      message: "Server error while calling OpenRouter API",
      details: err.message,
    };
  }
}

// Primary function: Try Gemini first, fallback to OpenRouter on error
async function fetchGeminiQuote(prompt) {
  try {
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    });
    console.log("Gemini API request body:", requestBody);

    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
        timeout: 15000,
      },
      3,  // Retry up to 3 times
      2000  // 2-second delay
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
      console.log("Gemini failed, falling back to OpenRouter...");
      return await fetchOpenRouterQuote(prompt);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Failed to parse Gemini response:", parseErr);
      console.log("Gemini parsing failed, falling back to OpenRouter...");
      return await fetchOpenRouterQuote(prompt);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Gemini raw response:", JSON.stringify(data, null, 2));
    }

    const quote =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Stay motivated! (fallback)";

    return { quote };
  } catch (err) {
    console.error("Gemini request failed:", err);
    console.log("Gemini overall failed, falling back to OpenRouter...");
    return await fetchOpenRouterQuote(prompt);
  }
}

module.exports = { fetchGeminiQuote };