
function addTask() {
    let input = document.getElementById("taskInput");
    let task = input.value;
    let status = document.getElementById("statusInput").value;

    if (task === "") {
        alert("Please enter a task.");
        return;
    }

    let li = document.createElement("li");
    li.textContent = task + " - Status: " + status;

    li.onclick = function () {
        li.style.textDecoration = "line-through";
    };

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.onclick = function (event) {
        event.stopPropagation();
        li.remove();
    };

    li.appendChild(deleteButton);

    document.getElementById("taskList").appendChild(li);

    input.value = "";
    document.getElementById("statusInput").value = "Pending";
}

