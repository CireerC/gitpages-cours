document.addEventListener("DOMContentLoaded", function () {
  var tocList = document.getElementById("toc-list");
  var tocNav = document.getElementById("course-toc");
  if (!tocList || !tocNav) return;

  var content = document.querySelector(".course-content");
  if (!content) return;

  var headings = content.querySelectorAll("h2, h3");
  if (headings.length < 2) {
    tocNav.style.display = "none";
    return;
  }

  headings.forEach(function (h, i) {
    if (!h.id) {
      h.id = "toc-" + i + "-" + h.textContent.trim().toLowerCase()
        .replace(/[^a-z0-9\u00C0-\u024F]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    var li = document.createElement("li");
    li.className = h.tagName === "H3" ? "toc-item toc-h3" : "toc-item toc-h2";
    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById(h.id).scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, null, "#" + h.id);
    });
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // Highlight active section on scroll
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = tocList.querySelector('a[href="#' + entry.target.id + '"]');
      if (!link) return;
      if (entry.isIntersecting) {
        tocList.querySelectorAll("a").forEach(function (a) { a.classList.remove("toc-active"); });
        link.classList.add("toc-active");
      }
    });
  }, { rootMargin: "0px 0px -70% 0px", threshold: 0 });

  headings.forEach(function (h) { observer.observe(h); });
});
