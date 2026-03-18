(() => {
  "use strict";

  const root = document.querySelector("#implementation-construction");

  if (!root || !("IntersectionObserver" in window)) {
    return;
  }

  const rows = root.querySelectorAll(".implementation-construction__row[data-reveal]");

  if (!rows.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const row = entry.target;
        const order = Number(row.querySelector(".implementation-construction__number")?.textContent || 0);
        row.style.transitionDelay = `${Math.min(order * 45, 270)}ms`;
        row.classList.add("is-visible");
        observer.unobserve(row);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  rows.forEach((row) => observer.observe(row));
})();
