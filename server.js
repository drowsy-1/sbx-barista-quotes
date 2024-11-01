const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const dbPath = path.join(__dirname, 'quotes.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the quotes database.');
});

db.run(`CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

app.get('/api/quotes', (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;

    db.all(
        `SELECT * FROM quotes ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

app.post('/api/quotes', (req, res) => {
    const { text, city, state } = req.body;
    const date = new Date().toLocaleDateString();

    db.run(
        `INSERT INTO quotes (text, city, state, date) VALUES (?, ?, ?, ?)`,
        [text, city, state, date],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                id: this.lastID,
                text,
                city,
                state,
                date
            });
        }
    );
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});