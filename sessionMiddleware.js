const requireLogin = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/connexion');
        }
        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de la connexion :', error);
        res.status(500).send('Erreur lors de la vérification de la connexion.');
    }
};

export { requireLogin };
