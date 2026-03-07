class List {
    constructor() {
        this.tareas = [];
        this.taskTable = document.getElementById("taskTable");
    }
    add() {
        const inputTarea = document.getElementById("inputTask").value;
        const inputFecha = document.getElementById("inputDate").value;
        this.taskTable.innerHTML += `<tr>
            <td>${inputTarea}</td>
            <td>${inputFecha}</td>
            <td>
                <button id="delete" class="btn btn-outline-success btn-sm border-0" @onclick="() => BorrarTarea(id)">
                    <i class="bi bi-check-square"></i>
                </button>
                <button id="modify" class="btn btn-outline-primary btn-sm border-0" @onclick="() => BorrarTarea(id)">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button id="delete" class="btn btn-outline-danger btn-sm border-0" @onclick="() => BorrarTarea(id)">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`;
    }
    delete() {

    }
    modify() {

    }
    cross() {

    }
}

const list = new List();

function addTask() {
    list.add();
}

function deleteTask() {
    list.delete();
}

function modifyTask() {
    list.modify();
}

function crossTask() {
    list.cross();
}