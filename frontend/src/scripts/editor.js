console.log("Index.js Loaded");

// Vars
const menu = document.getElementById("menu");
const menuToggle = document.getElementById("menuToggle");
const editor = document.getElementById("editor");
const highlight = document.getElementById("highlight");
const previewBtn = document.getElementById("runCode");

// Config
let activeItem = null;

// Functions

const pathParts = window.location.pathname.split('/');
const language = pathParts[2];

menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.classList.toggle("menuAnim");
});

menu.addEventListener("click", (e) => e.stopPropagation());

document.addEventListener("click", () => {
  if (menu.classList.contains("menuAnim")) menu.classList.remove("menuAnim");
});

editor.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  const contextMenu = document.getElementById("contextMenu");
  const menuHeight = contextMenu.offsetHeight;
  const menuWidth = contextMenu.offsetWidth;

  let x = e.pageX;
  let y = e.pageY - menuHeight;

  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth;
  if (y < 0) y = e.pageY;

  contextMenu.style.left = x + "px";
  contextMenu.style.top = y + "px";
  contextMenu.style.display = "flex";
});

document.addEventListener("click", () => {
  const contextMenu = document.getElementById("contextMenu");
  contextMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  if (contextMenu) contextMenu.style.display = "none";
});

fetch('/components/contextMenu.html')
.then(res => {
  console.log("STATUS:", res.status);
  console.log("URL:", res.url);
  return res.text();
})
.then(data => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = data;

  const template = tempDiv.querySelector('template');
  if (!template) {
    console.error("No Template Detected")
    return
  }
  const clone = template.content.cloneNode(true);

  const container = document.getElementById('container');
  container.appendChild(clone);

  // Now the elements exist in the DOM
  const editor = document.getElementById("editor");
  const copyBtn = document.getElementById("copy");
  const cutBtn = document.getElementById("cut");
  const pasteBtn = document.getElementById("paste");
  const selectBtn = document.getElementById("select");

  // Copy
  copyBtn.addEventListener("click", () => {
    const selection = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    if (selection) copyText(selection);
  });

  // Cut
  cutBtn.addEventListener("click",
    () => {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selection = editor.value.substring(start, end);
      if (selection) {
        copyText(selection);
        editor.value = editor.value.slice(0, start) + editor.value.slice(end);
        editor.setSelectionRange(start, start);
      }
    });

  // Paste
  pasteBtn.addEventListener("click",
    async () => {
      let text = "";
      try {
        text = await navigator.clipboard.readText();
      } catch {
        alert("Paste failed. Clipboard access denied.");
        return;
      }
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + text + editor.value.slice(end);
      editor.setSelectionRange(start + text.length, start + text.length);
      editor.focus();
    });

  // Select All
  selectBtn.addEventListener("click",
    () => {
      editor.focus();
      editor.setSelectionRange(0, editor.value.length);
    });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

});

fetch('/components/autoCompleter.html')
.then(res => res.text())
.then(data => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = data
  const template = tempDiv.querySelector('template');
  if (!template) {
    console.error("template not Found!")
    return
  }
  const clone = template.content.cloneNode(true);

  const container = document.getElementById('container');
  container.appendChild(clone);

  let completions = {};

  fetch('/json/Completions.json')
  .then(res => res.json())
  .then(data => {
    completions = data;
    initAutocomplete();

  })
  .catch(err => console.error("Failed to load completions:", err));

  function initAutocomplete() {
    editor.addEventListener("input", () => {
      const word = getCurrentWord(editor);
      const filtered = getFilteredSuggestions(word);
      showSuggestions(filtered, editor);
    });
  }

  function highlightTypedSuggestion() {
    const word = getCurrentWord(editor)
    const suggestions = getFilteredSuggestions(word)

    for (let i = 0; i < suggestions.length; i++) {
      // le suggestion: let
      const suggestion = suggestions[i];
      const NotTyped = suggestion.substring(word.length)
      const itemElement = document.getElementById(`${suggestion}`)
      itemElement.innerHTML = `<span class="typedItem">${word}</span>${NotTyped}`;
    }

  }

  function getCurrentWord(editor) {
    const pos = editor.selectionStart;
    const text = editor.value.slice(0, pos);
    const match = text.match(/([\w$]+|.)+$/);
    return match ? match[0]: "";
  }

  function getFilteredSuggestions(prefix) {
    if (!prefix || !completions.keywords) return [];

    const parts = prefix.split(".");
    const last = parts.pop();

    const all = [
      ...(completions.keywords || []),
      ...(completions.builtins || []),
      ...(completions.methods || []),
      ...(completions.properties || []),
      ...(completions.events || [])
    ];

    return all.filter(item => item.startsWith(last));
  }

  function showSuggestions(suggestions, editor) {
    let box = document.getElementById("autocompleteBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "autocompleteBox";
      box.style.position = "absolute";
      box.style.background = "#2b2b2b";
      box.style.color = "#fff";
      box.style.border = "1px solid #fff";
      box.style.borderRadius = "4px";
      box.style.zIndex = 10;
      box.style.maxHeight = "200px";
      box.style.overflowY = "auto";
      const container = document.getElementById('autoCompleter')
      container.appendChild(box)
    }

    if (suggestions.length === 0) {
      box.parentNode.style.display = "none";
      return;
    }

      box.innerHTML = suggestions.map(s => `<div class="item" id="${s}">${s}</div>`).join("");
      highlightTypedSuggestion()
      const rect = editor.getBoundingClientRect();
      box.style.left = rect.left + "px";
      box.style.top = rect.bottom + "px";
      box.style.display = "block";
      box.parentNode.style.display = "block";

      box.querySelectorAll(".item").forEach(el => {
          el.addEventListener('click',() => {
              activeItem = el;
              selectItem(el)
          });
        });

      editor.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && box.style.display !== "none") {
          e.preventDefault();

          if (!activeItem) {
            activeItem = box.firstChild;
            selectItem(activeItem)
            activeItem = null;
            }
            else {
              selectItem(activeItem);
              activeItem = null;
            };
          }
      });

      function selectItem(el) {
        insertSuggestion(el.textContent, editor);
        box.style.display = "none";
        box.style.display = "none";
      }
    }

    function insertSuggestion(suggestion, editor) {
      const start = editor.selectionStart;
      const text = editor.value.slice(0, start);
      const match = text.match(/[\w$]+$/);
      if (!match) return;
      const prefix = match[0];
      const before = text.slice(0, -prefix.length);
      const after = editor.value.slice(start);
      editor.value = before + suggestion + after;
      highlight.innerHTML = escapeHTML(editor.value)
      editor.selectionStart = editor.selectionEnd = (before + suggestion).length;
      editor.focus();
    }
  });

  // Cookie Functions

  function setCookie(name, value, minutes = 5) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000); // minutes → milliseconds
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
  }
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
    }
    return null;
  }
  function eraseCookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  // scroller
  editor.addEventListener("scroll", () => {
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  });

  previewBtn.addEventListener('click', () => {
    setCookie("codeCookie", editor.value, 5);
    document.location.href = "./pages/preview.html";
  });

  // Escape HTMl
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  editor.addEventListener("input", () => {
    highlight.innerHTML = editor.value
  });