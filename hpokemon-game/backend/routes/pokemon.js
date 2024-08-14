const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Récupérer tous les Pokémon
router.get('/pokemons', async (req, res) => {
    try {
        const pokemons = await prisma.pokemon.findMany({
            include: { skills: true },
        });
        res.json(pokemons);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/random-pokemon', async (req, res) => {
    try {
        // Obtenir le nombre total de Pokémon dans la base de données
        const count = await prisma.pokemon.count();

        // Générer un ID aléatoire entre 1 et le nombre total de Pokémon
        const randomId = Math.floor(Math.random() * count) + 1;

        // Récupérer le Pokémon avec cet ID, incluant ses capacités
        const randomPokemon = await prisma.pokemon.findUnique({
            where: { id: randomId },
            include: { skills: true }
        });

        // Vérifier si le Pokémon a été trouvé
        if (!randomPokemon) {
            return res.status(404).json({ error: 'Aucun Pokémon trouvé.' });
        }

        res.json(randomPokemon);
    } catch (error) {
        console.error('Erreur lors de la génération du Pokémon aléatoire:', error);
        res.status(500).json({ error: 'Quelque chose s\'est mal passé.' });
    }
});


// Route pour supprimer un Pokémon de l'équipe d'un utilisateur
router.delete('/users/:userId/team/:pokemonId', async (req, res) => {
    const { userId, pokemonId } = req.params;

    try {
        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Supprimer le Pokémon de l'équipe de l'utilisateur
        const deleteResult = await prisma.team.deleteMany({
            where: {
                userId: parseInt(userId),
                pokemonId: parseInt(pokemonId),
            },
        });

        if (deleteResult.count === 0) {
            return res.status(404).json({ error: 'Le Pokémon n\'a pas été trouvé dans l\'équipe.' });
        }

        res.status(200).json({ message: 'Pokémon supprimé de l\'équipe avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression du Pokémon de l\'équipe:', error);
        res.status(500).json({ error: 'Quelque chose s\'est mal passé.' });
    }
});

// Ajouter un Pokémon à l'équipe d'un utilisateur
router.post('/users/:id/team', async (req, res) => {
    const { id } = req.params;
    const { pokemonIds } = req.body;

    try {
        // On doit d'abord vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // On ajoute les Pokémon à l'équipe de l'utilisateur
        for (const pokemonId of pokemonIds) {
            await prisma.team.create({
                data: {
                    userId: parseInt(id),
                    pokemonId: pokemonId,
                },
            });
        }

        res.status(201).json({ message: 'Pokémon ajouté à l\'équipe avec succès' });
    } catch (error) {
        console.error('Erreur lors de l’ajout du Pokémon à l’équipe:', error);
        res.status(500).json({ error: 'Quelque chose s\'est mal passé' });
    }
});

// Récupérer l'équipe d'un utilisateur spécifique
router.get('/users/:id/team', async (req, res) => {
    const { id } = req.params;

    try {
        // Récupérer l'équipe de l'utilisateur
        const userTeam = await prisma.team.findMany({
            where: { userId: parseInt(id) },
            include: {
                pokemon: {
                    include: { skills: true }  // Inclure les compétences de chaque Pokémon
                }
            },
        });

        if (!userTeam || userTeam.length === 0) {
            return res.status(404).json({ error: 'Aucun Pokémon trouvé dans l\'équipe.' });
        }

        // Extraire les Pokémon de la réponse de la team
        const pokemons = userTeam.map((team) => team.pokemon);

        res.json(pokemons);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'équipe de Pokémon:', error);
        res.status(500).json({ error: 'Quelque chose s\'est mal passé.' });
    }
});





module.exports = router;
