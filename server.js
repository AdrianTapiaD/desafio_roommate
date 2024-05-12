const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path'); 
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
        const fetch = await import('node-fetch');
        const response = await fetch.default('https://randomuser.me/api');
        const data = await response.json();
        const newUser = {
            name: `${data.results[0].name.first} ${data.results[0].name.last}`,
        };


        roommates.push(newUser);


        fs.writeFile('roommates.json', JSON.stringify(roommates), (err) => {
            if (err) {
                console.error('Error al escribir archivo: ', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                console.log('Usuario agregado: ', newUser);
                
                res.status(200).json({ message: 'Se ha agreado a un roommate' });
            }
        });
    } catch (error) {
        console.error('Error adding roommate: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/roommates', (req, res) => {
    res.json({ roommates });
});


app.get('/gastos', (req, res) => {
    res.json({ gastos });
});


app.put('/gasto/:id', (req, res) => {
    const id = req.params.id;
    const { roommate, descripcion, monto } = req.body;
    const index = gastos.findIndex(gasto => gasto.id === id);
    if (index !== -1) {
        gastos[index] = { id, roommate, descripcion, monto };
        fs.writeFile('gastos.json', JSON.stringify(gastos), (err) => {
            if (err) {
                console.error('Error al escribir archivo (gastos):', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ message: 'Se ha actualizado el gasto' });
            }
        });
    } else {
        res.status(404).json({ error: 'No se ha encontrado el gasto' });
    }
});


app.delete('/gasto/:id', (req, res) => {
    const id = req.params.id;
    gastos = gastos.filter(gasto => gasto.id !== id);
    fs.writeFile('gastos.json', JSON.stringify(gastos), (err) => {
        if (err) {
            console.error('Error al escribir el archivo de gasto:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({ message: 'Se ha eliminado el gasto' });
        }
    });
});
app.listen(3000, () => {
    console.log('Servidor inicializado en el puerto 3000');
});