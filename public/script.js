const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressTasks = document.getElementById("progressTasks");
const completedTasks = document.getElementById("completedTasks");
const taskCount = document.getElementById("taskCount");

// Add a new task
taskForm.addEventListener("submit", function (event) {
event.preventDefault();
addTask();
});

function addTask() {
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const priorityInput = document.getElementById("priorityInput");
const statusInput = document.getElementById("statusInput");

```
const task = taskInput.value.trim();
const date = dateInput.value;
const priority = priorityInput.value;
const status = statusInput.value;

if (task === "") {
    alert("Please enter a task.");
    taskInput.focus();
    return;
}

// Create the task item
const li = document.createElement("li");
li.className = "task-item";

if (status === "Completed") {
    li.classList.add("task-completed");
}

// Create task information container
const taskInfo = document.createElement("div");
taskInfo.className = "task-info";

// Create task title
const taskTitle = document.createElement("div");
taskTitle.className = "task-title";
taskTitle.textContent = task;

// Create metadata container
const taskMeta = document.createElement("div");
taskMeta.className = "task-meta";

// Create priority badge
const priorityBadge = document.createElement("span");
priorityBadge.className =
    "badge priority-" + priority.toLowerCase();
priorityBadge.textCont
```
}