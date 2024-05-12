const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path'); // Import path module
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let roommates = require('./roommates.json');
let gastos = require('./gastos.json');


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/roommate', async (req, res) => {
    try {
        const fetch = await import('node-fetch'); // Dynamic import
        const response = await fetch.default('https://randomuser.me/api');
        const data = await response.json();
        const newUser = {
            name: `${data.results[0].name.first} ${data.results[0].name.last}`,
        };

        // Add the new user to the roommates list
        roommates.push(newUser);

        // Write the updated roommates list back to the JSON file
        fs.writeFile('roommates.json', JSON.stringify(roommates), (err) => {
            if (err) {
                console.error('Error writing roommates file:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                console.log('User added successfully:', newUser);
                // Send a success response
                res.status(200).json({ message: 'Roommate added successfully' });
            }
        });
    } catch (error) {
        console.error('Error adding roommate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/roommates', (req, res) => {
    res.json({ roommates });
});

// GET all gastos
app.get('/gastos', (req, res) => {
    res.json({ gastos });
});

// PUT (update) a gasto
app.put('/gasto/:id', (req, res) => {
    const id = req.params.id;
    const { roommate, descripcion, monto } = req.body;
    const index = gastos.findIndex(gasto => gasto.id === id);
    if (index !== -1) {
        gastos[index] = { id, roommate, descripcion, monto };
        fs.writeFile('gastos.json', JSON.stringify(gastos), (err) => {
            if (err) {
                console.error('Error writing gastos file:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ message: 'Gasto updated successfully' });
            }
        });
    } else {
        res.status(404).json({ error: 'Gasto not found' });
    }
});

// DELETE a gasto
app.delete('/gasto/:id', (req, res) => {
    const id = req.params.id;
    gastos = gastos.filter(gasto => gasto.id !== id);
    fs.writeFile('gastos.json', JSON.stringify(gastos), (err) => {
        if (err) {
            console.error('Error writing gastos file:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({ message: 'Gasto deleted successfully' });
        }
    });
});
app.listen(3000, () => {
    console.log('Servidor inicializado en el puerto 3000');
});