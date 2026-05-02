// ===== DOM ELEMENTS =====
const titleInput    = document.getElementById("title");
const subjectInput  = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");
const priorityInput = document.getElementById("priority");
const addTaskBtn    = document.getElementById("addTaskBtn");
const taskList      = document.getElementById("taskList");

const totalTasks     = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const activeTasks    = document.getElementById("activeTasks");

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

let tasks = loadFromStorage();

// ===== XSS PROTECTION =====
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== RENDER =====
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card", `priority-${task.priority}`);
    if (task.completed) taskCard.classList.add("completed");

    taskCard.innerHTML = `
      <h3>${escapeHtml(task.title)}</h3>
      <p><strong>Предмет:</strong> ${escapeHtml(task.subject)}</p>
      <p><strong>Дедлайн:</strong> ${task.deadline}</p>
      <p><strong>Пріоритет:</strong> ${task.priority}</p>
      <div class="task-buttons">
        <button onclick="toggleTask(${task.id})">Виконано</button>
        <button onclick="deleteTask(${task.id})">Видалити</button>
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
  totalTasks.textContent     = tasks.length;
  completedTasks.textContent = tasks.filter(t => t.completed).length;
  activeTasks.textContent    = tasks.filter(t => !t.completed).length;
}

addTaskBtn.addEventListener("click", addTask);

renderTasks();
