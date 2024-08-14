const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const router = express.Router();
const saltRounds = 10;  // Niveau de complexité du hachage

// Inscription d'un utilisateur
router.post('/register', async (req, res) => {
    const { email, password, username } = req.body;
    try {
        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,  // Stocker le mot de passe haché
                username,
            },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});
// Connexion d'un utilisateur
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Comparer le mot de passe avec le haché
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
