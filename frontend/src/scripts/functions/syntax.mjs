console.log("Syntax.mjs Loaded");

document.addEventListener("DOMContentLoaded", () => {
  const highlight = document.getElementById("highlight");
  if (!editor || !highlight) return;

  // === JS Syntax Tokens ===
  const keywords = ["const","let","var","function","return","if","else","for","while","class","new","import","from","try","catch","finally","throw","switch","case","break","default","continue","public","fetch","then"];
  const builtins = ["Math","Date","Array","Object","String","Number","Boolean","RegExp","JSON","console","window","document"];
  const propeties = ["length","prototype","constructor"];
  const booleans = ["true","false","off","on"];
  const operators = /(\+|\-|\*|\/|=|==|===|!=|!==|<|>|<=|>=|&&|\|\||!|%|\+\+|--|\+=|-=|\*=|\/=)/;
  const punctuation = /([{}()[\];,.])/;

  // === Parentheses pairs ===
  const pairs = { "(": ")", "{": "}", "[": "]" };
  const opening = Object.keys(pairs);
  const closing = Object.values(pairs);

  function tokenize(code) {
    const tokenRegex = /(".*?"|'.*?'|`.*?`|\/\/.*|\b\w+\b|[+\-*/=<>!%&|]+|[{}()[\];,.]|\s+|.)/g;
    return code.match(tokenRegex) || [];
  }

  function findMatchingParens(text, cursor) {
    let stack = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (opening.includes(ch)) stack.push({ char: ch, index: i });
      else if (closing.includes(ch)) {
        const last = stack[stack.length - 1];
        if (last && pairs[last.char] === ch) {
          const match = stack.pop();
          if (cursor > match.index && cursor <= i + 1) return { open: match.index, close: i };
        }
      }
    }
    return null;
  }

function highlightCode(code) {
    const cursor = editor.selectionStart;
    const match = findMatchingParens(code, cursor);
    const tokens = tokenize(code);

    let html = "";
    let pos = 0;

    for (const token of tokens) {
      let cls = "";

      if (/^\/\/.*/.test(token)) cls = "comment";
      else if (booleans.includes(token)) cls = "boolean";
      else if (/^".*"$|^'.*'$|^`.*`$/.test(token)) cls = "string";
      else if (keywords.includes(token)) cls = "keyword";
      else if (propeties.includes(token)) cls = "propety";
      else if (builtins.includes(token)) cls = "builtin";
      else if (operators.test(token)) cls = "operator";
      else if (punctuation.test(token)) cls = "punctuation";

      // Check if token contains matched parens
      let tokenHTML = "";
      for (let i = 0; i < token.length; i++) {
        let ch = token[i];
        let chHTML = ch
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        if (match && (pos + i === match.open || pos + i === match.close)) {
          chHTML = `<span class="paren-match">${chHTML}</span>`;
        }

        tokenHTML += chHTML;
      }

      html += cls ? `<span class="${cls}">${tokenHTML}</span>` : tokenHTML;
      pos += token.length;
    }

    return html;
  }

  function update() {
    highlight.innerHTML = highlightCode(editor.value) + "\n";
  }

  editor.addEventListener("input", update);
  editor.addEventListener("click", update);
  editor.addEventListener("keyup", update);
  editor.addEventListener("scroll", () => {
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  });

  update();
});