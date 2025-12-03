// Custom element: <project-card>
// Part 1: cards are populated via attributes and rendered with a reusable template.
// Later parts can create these elements dynamically and set the same attributes.

(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        --card-bg: var(--project-card-bg, var(--surface-2));
        --card-border: var(--project-card-border, color-mix(in oklab, var(--text), transparent 88%));
        --card-radius: var(--project-card-radius, var(--radius));
        --card-padding: var(--project-card-padding, var(--space-3));
        --card-gap: var(--project-card-gap, var(--space-3));

        display: block;
      }

      article {
        display: grid;
        grid-template-columns: minmax(0, 5rem) minmax(0, 1fr);
        column-gap: var(--card-gap);
        row-gap: var(--space-1);
        align-items: start;
        padding: var(--card-padding);
        background: var(--card-bg);
        border-radius: var(--card-radius);
        border: 1px solid var(--card-border);
        box-shadow: var(--shadow-soft);
      }

      picture {
        grid-column: 1;
        grid-row: 1 / span 4;
        align-self: flex-start;
      }

      img {
        display: block;
        inline-size: 100%;
        block-size: auto;
        border-radius: calc(var(--card-radius) / 1.4);
        object-fit: cover;
        aspect-ratio: 4 / 3;
      }

      .body {
        grid-column: 2;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      h2 {
        margin: 0;
        font-size: 1.05rem;
      }

      .meta {
        font-size: 0.9rem;
        color: var(--muted);
      }

      .description {
        margin: 0.1rem 0 0;
      }

      .tech {
        margin: 0.2rem 0 0;
        font-size: 0.9rem;
        color: var(--muted);
      }

      a {
        margin-top: 0.4rem;
        align-self: flex-start;
        text-decoration: none;
        font-weight: 600;
        padding: 0.45em 0.8em;
        border-radius: 999px;
        border: 1px solid color-mix(in oklab, var(--accent), transparent 40%);
        background: color-mix(in oklab, var(--accent), transparent 82%);
        color: var(--text);
        transition: background-color 140ms ease, transform 140ms ease,
          box-shadow 140ms ease;
      }

      a:hover,
      a:focus-visible {
        background: color-mix(in oklab, var(--accent), transparent 70%);
        transform: translateY(-1px);
        box-shadow: var(--shadow-soft);
      }

      @media (max-width: 48rem) {
        article {
          grid-template-columns: minmax(0, 1fr);
        }

        picture {
          grid-column: 1;
          grid-row: 1;
          margin-bottom: 0.5rem;
        }

        .body {
          grid-column: 1;
        }
      }
    </style>

    <article>
      <picture>
        <img loading="lazy" decoding="async">
      </picture>
      <div class="body">
        <h2></h2>
        <p class="meta"></p>
        <p class="description"></p>
        <p class="tech"></p>
        <a class="link" target="_blank" rel="noopener noreferrer"></a>
      </div>
    </article>
  `;

  class ProjectCard extends HTMLElement {
    static get observedAttributes() {
      return [
        "title",
        "image-src",
        "image-alt",
        "description",
        "tech",
        "link-href",
        "link-label",
        "date",
        "role",
        "keywords",
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this._elements = {
        img: this.shadowRoot.querySelector("img"),
        title: this.shadowRoot.querySelector("h2"),
        meta: this.shadowRoot.querySelector(".meta"),
        desc: this.shadowRoot.querySelector(".description"),
        tech: this.shadowRoot.querySelector(".tech"),
        link: this.shadowRoot.querySelector(".link"),
      };
    }

    connectedCallback() {
      this._render();
    }

    attributeChangedCallback() {
      if (this.shadowRoot) {
        this._render();
      }
    }

    _render() {
      const { img, title, meta, desc, tech, link } = this._elements;

      const titleText = this.getAttribute("title") ?? "";
      const imageSrc = this.getAttribute("image-src") ?? "";
      const imageAlt = this.getAttribute("image-alt") ?? titleText;
      const description = this.getAttribute("description") ?? "";
      const techText = this.getAttribute("tech") ?? "";
      const linkHref = this.getAttribute("link-href") ?? "#";
      const linkLabel = this.getAttribute("link-label") ?? "Learn more →";
      const date = this.getAttribute("date") ?? "";
      const role = this.getAttribute("role") ?? "";
      const keywords = this.getAttribute("keywords") ?? "";

      if (img) {
        img.src = imageSrc;
        img.alt = imageAlt;
      }

      if (title) {
        title.textContent = titleText;
      }

      if (meta) {
        const metaParts = [date, role, keywords]
          .map((p) => (p || "").trim())
          .filter(Boolean);
        meta.textContent = metaParts.join(" • ");
        meta.hidden = metaParts.length === 0;
      }

      if (desc) {
        desc.textContent = description;
        desc.hidden = !description.trim();
      }

      if (tech) {
        tech.textContent = techText ? `Tech: ${techText}` : "";
        tech.hidden = !techText.trim();
      }

      if (link) {
        link.href = linkHref;
        link.textContent = linkLabel;
      }
    }
  }

  if (!customElements.get("project-card")) {
    customElements.define("project-card", ProjectCard);
  }
})();


