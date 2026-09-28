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

    const task = taskInput.value.trim();
    const date = dateInput.value;
    const priority = priorityInput.value;
    const status = statusInput.value;

    if (task === "") {
        alert("Please enter a task.");
        taskInput.focus();
        return;
    }

    // Create task item
    const li = document.createElement("li");
    li.className = "task-item";

    if (status === "Completed") {
        li.classList.add("task-completed");
    }

    // Task information
    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    // Task title
    const taskTitle = document.createElement("div");
    taskTitle.className = "task-title";
    taskTitle.textContent = task;

    // Metadata
    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";

    // Priority badge
    const priorityBadge = document.createElement("span");
    priorityBadge.className =
        "badge priority-" + priority.toLowerCase();
    priorityBadge.textContent = priority;

    // Status badge
    const statusBadge = document.createElement("span");
    statusBadge.className =
        "badge status-" + status.toLowerCase().replace(" ", "-");
    statusBadge.textContent = status;

    // Due date
    const dateText = document.createElement("span");
    dateText.className = "task-date";

    if (date) {
        dateText.textContent = "Due: " + date;
    } else {
        dateText.textContent = "No due date";
    }

    // Add metadata elements
    taskMeta.appendChild(priorityBadge);
    taskMeta.appendChild(statusBadge);
    taskMeta.appendChild(dateText);

    // Add title and metadata to task info
    taskInfo.appendChild(taskTitle);
    taskInfo.appendChild(taskMeta);

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
        li.remove();
        updateStats();
    });

    // Add everything to task item
    li.appendChild(taskInfo);
    li.appendChild(deleteButton);

    // Add task to list
    taskList.appendChild(li);

    // Clear form
    taskInput.value = "";
    dateInput.value = "";
    priorityInput.value = "Medium";
    statusInput.value = "Pending";

    taskInput.focus();

    updateStats();
}

// Update task statistics
function updateStats() {
    const tasks = document.querySelectorAll(".task-item");

    let pending = 0;
    let progress = 0;
    let completed = 0;

    tasks.forEach(function (task) {
        const statusBadge = task.querySelector(".status-pending, .status-in-progress, .status-completed");

        if (!statusBadge) {
            return;
        }

        if (statusBadge.textContent === "Pending") {
            pending++;
        } else if (statusBadge.textContent === "In Progress") {
            progress++;
        } else if (statusBadge.textContent === "Completed") {
            completed++;
        }
    });

    totalTasks.textContent = tasks.length;
    pendingTasks.textContent = pending;
    progressTasks.textContent = progress;
    completedTasks.textContent = completed;

    taskCount.textContent =
        tasks.length + (tasks.length === 1 ? " Task" : " Tasks");

    if (tasks.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }
}