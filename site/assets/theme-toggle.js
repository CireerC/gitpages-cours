(function () {
  var storageKey = "gpc-theme";
  var root = document.documentElement;

  function getPreferredTheme() {
    var saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "Mode clair" : "Mode sombre";
  }

  function toggleTheme() {
    var current = root.getAttribute("data-theme") || getPreferredTheme();
    var next = current === "dark" ? "light" : "dark";
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getPreferredTheme());
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);
  });
})();
