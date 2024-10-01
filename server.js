const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading notes');
        }
        res.json(data);
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = { id: uuidv4(), title: req.body.title, text: req.body.text };

    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading notes');
        }

        const notes = JSON.parse(data || '[]'); // Handle empty file
        notes.push(newNote);

        fs.writeFile('db.json', JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving note');
            }
            res.json(newNote);
        });
    });
});

// Bonus: DELETE route
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading notes');
        }

        let notes = JSON.parse(data || '[]'); // Handle empty file
        notes = notes.filter(note => note.id !== noteId);

        fs.writeFile('db.json', JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error deleting note');
            }
            res.json({ message: 'Note deleted' });
        });
    });
});

// 404 handler
///app.use((req, res) => {
  //  res.status(404).send('404: Page not found');
//});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
