//---------------//

import { createRequire } from "module";
const require = createRequire(import.meta.url)

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const path = require('path');

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = '127.0.0.1'
const port = 3000

// Routes //

app.get('/', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/accueil.html'));
    console.log('Page d\'accueil du site sur la route : /');
})

app.get('/inscription', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/inscription.html'));
    console.log('Page d\'inscription sur la route : /inscription');
})

app.get('/connexion', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/connexion.html'));
    console.log('Page de connexion sur la route : /connexion');
})

app.post('/connexion', (req,res) => {
    const identifiant = req.body.pseudo;
    const motDePasse = req.body.motDePasse;
    if (identifiant === 'admin' && motDePasse === 'admin' ) {
        res.send('Bonjour mr.l\'admin !')
    }
    else {
        res.send('Login invalide !')
    }
})

//----------------//

console.log(`Le serveur tourne sur mon poste : http://${hostname}:${port}/`)
app.listen(3000)