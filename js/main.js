const detailsBox = document.getElementById("detailsBox");
const dateBox = document.getElementById("dateBox");
const timeBox = document.getElementById("timeBox");

function initializePage() {
    clearForm();
    logNotes();
    displayNotes();
}

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

function logNotes() {
    const notes = loadNotes();
    console.log(notes);
}

function displayNotes() {
    const notes = loadNotes();
    const notesAllWrapper = document.getElementById("notes-all-wrapper");
    notesAllWrapper.innerHTML = "";

    for (let note of notes) {
        const noteWrapper = createNoteElement(note);
        notesAllWrapper.append(noteWrapper);
    }
}

function createNoteElement(note) {
    const noteWrapper = document.createElement("div");
    const noteContainer = document.createElement("div");
    const noteDetails = document.createElement("div");
    const noteDate = document.createElement("div");
    const noteTime = document.createElement("div");

    noteWrapper.id = "note-wrapper";
    noteContainer.id = "note-container";
    noteDetails.id = "note-details";
    noteDate.id = "note-date";
    noteTime.id = "note-time";

    noteDetails.innerHTML = note.details;
    noteDate.innerHTML = note.date;
    noteTime.innerHTML = note.time;

    noteContainer.append(noteDetails, noteDate, noteTime);
    noteWrapper.append(noteContainer);

    return noteWrapper;
}


//========Task==========

function createTask() {
    const task = {
        "id": generateTaskID(),
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
    logNotes();
    displayNotes();
}

function generateTaskID() {
    /** 
     * this uid should be safe enough
     * for this application's purposes
     * but consider adding extra validation of uniqueness
     * if time permits
     * */

    // milliseconds count from 1 Jan 1970
    const stamp = Date.now();
    // 5-digit random number:
    const rand = Math.floor(Math.random() * 90000) + 10000;
    const uid = `${stamp}_${rand}`;
    return uid;
}