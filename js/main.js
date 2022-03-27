const detailsBox = document.getElementById("detailsBox");
const dateBox = document.getElementById("dateBox");
const timeBox = document.getElementById("timeBox");

function initializePage() {
    clearForm();
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
    const jsonNotesArray = localStorage.getItem("notes") === null ? [] : localStorage.getItem("notes");
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

    noteWrapper.id = "note-wrapper";
    noteContainer.id = "note-container";
    noteDetails.id = "note-details";
    noteDate.id = "note-date";
    noteTime.id = "note-time";

    noteDetails.innerHTML = note.details;
    noteDate.innerHTML = note.date;
    noteTime.innerHTML = note.time;

    const noteDelete = document.createElement("button");
    noteDelete.onclick = function() {
        deleteNote(note.uid)
    };
    noteDelete.innerHTML = "X";

    noteContainer.append(noteDelete, noteDetails, noteDate, noteTime);
    noteWrapper.append(noteContainer);

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
        showFormError();
        return;
    }
    const task = createTask();
    saveNotes(task);
    clearForm();
    displayNotes();
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