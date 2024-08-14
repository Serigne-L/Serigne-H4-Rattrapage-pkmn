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



module.exports = router;
