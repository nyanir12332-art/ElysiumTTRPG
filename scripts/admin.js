(() => {
  const AUTH_KEY = "fable.admin.session";
  const CLASS_KEY = "fable.admin.classes";
  const CONTENT_PREFIX = "fable.admin.content:";
  const ADMIN_DIGEST = "a040659da614e1b2d5a1a9c0549c6b31075a7236c94adde051704b42ecb576f5";

  const pageKey = () => {
    const path = window.location.pathname.replace(/\\/g, "/").split("/").pop() || "index.html";
    return window.location.hash.startsWith("#custom/") ? `classes/${window.location.hash.slice(1)}` : path;
  };

  const isLoggedIn = () => sessionStorage.getItem(AUTH_KEY) === "true";
  const setLoggedIn = (value) => {
    if (value) {
      sessionStorage.setItem(AUTH_KEY, "true");
    } else {
      sessionStorage.removeItem(AUTH_KEY);
    }
  };

  const digest = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const readClasses = () => {
    try {
      return JSON.parse(localStorage.getItem(CLASS_KEY)) || [];
    } catch {
      return [];
    }
  };

  const writeClasses = (classes) => {
    localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
  };

  const storedContent = (key) => localStorage.getItem(`${CONTENT_PREFIX}${key}`);
  const saveContent = (key, html) => localStorage.setItem(`${CONTENT_PREFIX}${key}`, html);

  const makeButton = (text, className = "admin-button") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    return button;
  };

  const createAuth = () => {
    const auth = document.createElement("div");
    const action = makeButton("", "admin-button");
    const dialog = document.createElement("form");
    const title = document.createElement("h2");
    const username = document.createElement("input");
    const password = document.createElement("input");
    const error = document.createElement("p");
    const submit = makeButton("Enter", "admin-button");

    auth.className = "admin-auth";
    dialog.className = "admin-dialog";
    dialog.hidden = true;
    title.textContent = "Admin";
    username.className = "admin-input";
    username.name = "username";
    username.autocomplete = "username";
    username.placeholder = "Username";
    password.className = "admin-input";
    password.name = "password";
    password.type = "password";
    password.autocomplete = "current-password";
    password.placeholder = "Password";
    error.className = "admin-error";
    submit.type = "submit";

    dialog.append(title, username, password, error, submit);
    auth.append(action);
    document.body.append(auth, dialog);

    const render = () => {
      action.textContent = isLoggedIn() ? "Logout" : "Login";
      document.documentElement.classList.toggle("admin-logged-in", isLoggedIn());
      renderAdmin();
    };

    action.addEventListener("click", () => {
      if (isLoggedIn()) {
        setLoggedIn(false);
        render();
        return;
      }
      dialog.hidden = !dialog.hidden;
      if (!dialog.hidden) username.focus();
    });

    dialog.addEventListener("submit", async (event) => {
      event.preventDefault();
      error.textContent = "";
      const attempt = await digest(`${username.value}:${password.value}`);
      if (attempt === ADMIN_DIGEST) {
        setLoggedIn(true);
        username.value = "";
        password.value = "";
        dialog.hidden = true;
        render();
      } else {
        error.textContent = "Access denied.";
      }
    });

    render();
  };

  const createToolbar = (target) => {
    const toolbar = document.createElement("div");
    toolbar.className = "admin-toolbar";

    const command = (label, action) => {
      const button = makeButton(label, "admin-button");
      button.addEventListener("click", action);
      toolbar.append(button);
    };

    command("B", () => document.execCommand("bold"));
    command("I", () => document.execCommand("italic"));
    command("Highlight", () => document.execCommand("insertHTML", false, `<span class="admin-highlight">${window.getSelection()}</span>`));
    command("Table", () => {
      const rows = Math.max(1, Number(prompt("Rows", "3")) || 3);
      const cols = Math.max(1, Number(prompt("Columns", "3")) || 3);
      const head = `<tr>${Array.from({ length: cols }, (_, i) => `<th>Header ${i + 1}</th>`).join("")}</tr>`;
      const body = Array.from({ length: rows }, () => `<tr>${Array.from({ length: cols }, () => "<td>Text</td>").join("")}</tr>`).join("");
      document.execCommand("insertHTML", false, `<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`);
    });
    command("Stat Block", () => {
      document.execCommand("insertHTML", false, `<div class="table-wrap"><table class="stat-block"><caption>Creature Name</caption><tbody><tr><td colspan="6"><strong>Armor Class</strong> 10<br><strong>Hit Points</strong> 1<br><strong>Speed</strong> 30 ft.</td></tr><tr class="ability-header"><th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th></tr><tr class="abilities"><td>10 (+0)</td><td>10 (+0)</td><td>10 (+0)</td><td>10 (+0)</td><td>10 (+0)</td><td>10 (+0)</td></tr><tr><td colspan="6"><strong>Actions.</strong> Add actions here.</td></tr></tbody></table></div>`);
    });
    command("Save Page", () => {
      saveContent(pageKey(), target.innerHTML);
      target.classList.remove("admin-editing");
    });
    command("Edit Page", () => {
      target.contentEditable = "true";
      target.classList.add("admin-editing");
      target.focus();
    });

    return toolbar;
  };

  const getEditableTarget = () => document.querySelector("main");

  const loadPageContent = () => {
    const target = getEditableTarget();
    const saved = target && storedContent(pageKey());
    if (target && saved) target.innerHTML = saved;
  };

  const renderCustomPage = () => {
    if (!window.location.hash.startsWith("#custom/")) return;
    const slug = window.location.hash.slice("#custom/".length);
    const classes = readClasses();
    const page = classes.flatMap((entry) => [entry, ...(entry.links || [])]).find((entry) => entry.slug === slug);
    const main = document.querySelector("main");
    if (!main || !page) return;
    main.innerHTML = storedContent(pageKey()) || `<h1 class="prompt">${page.title}</h1><section class="subclass-content"><p>Edit this new page while logged in.</p></section>`;
    document.title = `${page.title} - Fable`;
  };

  const renderClassAdditions = () => {
    const list = document.querySelector(".class-list");
    if (!list) return;

    readClasses().forEach((entry) => {
      const existingEntry = [...document.querySelectorAll(".class-entry")].find((item) => {
        const heading = item.querySelector("h3");
        return heading && slugify(heading.textContent.replace(/[+-]/g, "").trim()) === entry.slug;
      });
      let classEntry = existingEntry || document.querySelector(`[data-admin-class="${entry.slug}"]`);
      if (!classEntry) {
        classEntry = document.createElement("li");
        classEntry.className = "class-entry";
        classEntry.dataset.adminClass = entry.slug;
        classEntry.innerHTML = `<h3><a class="class-title-link" href="classes.html#custom/${entry.slug}">${entry.title}</a></h3><p class="class-context">${entry.description || "Custom class."}</p><ul></ul>`;
        list.append(classEntry);
      }

      const sublist = classEntry.querySelector("ul");
      (entry.links || []).forEach((link) => {
        if (!sublist.querySelector(`[data-admin-link="${link.slug}"]`)) {
          const item = document.createElement("li");
          item.dataset.adminLink = link.slug;
          item.innerHTML = `<a class="class-title-link" href="classes.html#custom/${link.slug}">${link.title}</a>`;
          sublist.append(item);
        }
      });
    });
  };

  const buildClassesPanel = () => {
    if (!document.querySelector(".class-list")) return null;

    const panel = document.createElement("form");
    panel.className = "admin-panel";
    panel.innerHTML = `
      <h2>Classes Admin</h2>
      <div class="admin-grid">
        <label>Title <input name="title" required></label>
        <label>Parent <select name="parent"><option value="">New class</option></select></label>
        <label class="wide">Description <textarea name="description"></textarea></label>
        <div class="wide"><button type="submit">Add Class / Sublink</button></div>
      </div>
    `;

    const parent = panel.elements.parent;
    document.querySelectorAll(".class-entry h3").forEach((heading) => {
      const title = heading.textContent.replace(/[+-]/g, "").trim();
      const option = document.createElement("option");
      option.value = slugify(title);
      option.textContent = title;
      parent.append(option);
    });

    panel.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = panel.elements.title.value.trim();
      if (!title) return;
      const classes = readClasses();
      const slug = slugify(title);
      const parentSlug = panel.elements.parent.value;

      let newHref = `classes.html#custom/${slug}`;

      if (parentSlug) {
        let entry = classes.find((item) => item.slug === parentSlug);
        if (!entry) {
          const existing = [...document.querySelectorAll(".class-entry h3")].find((heading) => slugify(heading.textContent.replace(/[+-]/g, "").trim()) === parentSlug);
          entry = { title: existing ? existing.textContent.replace(/[+-]/g, "").trim() : parentSlug, slug: parentSlug, description: "", links: [] };
          classes.push(entry);
        }
        entry.links = entry.links || [];
        entry.links.push({ title, slug, description: panel.elements.description.value.trim() });
      } else {
        classes.push({ title, slug, description: panel.elements.description.value.trim(), links: [] });
      }

      writeClasses(classes);
      panel.reset();
      renderClassAdditions();
      initClassCards();
      window.location.href = newHref;
    });

    return panel;
  };

  const initClassCards = () => {
    document.querySelectorAll(".class-entry:not([role='button']):not([data-admin-ready])").forEach((entry) => {
      entry.dataset.adminReady = "true";
      entry.tabIndex = 0;
      entry.setAttribute("role", "button");
      entry.setAttribute("aria-expanded", "false");

      const toggleEntry = () => {
        const isOpen = entry.classList.toggle("open");
        entry.setAttribute("aria-expanded", String(isOpen));
      };

      entry.addEventListener("click", toggleEntry);
      entry.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (event) => event.stopPropagation());
      });
      entry.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleEntry();
        }
      });
    });
  };

  const renderAdmin = () => {
    document.querySelectorAll("[data-admin-ui]").forEach((element) => element.remove());
    if (!isLoggedIn()) return;

    const main = document.querySelector("main");
    const target = getEditableTarget();
    if (!main || !target) return;

    const classesPanel = buildClassesPanel();
    const toolbar = createToolbar(target);
    toolbar.dataset.adminUi = "true";
    if (classesPanel) {
      classesPanel.dataset.adminUi = "true";
      main.before(classesPanel);
    }
    main.before(toolbar);
  };

  window.addEventListener("hashchange", () => {
    renderCustomPage();
    loadPageContent();
    renderAdmin();
  });

  renderCustomPage();
  loadPageContent();
  renderClassAdditions();
  createAuth();
  initClassCards();
})();
