const detailsBox = document.getElementById("detailsBox");
const dateBox = document.getElementById("dateBox");
const timeBox = document.getElementById("timeBox");

function initializePage() {
    clearForm();
    displayNotes();
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

//========Notes==========

function logNotes() { // for debugging
    const notes = loadNotes();
    console.log(notes);
}

function isNoteExpired(note) {
    const nowDate = Date.now();
    const expireDate = new Date(`${note.date} ${note.time}`).getTime();
    return nowDate > expireDate;
}

function setNoteExpired(note) {
    note.expired = isNoteExpired(note);
}

function loadNotes() {
    const jsonNotesArray = localStorage.getItem("notes") === null ? "[]" : localStorage.getItem("notes");
    const notes = JSON.parse(jsonNotesArray);
    notes.forEach(note => setNoteExpired(note)); // mark expired notes
    console.log(notes); // for debugging
    return notes;
}

function saveNotes(task) {
    const notes = loadNotes();
    notes.push(task);
    const jsonNotesArray = JSON.stringify(notes);
    localStorage.setItem("notes", jsonNotesArray);
}

function deleteAllNotes() {
    localStorage.removeItem("notes");
    displayNotes();
}

function hoverOverNote(noteId) {
    noteWrapper = document.getElementById(noteId);
    noteDelete = noteWrapper.querySelector("#note-delete");
    noteDelete.style.color = "red";
    noteWrapper.onmouseover = function() {
        noteDelete.classList.remove("faded-out-quick");
        noteDelete.classList.add("faded-in-quick");
    }
    noteWrapper.onmouseout = function() {
        noteDelete.classList.remove("faded-in-quick");
        noteDelete.classList.add("faded-out-quick");
    }
}

function showDeleteButton(noteId) {
    noteWrapper = document.getElementById(noteId);
    noteDelete = noteWrapper.querySelector("#note-delete");
    noteDelete.classList.remove("faded-out-quick");
    noteDelete.classList.add("faded-in-quick");

}

function hideDeleteButton(noteId) {
    noteWrapper = document.getElementById(noteId);
    noteDelete = noteWrapper.querySelector("#note-delete");
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
    // notesAllWrapper.prepend(noteWrapper);
    fadeInNote(noteWrapper);
}

function displayNotes() {
    let notes = loadNotes();

    // filter expired notes before display, uncomment to display all notes
    notes = notes.filter(note => !isNoteExpired(note));

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

    noteWrapper.id = note.uid;
    noteWrapper.className = "note-wrapper";
    noteContainer.className = "note-container";
    noteDetails.className = "note-details";
    noteDate.className = "note-date";
    noteTime.className = "note-time";

    noteDetails.innerHTML = note.details;
    noteDate.innerHTML = note.date;
    noteTime.innerHTML = note.time;

    const noteDelete = document.createElement("button");
    noteDelete.onclick = function() {
        deleteNote(note.uid)
    };
    noteDelete.innerHTML = "X";
    noteDelete.id = "note-delete";
    noteDelete.classList.add("faded-out-quick");

    noteContainer.append(noteDelete, noteDetails, noteDate, noteTime);
    noteWrapper.append(noteContainer);

    noteWrapper.onmouseover = function() {
        showDeleteButton(noteWrapper.id);
    }
    noteWrapper.onmouseout = function() {
        hideDeleteButton(noteWrapper.id);
    }

    if (note.expired === true) { // in case we want to see expired notes unfiltered
        noteContainer.classList.add("note-expired");
        const msg = document.createElement("div");
        msg.innerHTML = "EXPIRED";
        noteContainer.insertBefore(msg, noteDate);
    }
    return noteWrapper;
}

function deleteNote(uid) {

    console.log("deleting note " + uid);

    const notes = loadNotes();
    const result = notes.filter(note => note.uid !== uid);

    // for (let i = 0; i < notes.length; i++) {
    //     if (notes[i].uid === uid) {
    //         notes.splice(i, 1);
    //         break;
    //     }
    // }

    const jsonNotesArray = JSON.stringify(result);
    localStorage.setItem("notes", jsonNotesArray);
    displayNotes();
}


//========Task==========

function saveTask() {
    if (!isFormValid()) {
        return;
    }
    const task = createTask();
    clearForm();
    saveNotes(task);
    displayNewNote(task);
}

function createTask() {
    const taskMetadata = setTaskMetadata();
    const task = {
        "timestamp": taskMetadata.timestamp,
        "uid": taskMetadata.uid,
        "details": detailsBox.value,
        "date": dateBox.value,
        "time": timeBox.value,
        "expired": false,
    }
    return task;
}

function setTaskMetadata() {
    const timestamp = Date.now();
    const uid = generateTaskUID(timestamp);
    const metadata = {
        "timestamp": timestamp,
        "uid": uid,
    }
    return metadata;
}


function generateTaskUID(timestamp) {
    /** 
     * this uid should be unique enough for this application's purposes
     * but consider adding extra validation of uniqueness if time permits
     * */
    const rand = Math.floor(Math.random() * 90000) + 10000;
    const uid = `${timestamp}_${rand}`;
    return uid;
}