document.addEventListener("DOMContentLoaded", () => {
    const tasksList = document.getElementById("tasksList");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const newTaskInput = document.getElementById("newTask");

    // Cargar tareas existentes
    loadTasks();

    // Agregar nueva tarea
    addTaskBtn.addEventListener("click", () => {
        const taskText = newTaskInput.value.trim();
        if (taskText !== "") {
            addTask(taskText);
            newTaskInput.value = ""; // Limpiar el input
        }
    });

    // Eliminar tarea
    tasksList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete")) {
            const taskId = e.target.dataset.id;
            deleteTask(taskId);
        }
    });

    function loadTasks() {
        fetch("tasks.php?action=get")
            .then(response => response.json())
            .then(data => {
                tasksList.innerHTML = "";
                data.tasks.forEach(task => {
                    addTaskToDOM(task);
                });
            })
            .catch(error => console.error('Error loading tasks:', error));
    }

    function addTask(taskText) {
        fetch("tasks.php?action=add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ task: taskText })
        })
        .then(response => response.json())
        .then(task => {
            addTaskToDOM(task);
        })
        .catch(error => console.error('Error adding task:', error));
    }

    function deleteTask(taskId) {
        fetch(`tasks.php?action=delete&id=${taskId}`, { method: "DELETE" })
            .then(() => {
                document.querySelector(`tr[data-id="${taskId}"]`).remove();
            })
            .catch(error => console.error('Error deleting task:', error));
    }

    function updateTaskStatus(taskId, isCompleted) {
        fetch(`tasks.php?action=update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: taskId, completed: isCompleted })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task status updated:', data);
        })
        .catch(error => console.error('Error updating task status:', error));
    }

    function addTaskToDOM(task) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", task.id);
        row.innerHTML = `
            <td>
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            </td>
            <td>${task.text}</td>
            <td>
                <button class="delete" data-id="${task.id}">Eliminar</button>
            </td>
        `;
        tasksList.appendChild(row);

        // Manejar el evento de cambio en el checkbox
        row.querySelector(".task-checkbox").addEventListener("change", (e) => {
            const taskId = task.id;
            const isChecked = e.target.checked;
            updateTaskStatus(taskId, isChecked);
        });
    }
});
