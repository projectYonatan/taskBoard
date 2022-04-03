const detailsBox = document.getElementById("detailsBox");
const dateBox = document.getElementById("dateBox");
const timeBox = document.getElementById("timeBox");

function initializePage() {
    clearForm();
    displayAllNotes();
}

//========Form==========

function isFormValid() {
    if (detailsBox.value === "") {
        showFormError("details");
        return false;
    }
    if (dateBox.value === "") {
        showFormError("date");
        return false;
    }
    if (timeBox.value === "") {
        showFormError("time");
        return false;
    }
    if (!isFormDateValid()) {
        return false;
    }
    return true;
}

function isFormDateValid() {
    const nowDate = Date.now();
    const noteDate = new Date(`${dateBox.value} ${timeBox.value}`).getTime();
    if (nowDate > noteDate) {
        alert("date and time must be in the future");
        return false;
    }
    return true;
}

function showFormError(msg) {
    alert(`Please fill task ${msg}`);
}

function clearForm() {
    detailsBox.value = "";
    dateBox.value = "";
    timeBox.value = "";
    // cosmetic hack for browsers that don't show time/date inputs
    formPlaceholders();
}

function formPlaceholders() {
    // set placeholders for date/time form inputs
    // can also be rewritten to set default form date/time values...
    const now = new Date();
    const hourFromNow = new Date(now);
    hourFromNow.setHours(now.getHours() + 1);
    const date = hourFromNow.toISOString().slice(0, 10);
    const time = hourFromNow.toTimeString().slice(0, 5);
    dateBox.placeholder = date;
    timeBox.placeholder = time;
}

//======== Notes Storage ==========

function isNoteExpired(note) {
    const nowDate = Date.now();
    const expireDate = new Date(`${note.date} ${note.time}`).getTime();
    return nowDate > expireDate;
}

function setNoteExpired(note) {
    note.expired = isNoteExpired(note);
}

function loadAllNotes() {
    const jsonNotesArray = localStorage.getItem("notes") === null ? "[]" : localStorage.getItem("notes");
    const notes = JSON.parse(jsonNotesArray);
    notes.forEach(note => setNoteExpired(note)); // mark expired notes
    return notes;
}

function saveAllNotes(notes) {
    const jsonNotesArray = JSON.stringify(notes);
    localStorage.setItem("notes", jsonNotesArray);
}

function deleteAllNotes() {
    console.log("deleting all notes"); // for debugging
    localStorage.removeItem("notes");
    displayAllNotes();
}

function addNewNote(task) {
    console.log("adding note " + task.uid); // for debugging
    const notes = loadAllNotes();
    task.isNew = true; // temp prop for new note, delete in displayNewNote()
    notes.push(task);
    saveAllNotes(notes);
    // displayNewNote(task);
    displayAllNotes();
}

function deleteNote(uid) {
    console.log("deleting note " + uid); // for debugging
    const notes = loadAllNotes();
    const result = notes.filter(note => note.uid !== uid);
    saveAllNotes(result);
    displayAllNotes();
}

//======== Notes Display ==========

function showNoteDeleteButton(noteId) {
    noteWrapper = document.getElementById(noteId);
    noteDelete = noteWrapper.querySelector(".note-delete");
    noteDelete.classList.remove("faded-out-quick");
    noteDelete.classList.add("faded-in-quick");

}

function hideNoteDeleteButton(noteId) {
    noteWrapper = document.getElementById(noteId);
    noteDelete = noteWrapper.querySelector(".note-delete");
    noteDelete.classList.remove("faded-in-quick");
    noteDelete.classList.add("faded-out-quick");
}

function fadeInNote(noteWrapper) {
    window.setTimeout(() => {
        noteWrapper.classList.remove("faded-out");
        noteWrapper.classList.add("faded-in");
    }, 40)
}

function displayNewNote(note) {
    const notesAllWrapper = document.getElementById("notes-all-wrapper");
    const noteWrapper = createNoteElement(note);
    noteWrapper.classList.add("faded-out");
    notesAllWrapper.append(noteWrapper);
    fadeInNote(noteWrapper);
    noteWrapper.scrollIntoView({
        behavior: 'smooth'
    });
    delete note.isNew;
}

function displayAllNotes() {
    let notes = loadAllNotes();
    console.log("all notes in localStorage:"); // for debugging
    console.log(notes); // for debugging

    notes = notes.filter(note => !isNoteExpired(note)); // filter out expired notes

    const notesAllWrapper = document.getElementById("notes-all-wrapper");
    notesAllWrapper.innerHTML = "";

    for (let note of notes) {
        if (note.isNew) {
            displayNewNote(note);
        } else {
            const noteWrapper = createNoteElement(note);
            notesAllWrapper.append(noteWrapper);
        }
    }
    saveAllNotes(notes);
}

function createNoteElement(note) {
    const noteWrapper = document.createElement("div");
    const noteContainer = document.createElement("div");
    const noteDetails = document.createElement("div");
    const noteDate = document.createElement("div");
    const noteTime = document.createElement("div");

    noteWrapper.id = note.uid;
    noteWrapper.className = "note-wrapper";
    noteContainer.className = "note-container";
    noteDetails.className = "note-details";
    noteDate.className = "note-date";
    noteTime.className = "note-time";

    noteDetails.innerHTML = note.details;
    noteDate.innerHTML = note.date;
    noteTime.innerHTML = note.time;

    const noteDelete = document.createElement("span");
    noteDelete.className = "note-delete";
    noteDelete.classList.add("faded-out-quick", "bi-x-square-fill");

    noteDelete.onclick = function() {
        window.setTimeout(() => {
            deleteNote(note.uid)
        }, 40)
    };


    noteContainer.append(noteDetails, noteDate, noteTime);
    noteWrapper.append(noteDelete, noteContainer);

    noteWrapper.onmouseover = function() {
        showNoteDeleteButton(noteWrapper.id);
    }
    noteWrapper.onmouseout = function() {
        hideNoteDeleteButton(noteWrapper.id);
    }

    if (note.expired === true) { // in case we want to see expired notes unfiltered
        noteContainer.classList.add("note-expired");
        const msg = document.createElement("div");
        msg.innerHTML = "EXPIRED";
        noteContainer.insertBefore(msg, noteDate);
    }
    return noteWrapper;
}

//========Task==========

function saveTask() {
    if (!isFormValid()) {
        return;
    }
    const task = createTaskObject();
    clearForm();
    addNewNote(task);
}

function createTaskObject() {
    const timestamp = Date.now();
    const uid = generateTaskUID(timestamp);
    return {
        "timestamp": timestamp,
        "uid": uid,
        "details": detailsBox.value,
        "date": dateBox.value,
        "time": timeBox.value,
        "expired": false,
    }
}

/** append 5-digit randon int to epoch timestamp */
function generateTaskUID(timestamp) {
    const rand = Math.floor(Math.random() * 90000) + 10000;
    return `${timestamp}_${rand}`;
}