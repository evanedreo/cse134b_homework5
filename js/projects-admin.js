(function () {
  const LOCAL_STORAGE_KEY = "portfolio-projects-local-v1";

  const FIELD_NAMES = [
    "id",
    "title",
    "description",
    "imageSrc",
    "imageAlt",
    "tech",
    "linkHref",
    "linkLabel",
    "date",
    "role",
    "keywords",
  ];

  function getElements() {
    const section = document.querySelector("#projects-admin");
    if (!section) return {};
    return {
      upsertForm: section.querySelector("#project-upsert-form"),
      deleteForm: section.querySelector("#project-delete-form"),
      refreshBtn: section.querySelector("#refresh-preview-btn"),
      previewGrid: section.querySelector(".project-grid"),
      status: section.querySelector("#admin-status"),
    };
  }

  function readLocalProjects() {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeLocalProjects(list) {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list || []));
    } catch (_) {
      // ignore write errors
    }
  }

  function setStatus(el, message) {
    if (!el) return;
    el.textContent = message || "";
  }

  function renderPreview() {
    const { previewGrid, status } = getElements();
    if (!previewGrid) return;

    const projects = readLocalProjects();
    previewGrid.innerHTML = "";

    projects.forEach(function (proj) {
      const card = document.createElement("project-card");
      if (proj.id) card.setAttribute("project-id", proj.id);
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
      previewGrid.appendChild(card);
    });

    if (status) {
      if (projects.length === 0) {
        setStatus(
          status,
          "No projects stored in localStorage yet. Create one with the form above."
        );
      } else {
        setStatus(
          status,
          "Showing " +
            projects.length +
            " project(s) from localStorage (key: " +
            LOCAL_STORAGE_KEY +
            ")."
        );
      }
    }
  }

  function loadProjectIntoForm(id) {
    const { upsertForm, status } = getElements();
    if (!upsertForm || !id) return;

    const projects = readLocalProjects();
    const project = projects.find(function (p) {
      return p && p.id === id;
    });

    if (!project) {
      setStatus(status, 'No project found with ID "' + id + '" to edit.');
      return;
    }

    FIELD_NAMES.forEach(function (field) {
      const control = upsertForm.elements[field];
      if (!control) return;
      const value = project[field] || "";
      control.value = value;
    });

    setStatus(
      status,
      'Loaded project "' + id + '" into the form. Edit fields and click Save.'
    );

    if (typeof upsertForm.scrollIntoView === "function") {
      upsertForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleUpsert(event) {
    event.preventDefault();
    const { upsertForm, status } = getElements();
    if (!upsertForm) return;

    const formData = new FormData(upsertForm);
    var id = (formData.get("id") || "").toString().trim();
    if (!id) {
      setStatus(status, "Please provide a non-empty project ID.");
      return;
    }

    var projects = readLocalProjects();
    var existingIndex = projects.findIndex(function (p) {
      return p && p.id === id;
    });

    var existing = existingIndex >= 0 ? projects[existingIndex] : {};
    var updated = Object.assign({}, existing);

    FIELD_NAMES.forEach(function (field) {
      var value = formData.get(field);
      if (value == null) return;
      var trimmed = value.toString().trim();
      if (trimmed === "") {
        // Leave existing value in place for partial updates
        return;
      }
      updated[field] = trimmed;
    });

    updated.id = id;

    if (existingIndex >= 0) {
      projects[existingIndex] = updated;
      const msg = "Updated project \"" + id + "\".";
      setStatus(status, msg);
    } else {
      projects.push(updated);
      const msg = "Created new project \"" + id + "\".";
      setStatus(status, msg);
    }

    writeLocalProjects(projects);
    renderPreview();
  }

  function handleDelete(event) {
    event.preventDefault();
    const { deleteForm, status } = getElements();
    if (!deleteForm) return;

    const formData = new FormData(deleteForm);
    var id = (formData.get("id") || "").toString().trim();
    if (!id) {
      setStatus(status, "Please enter an ID to delete.");
      return;
    }

    var projects = readLocalProjects();
    var beforeCount = projects.length;
    projects = projects.filter(function (p) {
      return p && p.id !== id;
    });

    if (projects.length === beforeCount) {
      const msg = "No project found with ID \"" + id + "\".";
      setStatus(status, msg);
    } else {
      const msg = "Deleted project \"" + id + "\".";
      setStatus(status, msg);
    }

    writeLocalProjects(projects);
    renderPreview();
  }

  function init() {
    const { upsertForm, deleteForm, refreshBtn, previewGrid } = getElements();
    if (!upsertForm || !deleteForm) return;

    upsertForm.addEventListener("submit", handleUpsert);
    deleteForm.addEventListener("submit", handleDelete);

    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        renderPreview();
      });
    }

    // Event delegation: clicking a project card in the preview
    // loads its data into the form for quick editing.
    if (previewGrid) {
      previewGrid.addEventListener("click", function (event) {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const card = target.closest("project-card");
        if (!card) return;
        const id = card.getAttribute("project-id");
        if (!id) return;
        loadProjectIntoForm(id);
      });
    }

    renderPreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
