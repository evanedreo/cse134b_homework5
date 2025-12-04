(function () {
  const STORAGE_KEY = "preferred-theme";
  const THEME_ORDER = ["light", "dark", "ocean", "forest"];
  const FONT_STACKS = {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  };
  const THEME_PRESETS = {
    light: {
      name: "Light",
      surface: "#f7f7fa",
      surface2: "#eef1ff",
      text: "#0f172a",
      muted: "rgba(15, 23, 42, 0.65)",
      accent: "#2563eb",
      font: "sans",
      colorScheme: "light",
    },
    dark: {
      name: "Dark",
      surface: "#050816",
      surface2: "#0b1220",
      text: "#e5e7eb",
      muted: "rgba(156, 163, 175, 0.85)",
      accent: "#3b82f6",
      font: "sans",
      colorScheme: "dark",
    },
    ocean: {
      name: "Ocean",
      surface: "#020617",
      surface2: "#0f172a",
      text: "#e0f2fe",
      muted: "rgba(148, 163, 184, 0.85)",
      accent: "#38bdf8",
      font: "mono",
      colorScheme: "dark",
    },
    forest: {
      name: "Forest",
      surface: "#f7fbe9",
      surface2: "#e5f4d3",
      text: "#1f2933",
      muted: "rgba(55, 65, 81, 0.7)",
      accent: "#16a34a",
      font: "serif",
      colorScheme: "light",
    },
  };
  const root = document.documentElement;
  const select = document.querySelector(".theme-select");

  if (!root || !select) return;

  // Show the select only when JS is available
  select.hidden = false;

  function applyTheme(themeName) {
    const preset = THEME_PRESETS[themeName] ?? THEME_PRESETS.light;

    root.dataset.theme = themeName;
    root.style.setProperty("--surface", preset.surface);
    root.style.setProperty("--surface-2", preset.surface2);
    root.style.setProperty("--text", preset.text);
    root.style.setProperty("--muted", preset.muted);
    root.style.setProperty("--accent", preset.accent);
    root.style.setProperty(
      "--font-body",
      FONT_STACKS[preset.font] ?? FONT_STACKS.sans
    );
    root.style.setProperty("color-scheme", preset.colorScheme);

    const isDarkLike = preset.colorScheme === "dark";
    select.setAttribute("data-dark-like", String(isDarkLike));
    return themeName;
  }

  let stored = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    stored = null;
  }

  let initialTheme = stored;
  if (!initialTheme || !THEME_PRESETS[initialTheme]) {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    initialTheme = prefersDark ? "dark" : "light";
  }

  let currentTheme = applyTheme(initialTheme);
  select.value = currentTheme;

  select.addEventListener("change", () => {
    const next = select.value;
    if (!THEME_PRESETS[next]) return;
    currentTheme = applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {
      // ignore storage errors (e.g., private mode)
    }
  });

  // ---------- View Transition for SPA-style page changes ----------
  function updateActiveNav(pathname) {
    const currentPath = pathname || window.location.pathname;
    document
      .querySelectorAll('nav[aria-label="Primary"] a[href]')
      .forEach((link) => {
        const linkPath = new URL(link.href, window.location.href).pathname;
        if (linkPath === currentPath) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
  }

  async function navigateWithTransition(url) {
    if (!document.startViewTransition || !window.fetch) {
      window.location.href = url;
      return;
    }

    try {
      const response = await fetch(url, {
        headers: { "X-Routed-By": "view-transition" },
      });
      if (!response.ok) {
        window.location.href = url;
        return;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const nextDoc = parser.parseFromString(html, "text/html");
      const nextMain = nextDoc.querySelector("main");
      const nextTitle = nextDoc.querySelector("title");

      if (!nextMain) {
        window.location.href = url;
        return;
      }

      document.startViewTransition(() => {
        const currentMain = document.querySelector("main");
        if (nextTitle) {
          document.title = nextTitle.textContent || document.title;
        }
        if (currentMain && nextMain) {
          currentMain.replaceWith(nextMain);
        }
        history.pushState({}, "", url);
        updateActiveNav(new URL(url, window.location.href).pathname);
      });
    } catch {
      window.location.href = url;
    }
  }

  function setupViewTransitions() {
    if (!("startViewTransition" in document)) return;

    // Set correct active nav on initial load
    updateActiveNav(window.location.pathname);

    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      // Don't intercept clicks on form controls or the theme select
      if (target.closest("button, select, input, textarea, label")) return;

      const link = target.closest("a[href]");
      if (!link) return;
      if (link.hasAttribute("data-no-transition")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.endsWith(".html")) return;

      // Never intercept navigation to the pure no-JS form page — let the browser
      // load it as a full, script-free document to satisfy the assignment.
      if (url.pathname.endsWith("/form-no-js.html") || url.pathname.endsWith("form-no-js.html")) {
        return;
      }

      // Also avoid intercepting navigation to pages that rely on per-page
      // scripts (Projects + Projects Admin). These need a full reload so
      // their JS (projects-data.js / projects-admin.js) can run.
      if (
        url.pathname.endsWith("/projects.html") ||
        url.pathname.endsWith("projects.html") ||
        url.pathname.endsWith("/projects-admin.html") ||
        url.pathname.endsWith("projects-admin.html")
      ) {
        return;
      }

      // Skip if already on this page
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      event.preventDefault();
      navigateWithTransition(url.href);
    });
  }

  setupViewTransitions();
})();
