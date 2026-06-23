(function () {
  const progress = document.querySelector(".read-progress span");
  const sections = Array.from(document.querySelectorAll(".dissertation-section"));
  const navLinks = Array.from(document.querySelectorAll(".chapter-nav a[href^='#']"));
  const revealEls = Array.from(document.querySelectorAll(".reveal"));

  function updateProgress() {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max > 0 ? window.scrollY / max : 0;
    progress.style.width = `${Math.max(0, Math.min(1, amount)) * 100}%`;
  }

  function updateActiveNav() {
    let current = sections[0] ? sections[0].id : "";
    const offset = 130;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) current = section.id;
    }
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  window.addEventListener(
    "scroll",
    () => {
      updateProgress();
      updateActiveNav();
    },
    { passive: true }
  );
  window.addEventListener("resize", updateProgress);
  updateProgress();
  updateActiveNav();
}());
