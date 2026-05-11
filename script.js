class Task {
    constructor(name, date) {
        this.id = crypto.randomUUID();
        this.next = null;
        this.name = name;
        this.date = date;
        this.completed = false;
    }
}

class List {
    constructor() {
        this.firstTask = null;
        this.lastTask = null;
        this.table = null; // se inicializa cuando el DOM esté listo
        this.editingId = null;
        this.loaded = false; // indica si ya cargó desde localStorage
    }
    ensureTable() {
        if (!this.table) this.table = document.getElementById("taskTable");
        return this.table;
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
        this._renderRow(task);
        this.saveToLocalStorage();
    }
    _renderRow(task) {
        if (!this.ensureTable()) return;
        const row = document.createElement("tr");
        row.setAttribute("id", task.id);
        if (task.completed) row.classList.add('completed');
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
    render() {
        if (!this.ensureTable()) return;
        this.table.innerHTML = '';
        let current = this.firstTask;
        while (current) {
            this._renderRow(current);
            current = current.next;
        }
    }
    toArray() {
        const arr = [];
        let current = this.firstTask;
        while (current) {
            arr.push({ id: current.id, name: current.name, date: current.date, completed: !!current.completed });
            current = current.next;
        }
        return arr;
    }
    saveToLocalStorage() {
        try {
            const arr = this.toArray();
            localStorage.setItem('tasks', JSON.stringify(arr));
        } catch (e) {
            console.error('Error saving tasks to localStorage', e);
        }
    }
    loadFromLocalStorage() {
        try {
            // mark as attempted so subsequent operations don't overwrite unintentionally
            this.loaded = true;
            const raw = localStorage.getItem('tasks');
            if (!raw) return;
            const arr = JSON.parse(raw);
            this.firstTask = null;
            this.lastTask = null;
            for (const item of arr) {
                const t = new Task(item.name, item.date);
                t.id = item.id;
                t.completed = !!item.completed;
                t.next = null;
                if (this.firstTask === null) {
                    this.firstTask = t;
                    this.lastTask = t;
                } else {
                    this.lastTask.next = t;
                    this.lastTask = t;
                }
            }
            this.render();
            this.loaded = true;
        } catch (e) {
            console.error('Error loading tasks from localStorage', e);
        }
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
        this.saveToLocalStorage();
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
    const task = this.findById(taskid);
        if (!task) return;
        task.completed = !task.completed;
        const fila = document.getElementById(taskid);
        if (fila) {
            fila.classList.toggle("completed");
        }
        this.saveToLocalStorage();
    }  
}

const list = new List();

function addTask() {
    // ensure existing tasks are loaded before adding new one
    if (!list.loaded) list.loadFromLocalStorage();

    const inputTareaEl = document.getElementById("inputTask");
    const inputFechaEl = document.getElementById("inputDate");
    const inputTarea = inputTareaEl ? inputTareaEl.value.trim() : "";
    const inputFecha = inputFechaEl ? inputFechaEl.value : "";
    if (!inputTarea) {
        if (inputTareaEl) inputTareaEl.focus();
        alert('Por favor ingresa un nombre para la tarea.');
        return;
    }
    const task = new Task(inputTarea, inputFecha);
    list.add(task);
    if (inputTareaEl) inputTareaEl.value = "";
    if (inputFechaEl) inputFechaEl.value = "";
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
    const name = inputTarea ? inputTarea.value.trim() : "";
    const date = inputFecha ? inputFecha.value : "";
    if (!name) {
        if (inputTarea) inputTarea.focus();
        alert('Por favor ingresa un nombre para la tarea.');
        return;
    }
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
    // save changes to localStorage so edits persist
    list.saveToLocalStorage();
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
// Initialize buttons state on load and load saved tasks once the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        list.loadFromLocalStorage();
        updateActionButtons(false);
    });
} else {
    list.loadFromLocalStorage();
    updateActionButtons(false);
}
