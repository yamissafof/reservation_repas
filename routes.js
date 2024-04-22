import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

// Définir __dirname en utilisant import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la connexion à la base de données
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'yamissa',
    password: 'projet*enc1',
    database: 'reservation_repas'
});

// Middleware pour parser les données de formulaire
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware pour la gestion de session
app.use(session({
    secret: 'votre_secret',
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
    const { pseudo, motDePasse } = req.body;

    // Vérifiez si les champs sont vides
    if (!pseudo || !motDePasse) {
        return res.status(400).send('Tous les champs sont obligatoires.');
    }

    try {
        // Récupération de l'utilisateur depuis la base de données
        const [rows] = await connection.execute('SELECT * FROM authentification WHERE login = ?', [pseudo]);

        // Vérification si l'utilisateur existe
        if (rows.length === 0) {
            return res.status(404).send('Utilisateur non trouvé.');
        }

        const user = rows[0];

        // Vérification du mot de passe
        const passwordMatch = await bcrypt.compare(motDePasse, user.motdepasse);

        if (passwordMatch) {
            // Stockage de l'ID de l'utilisateur dans la session
            req.session.userId = user.id;

            // Redirection vers la session personnelle de l'utilisateur
            res.redirect(`/session/${user.id}`);
        } else {
            res.status(401).send('Mot de passe incorrect.');
        }
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).send('Erreur lors de la connexion.');
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

// Route pour la session personnelle de l'utilisateur
app.get('/session/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Récupération des données de l'utilisateur depuis la base de données
        const [rows] = await connection.execute('SELECT * FROM authentification WHERE id = ?', [userId]);

        // Vérification si l'utilisateur existe
        if (rows.length === 0) {
            return res.status(404).send('Utilisateur non trouvé.');
        }

        const user = rows[0];

        // Affichage des données de l'utilisateur
        res.send(`Bienvenue sur votre session personnelle, ${user.login} !`);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur :', error);
        res.status(500).send('Erreur lors de la récupération des données de l\'utilisateur.');
    }
});

// Fonction pour enregistrer l'utilisateur dans la base de données avec mot de passe hashé
async function saveUserToDatabase(pseudo, motdepasse, email) {
    try {
        // Insertion de l'utilisateur dans la base de données
        const [result] = await connection.execute('INSERT INTO authentification (login, motdepasse, email, date) VALUES (?, ?, ?, NOW())', [pseudo, motdepasse, email]);

        // Vérification si l'insertion a réussi
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur dans la base de données :', error);
        return false;
    }
}

// Démarrage du serveur
const port = 3000;
const hostname = '127.0.0.1';

console.log(`Le serveur tourne sur mon poste : http://${hostname}:${port}/`);
app.listen(port);
