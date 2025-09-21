(function () {
  // A list of motivational quotes
  const quotes = [
    "Believe in yourself and all that you are.",
    "Every day is a new beginning.",
    "Success is not final, failure is not fatal.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it."
  ];

  // Pick a random quote
  function getRandomQuote() {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
  }

  // Create widget container
  const widget = document.createElement("div");
  widget.style.position = "fixed";
  widget.style.bottom = "20px";
  widget.style.right = "20px";
  widget.style.width = "280px";
  widget.style.minHeight = "100px";
  widget.style.background = "#ffffff";
  widget.style.border = "1px solid #ccc";
  widget.style.borderRadius = "10px";
  widget.style.boxShadow = "0px 4px 12px rgba(0,0,0,0.2)";
  widget.style.padding = "10px";
  widget.style.fontFamily = "Arial, sans-serif";
  widget.style.fontSize = "14px";
  widget.style.color = "#333";
  widget.style.lineHeight = "1.4";
  widget.style.zIndex = "10000";

  // Add random quote text
  const quoteText = document.createElement("p");
  quoteText.textContent = getRandomQuote();
  widget.appendChild(quoteText);

  // Add refresh button
  const refreshBtn = document.createElement("button");
  refreshBtn.textContent = "New Quote";
  refreshBtn.style.marginTop = "8px";
  refreshBtn.style.padding = "5px 10px";
  refreshBtn.style.fontSize = "13px";
  refreshBtn.style.cursor = "pointer";
  refreshBtn.style.border = "none";
  refreshBtn.style.borderRadius = "5px";
  refreshBtn.style.background = "#007BFF";
  refreshBtn.style.color = "#fff";
  refreshBtn.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.2)";

  refreshBtn.onclick = () => {
    quoteText.textContent = getRandomQuote();
  };

  widget.appendChild(refreshBtn);

  // Add the widget to the webpage
  document.body.appendChild(widget);
})();
