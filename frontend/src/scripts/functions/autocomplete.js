console.log("Autocomplete.js Loaded");

editor.addEventListener("input", (e) => {
  
  if (e.inputType === "deleteContentBackward") return;

  const start = editor.selectionStart;
  const value = editor.value;

  const pairs = {
    "(": ")",
    "{": "}",
    "[": "]",
    '"': '"',
    "'": "'",
    "`": "`"
  };

  const lastChar = value[start - 1];

  if (!pairs[lastChar]) return;

  const close = pairs[lastChar];

  
  if (value[start] === close ) return;

  if (editor.selectionStart !== editor.selectionEnd) return;

  if (e.inputType === "insertFromPaste") return;

  editor.value =
    value.slice(0, start) +
    close +
    value.slice(start);

  editor.selectionStart = editor.selectionEnd = start;
});
