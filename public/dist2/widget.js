(function () {
  // Create widget container
  const widget = document.createElement("div");
  widget.style.position = "fixed";
  widget.style.bottom = "20px";
  widget.style.right = "20px";
  widget.style.width = "300px";
  widget.style.minHeight = "120px";
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
  quoteText.textContent = "Loading inspiration...";
  quoteText.style.margin = "0 0 12px 0";
  quoteText.style.fontStyle = "italic";
  quoteText.style.color = "#555";
  widget.appendChild(quoteText);

  // Fetch new quote from backend
  async function fetchQuote() {
    quoteText.textContent = "✨ Fetching wisdom...";
    try {
      const res = await fetch("https://factoryab.ir/api/quote");
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

  // Refresh button
  const refreshBtn = document.createElement("button");
  refreshBtn.textContent = "🔄 New Quote";
  refreshBtn.style.display = "inline-block";
  refreshBtn.style.padding = "6px 12px";
  refreshBtn.style.fontSize = "13px";
  refreshBtn.style.cursor = "pointer";
  refreshBtn.style.border = "none";
  refreshBtn.style.borderRadius = "8px";
  refreshBtn.style.background = "linear-gradient(90deg, #007BFF, #00C6FF)";
  refreshBtn.style.color = "#fff";
  refreshBtn.style.fontWeight = "500";
  refreshBtn.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.1)";
  refreshBtn.style.transition = "all 0.2s ease-in-out";

  refreshBtn.onmouseover = () => {
    refreshBtn.style.opacity = "0.85";
  };
  refreshBtn.onmouseout = () => {
    refreshBtn.style.opacity = "1";
  };

  refreshBtn.onclick = fetchQuote;

  widget.appendChild(refreshBtn);

  // Add widget to page
  document.body.appendChild(widget);

  // Load first quote automatically
  fetchQuote();
})();
