const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function fetchPokemonData() {
    try {
        for (let i = 1; i <= 151; i++) { // Par exemple, les 151 premiers Pokémon
            const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`);

            const pokemon = await prisma.pokemon.create({
                data: {
                    name: data.name,
                    type: data.types[0].type.name,
                    hp: data.stats[0].base_stat,
                    attack: data.stats[1].base_stat,
                    defense: data.stats[2].base_stat,
                    speed: data.stats[5].base_stat,
                    specialAttack: data.stats[3].base_stat,
                    specialDefense: data.stats[4].base_stat,
                    frontSprite: data.sprites.front_default,
                    backSprite: data.sprites.back_default,
                },
            });

            // Limiter à 5 capacités par Pokémon
            const movesToAdd = data.moves.slice(0, 5);
            for (const move of movesToAdd) {
                const moveData = await axios.get(move.move.url);
                await prisma.pokemonSkill.create({
                    data: {
                        name: moveData.data.name,
                        power: moveData.data.power || 0,
                        accuracy: moveData.data.accuracy || 100,
                        pokemonId: pokemon.id,
                    },
                });
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

fetchPokemonData()
    .then(() => {
        console.log('Seed completed');
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
