(function () {
  const LOCAL_STORAGE_KEY = "portfolio-projects-local-v1";

  // Replace REMOTE_URL with your actual JSONBin or My JSON Server endpoint.
  // Example for My JSON Server:
  //   https://my-json-server.typicode.com/<your-username>/<your-repo>/projects
  // Example for JSONBin:
  //   https://api.jsonbin.io/v3/b/<your-bin-id>
  const REMOTE_URL =
    "https://my-json-server.typicode.com/evanedreo/cse134b_homework5_api/projects";

  const DEFAULT_LOCAL_PROJECTS = [
    {
      id: "foodflip",
      title: "FoodFlip - Restaurant Recommendation App",
      imageSrc: "assets/images/foodflip.png",
      imageAlt:
        "FoodFlip app interface showing restaurant cards to swipe through restaurants",
      description:
        "FoodFlip lets users swipe through nearby restaurants like a deck of cards, quickly saving favorites into personalized collections for date nights, group dinners, and solo food adventures.",
      tech: "JavaScript",
      linkHref: "https://cse110-sp25-group25.github.io/cse110-sp25-group25/",
      linkLabel: "Visit FoodFlip →",
      date: "Spring 2025",
      role: "Frontend engineer, UX design",
      keywords: "restaurant discovery, swipe UI, class project",
    },
    {
      id: "podcaist",
      title: "Podcaist - AI‑Generated Podcast Platform",
      imageSrc: "assets/images/podcaist.svg",
      imageAlt: "Waveform illustration representing AI-generated podcast audio",
      description:
        "Podcaist generates fully scripted podcast episodes from a single topic prompt using language models, then stitches narration and background audio into a shareable listening experience.",
      tech: "TypeScript, Next.js, OpenAI",
      linkHref: "https://podcaist.vercel.app/",
      linkLabel: "Visit Podcaist →",
      date: "2024",
      role: "Full‑stack developer",
      keywords: "AI, content generation, web app",
    },
    {
      id: "qa-testing-system",
      title: "QA Testing System - AI‑Driven Testing Agent",
      imageSrc: "assets/images/github.png",
      imageAlt: "Dashboard mockup showing automated test runs",
      description:
        "An AI agent that explores web apps, writes natural‑language test plans, and executes them automatically, helping developers catch regressions without writing every test case by hand.",
      tech: "Python, Playwright, OpenAI",
      linkHref: "https://github.com/evanedreo/qa_testing_system",
      linkLabel: "View QA agent on GitHub →",
      date: "2024",
      role: "Creator",
      keywords: "QA automation, AI agents, testing",
    },
    {
      id: "slide-generator",
      title: "Slide Generator - AI‑Powered Presentations",
      imageSrc: "assets/images/github.png",
      imageAlt: "Slide deck preview generated from a short topic prompt",
      description:
        "Given a lesson outline, Slide Generator produces a full, visually‑balanced slide deck with speaker notes, examples, and call‑to‑action sections tailored for educators.",
      tech: "TypeScript, Next.js, AWS S3, OpenAI",
      linkHref: "https://github.com/evanedreo/slide-generator",
      linkLabel: "View Slide Generator on GitHub →",
      date: "2023",
      role: "Full‑stack engineer",
      keywords: "education, AI, presentations",
    },
  ];

  function getElements() {
    const section = document.querySelector("#projects");
    if (!section) return {};
    return {
      grid: section.querySelector(".project-grid"),
      loadLocalBtn: section.querySelector("#load-local-btn"),
      loadRemoteBtn: section.querySelector("#load-remote-btn"),
      status: section.querySelector("#projects-status"),
    };
  }

  function setStatus(el, message) {
    if (!el) return;
    el.textContent = message || "";
  }

  function ensureLocalSeeded() {
    try {
      const existing = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!existing) {
        window.localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(DEFAULT_LOCAL_PROJECTS)
        );
      }
    } catch (_) {
      // Ignore storage errors (e.g., private mode)
    }
  }

  function renderCards(grid, projects, sourceLabel) {
    if (!grid) return;

    grid.innerHTML = "";
    const list = Array.isArray(projects) ? projects : [];

    list.forEach(function (proj) {
      const card = document.createElement("project-card");
      if (proj.title) card.setAttribute("title", proj.title);
      if (proj.imageSrc) card.setAttribute("image-src", proj.imageSrc);
      if (proj.imageAlt) card.setAttribute("image-alt", proj.imageAlt);
      if (proj.description)
        card.setAttribute("description", proj.description);
      if (proj.tech) card.setAttribute("tech", proj.tech);
      if (proj.linkHref) card.setAttribute("link-href", proj.linkHref);
      if (proj.linkLabel) card.setAttribute("link-label", proj.linkLabel);
      if (proj.date) card.setAttribute("date", proj.date);
      if (proj.role) card.setAttribute("role", proj.role);
      if (proj.keywords) card.setAttribute("keywords", proj.keywords);
      grid.appendChild(card);
    });

    const { status } = getElements();
    if (status) {
      if (list.length === 0) {
        setStatus(status, "No projects found in " + sourceLabel + " data.");
      } else {
        setStatus(
          status,
          "Loaded " + list.length + " project card(s) from " + sourceLabel + "."
        );
      }
    }
  }

  function loadLocal() {
    const { grid, status } = getElements();
    if (!grid) return;

    ensureLocalSeeded();

    let raw = null;
    let parsed = null;
    try {
      raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      parsed = raw ? JSON.parse(raw) : [];
    } catch (_) {
      parsed = DEFAULT_LOCAL_PROJECTS;
    }

    renderCards(grid, parsed || DEFAULT_LOCAL_PROJECTS, "localStorage");
    if (status) {
      setStatus(
        status,
        "Loaded projects from localStorage. (LOCAL_STORAGE_KEY: " +
          LOCAL_STORAGE_KEY +
          ")"
      );
    }
  }

  async function loadRemote() {
    const { grid, loadRemoteBtn, status } = getElements();
    if (!grid) return;

    if (status) {
      setStatus(status, "Loading remote projects…");
    }

    if (loadRemoteBtn) {
      loadRemoteBtn.disabled = true;
      loadRemoteBtn.textContent = "Loading Remote…";
    }

    try {
      const response = await fetch(REMOTE_URL);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const projects = Array.isArray(data) ? data : data.projects || [];
      renderCards(grid, projects, "remote API");
    } catch (error) {
      console.error("Error fetching remote projects:", error);
      if (status) {
        setStatus(
          status,
          "Could not load remote data. Check REMOTE_URL and the My JSON Server configuration."
        );
      }
    } finally {
      if (loadRemoteBtn) {
        loadRemoteBtn.disabled = false;
        loadRemoteBtn.textContent = "Load Remote";
      }
    }
  }

  function init() {
    const { loadLocalBtn, loadRemoteBtn, status } = getElements();
    if (!loadLocalBtn || !loadRemoteBtn) return;

    setStatus(
      status,
      "Click “Load Local” to use localStorage data, or “Load Remote” to fetch from the cloud."
    );

    loadLocalBtn.addEventListener("click", function () {
      loadLocal();
    });

    loadRemoteBtn.addEventListener("click", function () {
      loadRemote();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


