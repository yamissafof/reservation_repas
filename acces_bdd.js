const express = require('express');
const mysql = require('mysql');

const app = express();

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded())

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'yamissa',
    password: 'projet*enc1',
    database: 'reservation_repas'
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connexion à la base de données réussie');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur Express démarré avec succès sur le port ${PORT}`);
});

