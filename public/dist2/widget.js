(function () {
  // Create widget container
  const widget = document.createElement("div");
  widget.style.position = "fixed";
  widget.style.bottom = "20px";
  widget.style.right = "20px";
  widget.style.width = "300px";
  widget.style.minHeight = "200px"; // Increased height to accommodate input
  widget.style.background = "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)";
  widget.style.borderRadius = "16px";
  widget.style.boxShadow = "0px 8px 24px rgba(0, 0, 0, 0.15)";
  widget.style.padding = "16px";
  widget.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  widget.style.fontSize = "15px";
  widget.style.color = "#222";
  widget.style.lineHeight = "1.5";
  widget.style.zIndex = "99999";
  widget.style.transition = "all 0.3s ease-in-out";

  // Title
  const title = document.createElement("h4");
  title.textContent = "💡 Daily Motivation";
  title.style.margin = "0 0 10px 0";
  title.style.fontSize = "16px";
  title.style.fontWeight = "600";
  title.style.color = "#444";
  widget.appendChild(title);

  // Quote text
  const quoteText = document.createElement("p");
  quoteText.textContent = "Enter a prompt to get inspired!";
  quoteText.style.margin = "0 0 12px 0";
  quoteText.style.fontStyle = "italic";
  quoteText.style.color = "#555";
  widget.appendChild(quoteText);

  // Input field for custom prompt
  const promptInput = document.createElement("textarea");
  promptInput.placeholder = "Enter your prompt (e.g., 'Give me a quote about courage')...";
  promptInput.style.width = "100%";
  promptInput.style.height = "60px";
  promptInput.style.padding = "8px";
  promptInput.style.marginBottom = "10px";
  promptInput.style.border = "1px solid #ccc";
  promptInput.style.borderRadius = "8px";
  promptInput.style.fontSize = "14px";
  promptInput.style.resize = "none";
  widget.appendChild(promptInput);

  // Fetch quote from backend
  async function fetchQuote(prompt) {
    quoteText.textContent = "✨ Fetching wisdom...";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("https://factoryab.ir/api/quote", {
        method: "POST", // Use POST to send custom prompt
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt || "Give me one short motivational quote." }), // Default prompt if empty
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.quote) {
        quoteText.textContent = "“" + data.quote.trim() + "”";
      } else {
        quoteText.textContent = "⚠️ No quote received.";
      }
    } catch (err) {
      quoteText.textContent = "❌ Could not fetch quote.";
      console.error("Widget fetch error:", err);
    }
  }

  // Submit button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "🔄 Get Quote";
  submitBtn.style.display = "inline-block";
  submitBtn.style.padding = "6px 12px";
  submitBtn.style.fontSize = "13px";
  submitBtn.style.cursor = "pointer";
  submitBtn.style.border = "none";
  submitBtn.style.borderRadius = "8px";
  submitBtn.style.background = "linear-gradient(90deg, #007BFF, #00C6FF)";
  submitBtn.style.color = "#fff";
  submitBtn.style.fontWeight = "500";
  submitBtn.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.1)";
  submitBtn.style.transition = "all 0.2s ease-in-out";

  submitBtn.onmouseover = () => {
    submitBtn.style.opacity = "0.85";
  };
  submitBtn.onmouseout = () => {
    submitBtn.style.opacity = "1";
  };

  submitBtn.onclick = () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      quoteText.textContent = "⚠️ Please enter a prompt.";
      return;
    }
    fetchQuote(prompt);
  };

  // Allow pressing Enter to submit
  promptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent new line in textarea
      submitBtn.click(); // Trigger button click
    }
  });

  widget.appendChild(submitBtn);

  // Add widget to page
  document.body.appendChild(widget);

  // Load default quote on initialization
  fetchQuote();
})();