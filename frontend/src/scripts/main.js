console.log("Main.js Loaded");

document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const href = btn.getAttribute('href');
    if (href.startsWith("/")) {
      window.location.href = href;
    }
  });
});