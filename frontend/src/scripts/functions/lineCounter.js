console.log("lineCounter.js Loaded");

const lineCounter = document.getElementById("lineCounter");

// 1️⃣ Populate line numbers
function updateLineCounter() {
  const lines = editor.value.split("\n");
  lineCounter.innerHTML = ""; // clear previous spans

  lines.forEach((_, i) => {
    const lineSpan = document.createElement("span");
    lineSpan.textContent = i + 1;
    lineCounter.appendChild(lineSpan);
  });
}

// 2️⃣ Highlight the current line
function highlightCurrentLine() {
  const lines = lineCounter.querySelectorAll("span");
  const lineNumber = editor.value.substr(0, editor.selectionStart).split("\n").length;

lines.forEach((span, i) => {
    if (i + 1 === lineNumber) {
    span.style.fontWeight = "800"
    span.style.color = "white"
}
else {
    span.style.fontWeight = "200"
    span.style.color =  "#b8b8b8"
}
});

}

// 3️⃣ Event listeners
editor.addEventListener("input", () => {
  updateLineCounter();
  highlightCurrentLine();
});
editor.addEventListener("click", highlightCurrentLine);
editor.addEventListener("keyup", highlightCurrentLine);
editor.addEventListener("scroll", () => {
  lineCounter.scrollTop = editor.scrollTop; // sync scrolling
});

// 4️⃣ Initialize
updateLineCounter();
highlightCurrentLine();