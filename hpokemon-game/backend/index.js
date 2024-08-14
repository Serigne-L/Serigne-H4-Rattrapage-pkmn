const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user');
const pokemonRoutes = require('./routes/pokemon');

const app = express();

app.use(cors());
app.use(express.json());

// Utiliser les routes
app.use('/api/users', userRoutes);
app.use('/api', pokemonRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
