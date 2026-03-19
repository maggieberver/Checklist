class Task {
    constructor(name, date) {
        this.id = crypto.randomUUID();;
        this.next = null;
        this.name = name;
        this.date = date;
    }
}

class List {
    constructor() {
        this.firstTask = null;
        this.lastTask = null;
        this.table = document.getElementById("taskTable");
        this.editingId = null;
    }
    findById(id) {
        let current = this.firstTask;
        while (current) {
            if (current.id === id) return current;
            current = current.next;
        }
        return null;
    }
    add(task) {
        if (this.firstTask === null) {
            this.firstTask = task;
            this.lastTask = task;
        } else {
            this.lastTask.next = task;
            this.lastTask = task;
        }
        const row = document.createElement("tr");
        row.setAttribute("id", task.id); 
        row.innerHTML = `
            <td>${task.name}</td>
            <td>${task.date}</td>
            <td class="text-center">
                <button class="btn btn-outline-success btn-sm border-0" onclick="crossTask('${task.id}')">
                    <i class="bi bi-check-square"></i>
                </button>
                <button class="btn btn-outline-primary btn-sm border-0" onclick="modifyTask('${task.id}')">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm border-0" onclick="deleteTask('${task.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>`;
        this.table.appendChild(row);
    }
    delete(taskid) {
        const task = this.findById(taskid);
        if (!task) return;
        if (this.firstTask === task) {
            this.firstTask = this.firstTask.next;
            if (this.firstTask === null) this.lastTask = null;
        } else {
            let current = this.firstTask;
            while (current && current.next !== task) {
                current = current.next;
            }
            if (current) {
                current.next = task.next;
                if (this.lastTask === task) this.lastTask = current;
            }
        }
        const row = document.getElementById(taskid);
        if (row) row.remove();
    }
    modify(taskid) {
        const task = this.findById(taskid);
        if (!task) return;
        const inputTarea = document.getElementById("inputTask");
        const inputFecha = document.getElementById("inputDate");
        if (inputTarea) inputTarea.value = task.name;
        if (inputFecha) inputFecha.value = task.date;
        this.editingId = taskid;
        if (inputTarea) inputTarea.focus();
        if (typeof updateActionButtons === 'function') updateActionButtons(true);
    }
    cross(taskid) {
    const fila = document.getElementById(taskid);
        if (fila) {
            fila.classList.toggle("completed");
        }
    }  
}

const list = new List();

function addTask() {
    const inputTarea = document.getElementById("inputTask").value;
    const inputFecha = document.getElementById("inputDate").value;
    const task = new Task(inputTarea, inputFecha);
    list.add(task);
    document.getElementById("inputTask").value = "";
    document.getElementById("inputDate").value = "";
}

function deleteTask(taskid) {
    list.delete(taskid);
}

function modifyTask(taskid) {
    list.modify(taskid);
}

function crossTask(taskid) {
    list.cross(taskid);
}

function updateActionButtons(editing) {
    const actionBtn = document.getElementById("actionButton");
    const cancelBtn = document.getElementById("cancelButton");
    if (!actionBtn) return;
    if (editing) {
        actionBtn.textContent = "Modify";
        actionBtn.onclick = saveEdit;
        if (cancelBtn) cancelBtn.classList.remove("d-none");
    } else {
        actionBtn.textContent = "Add";
        actionBtn.onclick = addTask;
        if (cancelBtn) cancelBtn.classList.add("d-none");
    }
}

function saveEdit() {
    if (!list.editingId) return;
    const inputTarea = document.getElementById("inputTask");
    const inputFecha = document.getElementById("inputDate");
    const name = inputTarea ? inputTarea.value : "";
    const date = inputFecha ? inputFecha.value : "";
    const task = list.findById(list.editingId);
    if (!task) return;
    task.name = name;
    task.date = date;
    const row = document.getElementById(list.editingId);
    if (row) {
        const cells = row.getElementsByTagName("td");
        if (cells[0]) cells[0].innerText = task.name;
        if (cells[1]) cells[1].innerText = task.date;
    }
    list.editingId = null;
    if (inputTarea) inputTarea.value = "";
    if (inputFecha) inputFecha.value = "";
    updateActionButtons(false);
}

function cancelEdit() {
    const inputTarea = document.getElementById("inputTask");
    const inputFecha = document.getElementById("inputDate");
    if (inputTarea) inputTarea.value = "";
    if (inputFecha) inputFecha.value = "";
    list.editingId = null;
    updateActionButtons(false);
}

// Initialize buttons state on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updateActionButtons(false));
} else {
    updateActionButtons(false);
}