console.log("preview.js Loaded");

const iframe = document.getElementById("sandbox");

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let c of ca) {
    c = c.trim();
    if (c.startsWith(nameEQ)) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  return null;
}

const code = getCookie("codeCookie");

async function runCode(code) {
  const res = await fetch("http://localhost:3000/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  })
  .then(res => res.text())
  .then(html => {
  const iframe = document.getElementById("sandbox");
  iframe.srcdoc = html;
});
}
console.log("Running Code...")
runCode(code)