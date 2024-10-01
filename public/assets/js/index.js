let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let clearBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelector('.list-container .list-group'); // Use querySelector for a single element
  console.log('Initialized note elements'); // Log element initialization
}

// Show an element
const show = (elem) => {
  if (elem && typeof elem === 'object' && elem.nodeType === 1) {
    elem.style.display = 'inline';
    console.log(`Showing element: ${elem.className}`);
  }
};

// Hide an element
const hide = (elem) => {
  if (elem && typeof elem === 'object' && elem.nodeType === 1) {
    elem.style.display = 'none';
    console.log(`Hiding element: ${elem.className}`);
  }
};

// Active note
let activeNote = {};

// Fetch notes from the server
const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    console.log('Fetched notes from server');
    return response;
  });

// Save a new note
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  }).then(() => {
    console.log('Saved new note:', note);
  });

// Delete a note
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(() => {
    console.log(`Deleted note with ID: ${id}`);
  });

const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
    console.log('Rendered active note:', activeNote);
  } else {
    hide(newNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
    console.log('Cleared active note');
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value
  };

  console.log('Attempting to save note:', newNote);

  // Only save if both fields are filled
  if (newNote.title && newNote.text) {
    saveNote(newNote).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  } else {
    console.log('Note title and text cannot be empty');
  }
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  console.log('Viewing note:', activeNote);
  renderActiveNote();
};

// Sets the activeNote to an empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

// Renders the appropriate buttons based on the state of the form
const handleRenderBtns = () => {
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(saveNoteBtn);
    hide(clearBtn);
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
    show(clearBtn);
  } else {
    show(saveNoteBtn);
    show(clearBtn);
  }
};

// Render the list of note titles
const renderNoteList = async (notes) => {
  try {
    console.log(typeof notes)
    let jsonNotes = JSON.parse(notes);
    console.log('Notes received from API:', jsonNotes);

    // Clear existing notes
    noteList.innerHTML = ''; // Clear entire list instead of forEach

    let noteListItems = [];

    // Function to create list items
    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item');

      const spanEl = document.createElement('span');
      spanEl.classList.add('list-item-title');
      spanEl.innerText = text;
      spanEl.addEventListener('click', handleNoteView);

      liEl.appendChild(spanEl);

      if (delBtn) {
        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add(
          'fas',
          'fa-trash-alt',
          'float-right',
          'text-danger',
          'delete-note'
        );
        delBtnEl.addEventListener('click', handleNoteDelete);
        liEl.appendChild(delBtnEl);
      }

      return liEl;
    };

    // Check if there are any notes
    if (jsonNotes.length === 0) {
      noteListItems.push(createLi('No saved Notes', false));
    } else {
      jsonNotes.forEach((note) => {
        const li = createLi(note.title);
        li.dataset.note = JSON.stringify(note); // Store the note data in the element
        noteListItems.push(li);
      });
    }

    // Append new notes to the UI
    noteListItems.forEach((note) => noteList.appendChild(note)); // Append new notes

    console.log('Rendered note list items:', noteListItems);
  } catch (error) {
    console.error('Error rendering notes:', error);
  }
};

// Gets notes from the database and renders them to the sidebar
const getAndRenderNotes = () => {
  console.log('Fetching and rendering notes...');
  
  return getNotes()
    .then((response) => {
      console.log('Notes fetched successfully:', response.status);
      return response.json();
    })
    .then((jsonNotes) => {
      console.log('Parsed JSON notes:', jsonNotes);
      renderNoteList(jsonNotes); // Pass JSON directly to renderNoteList
    })
    .catch((error) => {
      console.error('Error fetching or parsing notes:', error);
    });
};

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);
  noteForm.addEventListener('input', handleRenderBtns);
}

// Initial fetch and render of notes
getAndRenderNotes();
