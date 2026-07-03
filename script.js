const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const commandButton = document.getElementById("command-button");
const commandMenu = document.getElementById("command-menu");
const progress = document.getElementById("scroll-progress");
const toast = document.getElementById("toast");

const savedTheme = localStorage.getItem("portfolio-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches
  ? "light"
  : "dark";
root.dataset.theme = savedTheme || preferredTheme;

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("portfolio-theme", root.dataset.theme);
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
