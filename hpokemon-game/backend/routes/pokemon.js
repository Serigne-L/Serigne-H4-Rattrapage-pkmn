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

// Récupérer un Pokémon par son ID
router.get('/pokemons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pokemon = await prisma.pokemon.findUnique({
            where: { id: parseInt(id) },
            include: { skills: true },
        });
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }
        res.json(pokemon);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Créer une équipe pour un utilisateur
router.post('/users/:id/team', async (req, res) => {
    const { id } = req.params;
    const { pokemonIds } = req.body; // tableau d'IDs de Pokémon
    try {
        const team = await prisma.team.create({
            data: {
                userId: parseInt(id),
                pokemon: {
                    connect: pokemonIds.map((pokemonId) => ({ id: pokemonId })),
                },
            },
        });
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
