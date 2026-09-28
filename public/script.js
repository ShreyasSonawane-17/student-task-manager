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

```
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const priorityInput = document.getElementById("priorityInput");
const statusInput = document.getElementById("statusInput");

const task = taskInput.value.trim();
const date = dateInput.value;
const priority = priorityInput.value;
const status = statusInput.value;

// Check if task name is empty
if (task === "") {
    alert("Please enter a task.");
    taskInput.focus();
    return;
}

// Create task list item
const li = document.createElement("li");
li.className = "task-item";

// Mark completed tasks
if (status === "Completed") {
    li.classList.add("task-completed");
}

// Task information container
const taskInfo = document.createElement("div");
taskInfo.className = "task-info";

// Task title
const taskTitle = document.createElement("div");
taskTitle.className = "task-title";
taskTitle.textContent = task;

// Task metadata
const taskMeta = document.createElement("div");
taskMeta.className = "task-meta";

// Priority badge
const priorityBadge = document.createElement("span");

priorityBadge.className =
    "badge priority-" + priority.toLowerCase();

priorityBadge.textContent =
    priority + " Priority";

// Status badge
const statusBadge = document.createElement("span");

if (status === "In Progress") {
    statusBadge.className = "badge status-progress";
} else if (status === "Completed") {
    statusBadge.className = "badge status-completed";
} else {
    statusBadge.className = "badge status-pending";
}

statusBadge.textContent = status;

// Add badges
taskMeta.appendChild(priorityBadge);
taskMeta.appendChild(statusBadge);

// Add due date if selected
if (date !== "") {

    const dueDate = document.createElement("span");

    dueDate.className = "due-date";

    dueDate.textContent =
        "Due: " + formatDate(date);

    taskMeta.appendChild(dueDate);
}

// Add title and metadata
taskInfo.appendChild(taskTitle);
taskInfo.appendChild(taskMeta);

// Delete button
const deleteButton = document.createElement("button");

deleteButton.className = "delete-btn";
deleteButton.textContent = "Delete";

deleteButton.addEventListener("click", function (event) {

    event.stopPropagation();

    li.remove();

    updateDashboard();
});

// Add task information and delete button
li.appendChild(taskInfo);
li.appendChild(deleteButton);

// Add task to list
taskList.appendChild(li);

// Reset form
resetForm();

// Update dashboard counters
updateDashboard();
```

}

// Reset form after adding task
function resetForm() {

```
document.getElementById("taskInput").value = "";

document.getElementById("priorityInput").value =
    "Medium";

document.getElementById("statusInput").value =
    "Pending";

document.getElementById("dateInput").value = "";

document.getElementById("taskInput").focus();
```

}

// Format date from YYYY-MM-DD to DD/MM/YYYY
function formatDate(date) {

```
const parts = date.split("-");

if (parts.length !== 3) {
    return date;
}

return `${parts[2]}/${parts[1]}/${parts[0]}`;
```

}

// Update dashboard statistics
function updateDashboard() {

```
const tasks =
    document.querySelectorAll("#taskList .task-item");

let pending = 0;
let progress = 0;
let completed = 0;

tasks.forEach(function (task) {

    const badges =
        task.querySelectorAll(".badge");

    if (badges.length < 2) {
        return;
    }

    const status = badges[1].textContent;

    if (status === "Pending") {
        pending++;
    }

    else if (status === "In Progress") {
        progress++;
    }

    else if (status === "Completed") {
        completed++;
    }
});

// Update statistics
totalTasks.textContent = tasks.length;
pendingTasks.textContent = pending;
progressTasks.textContent = progress;
completedTasks.textContent = completed;

// Update task counter
if (tasks.length === 1) {
    taskCount.textContent = "1 Task";
} else {
    taskCount.textContent = tasks.length + " Tasks";
}

// Show empty state when there are no tasks
if (tasks.length === 0) {
    emptyState.style.display = "block";
} else {
    emptyState.style.display = "none";
}
```

}

// Initialize dashboard
updateDashboard();
