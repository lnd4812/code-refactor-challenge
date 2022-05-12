const express = require('express');
const res = require('express/lib/response');
const mysql = require('mysql2');
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express()

// Express middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// connect to database
const{user, password} = require("./.env");
const db = mysql.createConnection(
    { 
        host: 'localhost',
        user: user,
        password: password,
        database: 'election'
    },
    console.log("Connected to the election database.")
);

// Get all candidates
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
        AS party_name
        FROM candidates
        LEFT JOIN parties
        ON candidates.party_id = parties.id`;

    db.query(sql, (err, rows) => {
        if(err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// get a single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*,
        AS party_name
        FROM candidates
        LEFT JOIN parties
        ON candidates.party_id = parties.id
         WHERE id = ?`;

    const params = [req.params.id];

    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// delete a candidate

app.delete('/api/candidate/:id', (req, res) => {
    const sql = "DELETE FROM candidates WHERE id = ?";
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
        res.statusMessage(400).json({error: res.message});
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// create a candidate
app.post('/api/candidate', ({body}, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
        VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];    

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: "success",
            data: body
        });    
    });
});

// update a candidate's party
app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');
        if (errors) {
            res.status(400).json({error: errors});
            return;
        }
    const sql = `UPDATE candidates SET party-id = ?
        WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];    

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({error: err.message});

           // check if record was found 
        } else if (!result.affectedRows) {
        res.json({
            message: "Candidate not found",
        });    
    }   else {
        res.json({
            message: 'success',
            data: req.body,
            changes: result.affectedRows
        });
    }
  });
});

// Get all parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;

    db.query(sql, (err, rows) => {
        if(err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// get a single party
app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
         
    const params = [req.params.id];

    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// delete a party

app.delete('/api/party/:id', (req, res) => {
    const sql = "DELETE FROM parties WHERE id = ?";
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
        res.statusMessage(400).json({error: res.message});
        } else if (!result.affectedRows) {
            res.json({
                message: 'Party not found'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});



// Default response for any other request (Not Found)
app.use((req, res) => {
 res.status(404).end();
});

app.listen(PORT, () =>{
    console.log("Server running on port ${PORT}");
});