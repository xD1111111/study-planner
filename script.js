// ===== DOM ELEMENTS =====
const titleInput    = document.getElementById("title");
const subjectInput  = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");
const priorityInput = document.getElementById("priority");
const addTaskBtn    = document.getElementById("addTaskBtn");
const taskList      = document.getElementById("taskList");

const totalTasksEl     = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const activeTasksEl    = document.getElementById("activeTasks");
const progressFill     = document.getElementById("progressFill");
const progressLabel    = document.getElementById("progressLabel");
const taskCountBadge   = document.getElementById("taskCount");

// ===== STATE =====
let tasks        = loadFromStorage();
let activeFilter = "all";
let activeSort   = "date-added";

const priorityOrder  = { high: 0, medium: 1, low: 2 };
const priorityLabels = { low: "Низький", medium: "Середній", high: "Високий" };

// ===== STORAGE =====
function saveToStorage() {
  localStorage.setItem("study-planner-tasks", JSON.stringify(tasks));
}

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("study-planner-tasks")) || [];
  } catch {
    return [];
  }
}

// ===== XSS PROTECTION =====
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== OVERDUE =====
function isOverdue(deadline) {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(deadline) < today;
}

// ===== FORMAT DATE =====
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
}

// ===== FILTERING & SORTING =====
function getFilteredSortedTasks() {
  let result = [...tasks];

  if (activeFilter === "completed") result = result.filter(t => t.completed);
  if (activeFilter === "active")    result = result.filter(t => !t.completed);

  if (activeSort === "priority") {
    result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (activeSort === "deadline") {
    result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else {
    result.sort((a, b) => b.id - a.id);
  }

  return result;
}

// ===== RENDER =====
function renderTasks() {
  const visible = getFilteredSortedTasks();

  if (visible.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <p>${activeFilter === "all" ? "Тут з'являться твої завдання" : "Немає завдань у цій категорії"}</p>
        ${activeFilter === "all" ? "<span>Додай перше завдання зліва →</span>" : ""}
      </div>`;
    updateStats();
    return;
  }

  taskList.innerHTML = "";

  visible.forEach((task, index) => {
    const overdue = isOverdue(task.deadline) && !task.completed;
    const card = document.createElement("div");
    card.classList.add("task-card", `priority-${task.priority}`);
    if (task.completed) card.classList.add("completed");
    if (overdue) card.classList.add("overdue");
    card.style.animationDelay = `${index * 0.05}s`;

    card.innerHTML = `
      <div class="card-top">
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span class="priority-badge">${priorityLabels[task.priority]}</span>
      </div>
      <div class="card-meta">
        <span class="meta-item"><span class="icon">📚</span>${escapeHtml(task.subject)}</span>
        <span class="meta-item">
          <span class="icon">📅</span>${formatDate(task.deadline)}
          ${overdue ? '<span class="overdue-tag">Прострочено</span>' : ""}
        </span>
      </div>
      <div class="task-buttons">
        <button class="btn-complete" onclick="toggleTask(${task.id})">
          ${task.completed ? "↩ Відновити" : "✓ Виконано"}
        </button>
        <button class="btn-delete" onclick="deleteTask(${task.id})">🗑 Видалити</button>
      </div>
    `;

    taskList.appendChild(card);
  });

  updateStats();
}

// ===== STATS =====
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active    = tasks.filter(t => !t.completed).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  totalTasksEl.textContent     = total;
  completedTasksEl.textContent = completed;
  activeTasksEl.textContent    = active;
  progressFill.style.width     = pct + "%";
  progressLabel.textContent    = pct + "%";

  taskCountBadge.textContent = getFilteredSortedTasks().length;
}

// ===== ADD =====
function addTask() {
  const title    = titleInput.value.trim();
  const subject  = subjectInput.value.trim();
  const deadline = deadlineInput.value;
  const priority = priorityInput.value;

  if (!title || !subject || !deadline) {
    shake(addTaskBtn);
    return;
  }

  tasks.push({
    id: Date.now(),
    title, subject, deadline, priority,
    completed: false
  });

  saveToStorage();
  renderTasks();

  titleInput.value    = "";
  subjectInput.value  = "";
  deadlineInput.value = "";
  priorityInput.value = "medium";
  titleInput.focus();
}

// ===== DELETE =====
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToStorage();
  renderTasks();
}

// ===== TOGGLE =====
function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveToStorage();
  renderTasks();
}

// ===== SHAKE =====
function shake(el) {
  el.style.animation = "none";
  el.offsetHeight;
  el.style.animation = "shake 0.4s ease";
  setTimeout(() => el.style.animation = "", 500);
}

// ===== EVENTS =====
addTaskBtn.addEventListener("click", addTask);

titleInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

document.querySelectorAll(".sort-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeSort = btn.dataset.sort;
    renderTasks();
  });
});

// ===== SHAKE KEYFRAME =====
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);

renderTasks();
