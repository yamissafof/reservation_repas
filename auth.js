import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Configuration de la connexion à la base de données
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'yamissa',
    password: 'projet*enc1',
    database: 'reservation_repas'
});

// Fonction pour vérifier la complexité du mot de passe
export function isPasswordComplex(password) {
    // Vérifiez la longueur minimale du mot de passe
    if (password.length < 8) {
        return false;
    }
    // Vérifiez s'il contient au moins un chiffre
    if (!/\d/.test(password)) {
        return false;
    }
    // Vérifiez s'il contient au moins une lettre majuscule
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    // Vérifiez s'il contient au moins un caractère spécial
    if (!/[^a-zA-Z0-9]/.test(password)) {
        return false;
    }
    return true;
}

// Fonction pour enregistrer l'utilisateur dans la base de données avec mot de passe hashé
export async function saveUserToDatabase(pseudo, motdepasse, email) {
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

// Fonction pour authentifier l'utilisateur
export async function authenticateUser(pseudo, motDePasse) {
    try {
        // Récupération de l'utilisateur depuis la base de données
        const [rows] = await connection.execute('SELECT * FROM authentification WHERE login = ?', [pseudo]);

        // Vérification si l'utilisateur existe
        if (rows.length === 0) {
            return false; // Utilisateur non trouvé
        }

        const user = rows[0];

        // Vérification du mot de passe
        const passwordMatch = await bcrypt.compare(motDePasse, user.motdepasse);

        return passwordMatch;
    } catch (error) {
        console.error('Erreur lors de l\'authentification de l\'utilisateur :', error);
        throw error;
    }
}
