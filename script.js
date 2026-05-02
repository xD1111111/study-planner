const titleInput = document.getElementById("title");
const subjectInput = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");
const priorityInput = document.getElementById("priority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const activeTasks = document.getElementById("activeTasks");

let tasks = [];

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card", `priority-${task.priority}`);

    if (task.completed) {
      taskCard.classList.add("completed");
    }

    taskCard.innerHTML = `
      <h3>${task.title}</h3>
      <p><strong>Предмет:</strong> ${task.subject}</p>
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

function addTask() {
  const title = titleInput.value.trim();
  const subject = subjectInput.value.trim();
  const deadline = deadlineInput.value;
  const priority = priorityInput.value;

  if (title === "" || subject === "" || deadline === "") {
    alert("Будь ласка, заповни всі поля.");
    return;
  }

  const newTask = {
    id: Date.now(),
    title: title,
    subject: subject,
    deadline: deadline,
    priority: priority,
    completed: false
  };

  tasks.push(newTask);
  renderTasks();

  titleInput.value = "";
  subjectInput.value = "";
  deadlineInput.value = "";
  priorityInput.value = "low";
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  renderTasks();
}

function updateStats() {
  totalTasks.textContent = tasks.length;
  completedTasks.textContent = tasks.filter(task => task.completed).length;
  activeTasks.textContent = tasks.filter(task => !task.completed).length;
}

addTaskBtn.addEventListener("click", addTask);