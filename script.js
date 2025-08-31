const themeBtn = document.getElementById('themeBtn');
const notesContainer = document.getElementById('notesContainer');

// Theme toggle
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeBtn.innerHTML = document.body.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
}

// Formatting
function formatText(command, value = null) {
  document.execCommand(command, false, value);
}

let savedSelection = null;
function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) savedSelection = sel.getRangeAt(0);
}
function restoreSelection() {
  if (savedSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelection);
  }
}
document.addEventListener('click', e => {
  if (e.target.closest('.note-content') || e.target.closest('#noteContent')) saveSelection();
});
function formatCheckbox() {
  restoreSelection();
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  if (savedSelection) {
    savedSelection.insertNode(checkbox);
    savedSelection.setStartAfter(checkbox);
    savedSelection.setEndAfter(checkbox);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(savedSelection);
  }
}

// Notes logic
let notes = JSON.parse(localStorage.getItem('notes') || '[]');
renderNotes();

function addNote() {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').innerHTML.trim();
  const color = document.getElementById('noteColor').value;
  if (!title && !content) return;

  notes.push({ title, content, color });
  localStorage.setItem('notes', JSON.stringify(notes));
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContent').innerHTML = '';
  renderNotes();
}

function deleteNote(index) {
  notes.splice(index, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

function renderNotes() {
  notesContainer.innerHTML = '';
  notes.forEach((note, index) => {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    noteDiv.id = 'note-' + index;
    noteDiv.style.background = note.color;
    noteDiv.innerHTML = `
  <div class="note-actions">
    <button class="delete-btn" onclick="deleteNote(${index})"><i class="fas fa-trash"></i></button>
    <button class="pdf-btn" onclick="saveAsPDF(${index})"><i class="fas fa-file-pdf"></i></button>
    <button class="copy-btn" onclick="copyNote(${index})"><i class="fas fa-copy"></i></button>
  </div>
  <h3 contenteditable="true" class="note-title">${note.title}</h3>
  <div class="note-content" contenteditable="true">${note.content}</div>
  <div class="note-color-wrapper">
    <label>Color:</label>
    <input type="color" value="${note.color}" onchange="changeColor(${index}, this.value)">
  </div>
`;

    const titleEl = noteDiv.querySelector('.note-title');
    const contentEl = noteDiv.querySelector('.note-content');
    titleEl.addEventListener('input', () => autosave(index));
    contentEl.addEventListener('input', () => autosave(index));

    notesContainer.appendChild(noteDiv);
  });
}

function autosave(index) {
  const noteDiv = document.getElementById('note-' + index);
  notes[index].title = noteDiv.querySelector('.note-title').innerHTML;
  notes[index].content = noteDiv.querySelector('.note-content').innerHTML;
  localStorage.setItem('notes', JSON.stringify(notes));
}

function changeColor(index, color) {
  notes[index].color = color;
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

// Export PDF
function saveAsPDF(index) {
  const note = notes[index];
  const tempDiv = document.createElement('div');
  tempDiv.style.padding = "15px";
  tempDiv.style.background = note.color;
  tempDiv.innerHTML = `<h3>${note.title}</h3><div>${note.content}</div>`;
  html2pdf().from(tempDiv).set({
    margin: 10,
    filename: `${note.title || 'note'}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).save();
}

// Copy note
function copyNote(index) {
  const noteDiv = document.getElementById('note-' + index);
  if (!noteDiv) return;

  const title = noteDiv.querySelector('.note-title')?.innerText || "";
  const content = noteDiv.querySelector('.note-content')?.innerText || "";

  const text = `${title}\n\n${content}`;

  navigator.clipboard.writeText(text).then(() => {
    alert('Note copied to clipboard!');
  }).catch(err => {
    console.error('Clipboard error:', err);
    alert('Failed to copy note!');
  });
}

