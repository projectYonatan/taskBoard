function initializePage() {
    clearForm();
    resetIsExpiredHidden(); // always hide expired notes on page refresh
    displayAllNotes();
    logAllNotes(); // for debugging
}

//======== Task ==========

function saveTask() {
    if (!isFormValid()) return;
    const task = createTaskObject();
    addNewNote(task);
    clearForm();
}

function createTaskObject() {
    return {
        "uid": generateTaskUID(),
        "details": document.getElementById("detailsBox").value,
        "date": document.getElementById("dateBox").value,
        "time": document.getElementById("timeBox").value,
        "expired": false,
    }
}

/** append random 5-digit int to epoch timestamp */
function generateTaskUID() {
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 90000) + 10000;
    return `${timestamp}_${rand}`;
}

//======== Form ==========

function clearForm() {
    document.getElementById("detailsBox").value = "";
    document.getElementById("dateBox").value = "";
    document.getElementById("timeBox").value = "";
    clearAllFormErrors();
}

function deleteAllNotes() {
    deleteAllNotesFromStorage();
    initializePage();
}

function isExpiredHidden() {
    const isExpiredHidden = !!+document.getElementById("isExpiredHiddenBox").value;
    console.log(`Expired notes are hidden: ${isExpiredHidden}`); // for debugging
    return isExpiredHidden;
}

function resetIsExpiredHidden() {
    const isExpiredHiddenBox = document.getElementById("isExpiredHiddenBox");
    isExpiredHiddenBox.value = "1";
}

function isFormValid() {
    const detailsBox = document.getElementById("detailsBox");
    const dateBox = document.getElementById("dateBox");
    const timeBox = document.getElementById("timeBox");
    if (detailsBox.value === "") {
        showFormError("details", "missing");
        return false;
    }
    if (dateBox.value === "") {
        showFormError("date", "missing");
        return false;
    }
    if (!isFormDateValid(dateBox)) {
        showFormError("date", "invalid");
        return false;
    }
    if (timeBox.value === "") {
        showFormError("time", "missing");
        return false;
    }
    if (!isFormDateTimeValid(dateBox, timeBox)) {
        showFormError("time", "invalid");
        return false;
    }
    return true;
}

function isFormDateValid(dateBox) {
    const nowJustDate = new Date().setHours(0, 0, 0, 0);
    const formJustDate = new Date(`${dateBox.value}`).setHours(0, 0, 0, 0);
    return formJustDate >= nowJustDate;
}

function isFormDateTimeValid(dateBox, timeBox) {
    const nowDateTime = Date.now();
    const formDateTime = new Date(`${dateBox.value} ${timeBox.value}`).getTime();
    return formDateTime > nowDateTime;
}

function clearAllFormErrors() {
    const inputs = ["details", "date", "time"];
    inputs.forEach(clearFormError);
}

function clearFormError(input) {
    const formInputElement = document.getElementById(`${input}Box`);
    const errorMsgElement = document.getElementById(`form-error-${input}`);
    formInputElement.style.backgroundColor = "";
    if (errorMsgElement) {
        createCssOpacityTransition(errorMsgElement, 0, 0.4);
        window.setTimeout(() => {
            errorMsgElement.remove();
        }, 500)
    }
}

function showFormError(input, msg) {
    const errorMsg = `Task ${input} ${msg}`;
    const formInputElement = document.getElementById(`${input}Box`);
    formInputElement.style.backgroundColor = "rgba(192, 0, 0, 0.25)";
    const formContainer = document.getElementById("form-container")
    const errorMsgElement = document.createElement("div");
    errorMsgElement.id = `form-error-${input}`;
    errorMsgElement.classList.add("form-error", "faded-out");
    errorMsgElement.innerHTML = errorMsg;
    formContainer.appendChild(errorMsgElement);
    createCssOpacityTransition(errorMsgElement, 1, 0.5);
    // formInputElement.addEventListener("click", (_event) => {
    //     // event.target.style.backgroundColor = "";
    //     // clearFormError(input);
    //     clearAllFormErrors();
    // }, {
    //     once: true
    // });
    const formInputs = document.querySelectorAll("input,textarea,label");
    formInputs.forEach(formInput => formInput.addEventListener("click", clearAllFormErrors, {
        once: true
    }));
}

/**
 * Create CSS opacity transition
 * @param {Element} formInputElement 
 * @param {number} opacity (between 0 and 1)
 * @param {number} duration (in seconds)
 */
function createCssOpacityTransition(formInputElement, opacity, duration) {
    if (opacity < 0) opacity = 0;
    if (opacity > 1) opacity = 1;
    window.setTimeout(() => {
        formInputElement.style.opacity = `${opacity}`;
        formInputElement.style.transition = `opacity ${duration}s ease-out`;
    }, 40)
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
    notes.forEach(setNoteExpired); // mark expired notes
    return notes;
}

function saveAllNotes(notes) {
    const jsonNotesArray = JSON.stringify(notes);
    localStorage.setItem("notes", jsonNotesArray);
}

function deleteAllNotesFromStorage() {
    console.log("deleting all notes"); // for debugging
    localStorage.removeItem("notes");
}

function addNewNote(task) {
    console.log("adding note " + task.uid); // for debugging
    const notes = loadAllNotes();
    notes.push(task);
    displayAllNotes();
    saveAllNotes(notes);
    displayNewNote(task);
    logAllNotes(); // for debugging
}

function deleteNote(uid) {
    console.log("deleting note " + uid); // for debugging
    const notes = loadAllNotes();
    const result = notes.filter(note => note.uid !== uid);
    saveAllNotes(result);
    displayAllNotes();
    logAllNotes(); // for debugging
}

function logAllNotes() { // for debugging
    const notes = loadAllNotes();
    console.log("all notes in localStorage:");
    console.log(notes);
}

//======== Notes Display ==========

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
}

function displayAllNotes() {
    let notes = loadAllNotes();
    if (isExpiredHidden()) {
        notes = notes.filter(note => !(note.expired)); // filter out expired notes
    }

    const notesAllWrapper = document.getElementById("notes-all-wrapper");
    notesAllWrapper.innerHTML = "";

    for (const note of notes) {
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
        // noteContainer.classList.add("note-expired");
        const msg = document.createElement("div");
        msg.classList.add("note-expired");
        msg.innerHTML = "EXPIRED";
        // noteContainer.insertBefore(msg, noteDate);
        // noteContainer.insertBefore(msg, noteDetails);
        noteContainer.append(msg);
    }
    return noteWrapper;
}

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