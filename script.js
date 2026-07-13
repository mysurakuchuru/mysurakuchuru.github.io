const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const commandButton = document.getElementById("command-button");
const commandMenu = document.getElementById("command-menu");
const progress = document.getElementById("scroll-progress");
const toast = document.getElementById("toast");
const bootScreen = document.getElementById("boot-screen");
const bootOutput = document.getElementById("boot-output");
const bootProgressBar = document.getElementById("boot-progress-bar");
const bootProgressLabel = document.getElementById("boot-progress-label");
const bootSkip = document.getElementById("boot-skip");

const bootSteps = [
  ["ssh guest@mysura-data.dev", "[ OK ] encrypted portfolio session established"],
  ["mount /dev/portfolio", "[ OK ] 14 repositories indexed · integrity verified"],
  ["validate --contracts --quality", "[ OK ] schema · tests · documentation · lineage-ready"],
  ["load capability.matrix", "[ OK ] Python · SQL · dbt · AWS · BI · applied AI"],
  ["connect opportunity.network", "[ OK ] Charlotte, NC · data roles · OPEN_TO_WORK"],
  ["source ~/.data-ai-theme", "[ OK ] terminal interface · accessibility profile loaded"],
  ["render --format=terminal --sections=all", "[ OK ] system ready — welcome, guest"],
];

let bootFinished = false;
let bootCancelled = false;

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function appendBootLine(text, type) {
  const line = document.createElement("div");
  line.className = `boot-line ${type}`;
  if (type === "result" && text.startsWith("[ OK ]")) {
    const status = document.createElement("span");
    status.className = "ok";
    status.textContent = "[ OK ]";
    line.append(status, document.createTextNode(text.slice(6)));
  } else {
    line.textContent = text;
  }
  bootOutput.appendChild(line);
}

function rememberBoot() {
  try {
    sessionStorage.setItem("mrk-portfolio-booted", "true");
  } catch {
    // Storage can be unavailable in privacy modes; the boot still works.
  }
}

function finishBoot(animate = true) {
  if (bootFinished) return;
  bootFinished = true;
  bootCancelled = true;
  rememberBoot();
  document.body.classList.remove("booting");
  if (animate) {
    bootScreen.classList.add("exit");
    window.setTimeout(() => {
      bootScreen.hidden = true;
      bootScreen.setAttribute("aria-hidden", "true");
    }, 540);
  } else {
    bootScreen.hidden = true;
    bootScreen.setAttribute("aria-hidden", "true");
  }
}

async function runBootSequence() {
  for (let index = 0; index < bootSteps.length; index += 1) {
    if (bootCancelled) return;
    const [command, result] = bootSteps[index];
    appendBootLine(command, "command");
    await wait(145);
    if (bootCancelled) return;
    appendBootLine(result, "result");
    const percentage = Math.round(((index + 1) / bootSteps.length) * 100);
    bootProgressBar.style.width = `${percentage}%`;
    bootProgressLabel.textContent = `${percentage === 100 ? "READY" : "LOADING"} ${String(percentage).padStart(2, "0")}%`;
    await wait(index === bootSteps.length - 1 ? 420 : 300);
  }
  finishBoot(true);
}

const forceBoot = new URLSearchParams(window.location.search).get("boot") === "1";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let bootSeen = false;
try {
  bootSeen = sessionStorage.getItem("mrk-portfolio-booted") === "true";
} catch {
  bootSeen = false;
}

bootSkip.addEventListener("click", () => finishBoot(true));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !bootFinished) finishBoot(true);
});

if (!forceBoot && (bootSeen || reducedMotion)) {
  finishBoot(false);
} else {
  window.requestAnimationFrame(runBootSequence);
  window.setTimeout(() => finishBoot(true), 8000);
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("portfolio-theme");
} catch {
  savedTheme = null;
}
const defaultTheme = "dark";
root.dataset.theme = savedTheme || defaultTheme;

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("portfolio-theme", root.dataset.theme);
  } catch {
    // Theme switching still works when storage is unavailable.
  }
});

function updateProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = available > 0 ? (window.scrollY / available) * 100 : 0;
  progress.style.width = `${Math.min(100, percentage)}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const tocLinks = [...document.querySelectorAll(".toc a[data-section]")];
const sections = tocLinks
  .map((link) => document.getElementById(link.dataset.section))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    tocLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === visible.target.id);
    });
  },
  { rootMargin: "-18% 0px -62% 0px", threshold: [0.05, 0.2, 0.5] }
);
sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    document.querySelectorAll(".project-list article").forEach((project) => {
      const categories = project.dataset.category.split(" ");
      project.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

const roleLensContent = {
  engineer: {
    eyebrow: "ROLE LENS // DATA ENGINEERING",
    title: "Build the trustworthy data plane.",
    copy: "Pipelines, APIs, SQL models, cloud foundations, data quality, and documentation that make downstream analytics and ML safer to use.",
  },
  analytics: {
    eyebrow: "ROLE LENS // ANALYTICS ENGINEERING",
    title: "Turn governed data into reusable decisions.",
    copy: "Dimensional models, dbt-style testing, semantic metrics, lineage direction, and dashboard-ready datasets that keep business logic consistent.",
  },
  analyst: {
    eyebrow: "ROLE LENS // DATA ANALYSIS",
    title: "Find the signal and explain it clearly.",
    copy: "Exploratory analysis, reconciliations, KPI reporting, operational dashboards, and stakeholder-ready narratives grounded in evidence.",
  },
  aiml: {
    eyebrow: "ROLE LENS // AI + ML",
    title: "Make intelligence depend on clean foundations.",
    copy: "RAG, NLP, semantic search, feature quality, and evaluation patterns built on trustworthy data instead of ungoverned buzzwords.",
  },
};

const roleButtons = document.querySelectorAll(".role-switcher button[data-role]");
const roleEyebrow = document.getElementById("role-eyebrow");
const roleTitle = document.getElementById("role-title");
const roleCopy = document.getElementById("role-copy");

roleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = roleLensContent[button.dataset.role];
    if (!content) return;
    roleButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    roleEyebrow.textContent = content.eyebrow;
    roleTitle.textContent = content.title;
    roleCopy.textContent = content.copy;
  });
});

document.querySelectorAll("[data-tilt-card]").forEach((card) => {
  if (reducedMotion) return;
  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const xRatio = x / bounds.width - 0.5;
    const yRatio = y / bounds.height - 0.5;
    card.style.setProperty("--mx", `${Math.round((x / bounds.width) * 100)}%`);
    card.style.setProperty("--my", `${Math.round((y / bounds.height) * 100)}%`);
    card.style.setProperty("--ry", `${(xRatio * 3.2).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${(-yRatio * 3.2).toFixed(2)}deg`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
  });
});

function openCommandMenu() {
  if (!commandMenu.open) commandMenu.showModal();
}
commandButton.addEventListener("click", openCommandMenu);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandMenu();
  }
});
commandMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => commandMenu.close());
});

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

document.getElementById("copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("kuchurumysurareddy@gmail.com");
    showToast("email copied to clipboard");
  } catch {
    showToast("copy unavailable — use the email link");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
