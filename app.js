import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import session from 'express-session';
import bcrypt from 'bcrypt';
import mysql from 'mysql2';
import { fileURLToPath } from 'url';
import { saveUserToDatabase, isPasswordComplex, authenticateUser } from './auth.js';
import { requireLogin } from './sessionMiddleware.js';

const app = express();

// Configuration de la connexion à la base de données
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'yamissa',
    password: 'projet*enc1',
    database: 'reservation_repas'
});

// Définir __dirname en utilisant import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware pour parser les données de formulaire
app.use(bodyParser.urlencoded({ extended: false }));

// Configuration de la session
app.use(session({
    secret: 'votre_secret', // Une chaîne aléatoire pour signer les cookies de session
    resave: false,
    saveUninitialized: true
}));

// Route pour la page d'accueil
app.get('/', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/accueil.html'));
    console.log('Page d\'accueil sur la route : /');
});

// Route pour la page de connexion
app.get('/connexion', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/connexion.html'));
    console.log('Page de connexion sur la route : /connexion');
});

// Route pour traiter la soumission du formulaire de connexion
app.post('/connexion', async (req, res) => {
    // Authentification de l'utilisateur
    const userId = await authenticateUser(req.body.pseudo, req.body.motDePasse);

    if (userId) {
        // Stocker l'ID de l'utilisateur dans la session
        req.session.userId = userId; // Définir l'ID de l'utilisateur dans la session
        res.redirect('/accueil-session');
    } else {
        res.status(401).send('Identifiants invalides.');
    }
});

// Route pour la page d'inscription
app.get('/inscription', (requete, resultat) => {
    resultat.sendFile(path.join(__dirname+'/html/inscription.html'));
    console.log('Page d\'inscription sur la route : /inscription');
});

// Route pour traiter la soumission du formulaire d'inscription
app.post('/inscription', async (req, res) => {
    const { pseudo, motDePasse, confmotDePasse, email } = req.body;

    // Vérifiez si les champs sont vides
    if (!pseudo || !motDePasse || !confmotDePasse || !email) {
        return res.status(400).send('Tous les champs sont obligatoires.');
    }

    // Vérifiez si les mots de passe correspondent
    if (motDePasse !== confmotDePasse) {
        return res.status(400).send('Les mots de passe ne correspondent pas.');
    }

    // Vérifiez la complexité du mot de passe
    if (!isPasswordComplex(motDePasse)) {
        return res.status(400).send('Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, un chiffre et un caractère spécial.');
    }

    try {
        // Hashage du mot de passe
        const hashedPassword = await bcrypt.hash(motDePasse, 10);

        // Enregistrement de l'utilisateur dans la base de données avec le mot de passe hashé
        const saved = await saveUserToDatabase(pseudo, hashedPassword, email);

        if (saved) {
            // Redirection vers la page de connexion après création du compte
            res.redirect('/connexion');
            console.log('Compte créé avec succès !');
        } else {
            res.status(500).send('Erreur lors de la création du compte.');
        }
    } catch (error) {
        console.error('Erreur lors de la création du compte :', error);
        res.status(500).send('Erreur lors de la création du compte.');
    }
});

// Configuration de la session
app.use(session({
    secret: 'votresecret',
    resave: false,
    saveUninitialized: false
}));

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la session personnelle
app.get('/accueil-session', requireLogin, (req, res) => {
    // L'utilisateur est connecté, récupérez les informations de session et renvoyez la page
    res.sendFile(path.join(__dirname, '/html/accueil-session.html'));
    console.log('Page d\'accueil de la session sur la route : /accueil-session');
});

// Route pour la reservation d'un menu
app.get('/reservation', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '/html/reservation.html'));
});

// Démarrage du serveur
const port = 3000;
const hostname = '127.0.0.1';

console.log(`Le serveur tourne sur mon poste : http://${hostname}:${port}/`);
app.listen(port);
