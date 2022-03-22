const detailsBox = document.getElementById("detailsBox");
const dateBox = document.getElementById("dateBox");
const timeBox = document.getElementById("timeBox");

//========Form==========

function isFormValid() {
    if (detailsBox.value === "" || dateBox.value === "" || timeBox.value === "") {
        return false;
    }
    return true;
}

function showFormError() {
    alert("Please fill task form");
}

function clearForm() {
    detailsBox.value = "";
    dateBox.value = "";
    timeBox.value = "";
}

//========Notes==========

function loadNotes() {
    let notes = localStorage.getItem("notes");
    if (notes === null) {
        return notes = [];
    }
    notes = JSON.parse(notes);
    return notes;
}

function saveNotes(task) {
    const notes = loadNotes();
    notes.push(task);
    // notes.unshift(task);
    const jsonNotesArray = JSON.stringify(notes);
    localStorage.setItem("notes", jsonNotesArray);
}

function printNotes() {
    const notes = loadNotes();
    console.log(notes);
}



//========Task==========

function createTask() {
    const task = {
        "details": detailsBox.value,
        "date": dateBox.value,
        "time": timeBox.value,
    }
    return task;
}

function saveTask() {
    if (!isFormValid()) {
        showFormError();
        return;
    }
    const task = createTask();
    saveNotes(task);
    clearForm();
    printNotes();
}