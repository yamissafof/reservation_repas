//---------------//

const express = require('express')
const app = express()
const path = require('path');

const hostname = '127.0.0.1'
const port = 3000

// Routes //

app.get('/', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/accueil.html'));
    console.log("Page d'accueil du site sur la route : /")
})

app.get('/inscription', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/inscription.html'));
})

app.get('/connexion', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/connexion.html'));
})

//----------------//

console.log(`Le serveur tourne sur mon poste : http://${hostname}:${port}/`)
app.listen(3000)