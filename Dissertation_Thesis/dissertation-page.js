(function () {
  const progress = document.querySelector(".read-progress span");
  const sections = Array.from(document.querySelectorAll(".dissertation-section"));
  const navLinks = Array.from(document.querySelectorAll(".chapter-nav a[href^='#']"));
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const lazyVideos = Array.from(document.querySelectorAll("video.lazy-video[data-src]"));

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

  function scrollToHash(hash, behavior = "smooth") {
    if (!hash || hash === "#") return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", hash);
    scrollToHash(hash);
    window.setTimeout(() => scrollToHash(hash, "auto"), 350);
  });

  window.addEventListener("hashchange", () => {
    scrollToHash(window.location.hash, "auto");
  });

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

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const video = entry.target;
          if (video.dataset.src) {
            video.src = video.dataset.src;
            video.removeAttribute("data-src");
            video.load();
            if (video.hasAttribute("autoplay")) {
              video.play().catch(() => {});
            }
          }
          videoObserver.unobserve(video);
        });
      },
      { rootMargin: "480px 0px" }
    );
    lazyVideos.forEach((video) => videoObserver.observe(video));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    lazyVideos.forEach((video) => {
      video.src = video.dataset.src;
      video.removeAttribute("data-src");
      video.load();
    });
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
  if (window.location.hash) {
    [0, 150, 500, 1200, 2400].forEach((delay) => {
      window.setTimeout(() => scrollToHash(window.location.hash, "auto"), delay);
    });
  }
}());
