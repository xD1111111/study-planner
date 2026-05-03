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
  taskList.innerHTML = "";

  if (visible.length === 0) {
    taskList.innerHTML = `<p style="color:#7a8099;text-align:center;padding:30px 0;">Немає завдань</p>`;
    updateStats();
    return;
  }

  visible.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card", `priority-${task.priority}`);
    if (task.completed) taskCard.classList.add("completed");

    taskCard.innerHTML = `
      <h3>${escapeHtml(task.title)}</h3>
      <p><strong>Предмет:</strong> ${escapeHtml(task.subject)}</p>
      <p><strong>Дедлайн:</strong> ${task.deadline}</p>
      <p><strong>Пріоритет:</strong> ${priorityLabels[task.priority]}</p>
      <div class="task-buttons">
        <button onclick="toggleTask(${task.id})">${task.completed ? "↩ Відновити" : "✓ Виконано"}</button>
        <button onclick="deleteTask(${task.id})">🗑 Видалити</button>
      </div>
    `;

    taskList.appendChild(taskCard);
  });

  updateStats();
}

// ===== ADD =====
function addTask() {
  const title    = titleInput.value.trim();
  const subject  = subjectInput.value.trim();
  const deadline = deadlineInput.value;
  const priority = priorityInput.value;

  if (!title || !subject || !deadline) {
    alert("Будь ласка, заповни всі поля.");
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

// ===== STATS =====
function updateStats() {
  totalTasksEl.textContent     = tasks.length;
  completedTasksEl.textContent = tasks.filter(t => t.completed).length;
  activeTasksEl.textContent    = tasks.filter(t => !t.completed).length;
}

// ===== FILTER BUTTONS =====
addTaskBtn.addEventListener("click", addTask);

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

renderTasks();
