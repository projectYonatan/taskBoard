/**
 * optional placeholders for date/time form inputs
 * can also be rewritten to set default form date/time values...
 */
function formPlaceholders() {
    const now = new Date();
    const hourFromNow = new Date(now);
    hourFromNow.setHours(now.getHours() + 1);
    const date = hourFromNow.toISOString().slice(0, 10);
    const time = hourFromNow.toTimeString().slice(0, 5);
    dateBox.placeholder = date;
    timeBox.placeholder = time;
}