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
        console.log(`Retrying Gemini API request (${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

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
      3, // Retry up to 3 times
      2000 // 2-second delay
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
      return {
        error: true,
        status: response.status,
        message: "Gemini API returned an error",
        details: errorText,
      };
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Failed to parse Gemini response:", parseErr);
      return {
        error: true,
        message: "Invalid JSON from Gemini API",
      };
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
    return {
      error: true,
      message: "Server error while calling Gemini API",
      details: err.message,
    };
  }
}

module.exports = { fetchGeminiQuote };