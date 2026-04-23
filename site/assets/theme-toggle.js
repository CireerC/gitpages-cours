(function () {
  var storageKey = "gpc-theme";
  var root = document.documentElement;

  /* -- Theme ---------------------------------------------------------------- */
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

  /* -- Reading progress bar -------------------------------------------------- */
  function updateProgress() {
    var bar = document.getElementById("reading-progress");
    if (!bar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = pct + "%";
  }

  /* -- Mobile sidebar toggle ------------------------------------------------- */
  function initSidebarToggle() {
    var btn = document.getElementById("sidebar-toggle");
    var sidebar = document.getElementById("app-sidebar");
    if (!btn || !sidebar) return;

    btn.addEventListener("click", function () {
      var isOpen = sidebar.classList.contains("open");
      sidebar.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      btn.querySelector(".toggle-label").textContent = isOpen ? "Menu des cours" : "Fermer le menu";
    });
  }

  /* -- Init ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getPreferredTheme());
    var themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    initSidebarToggle();
  });

  window.addEventListener("scroll", updateProgress, { passive: true });
})();


