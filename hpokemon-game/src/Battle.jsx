import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Battle = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const phaserGame = useRef(null);
  const phaserContainer = useRef(null);
  const [currentPlayerPokemonIndex, setCurrentPlayerPokemonIndex] = useState(0);
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const [opponentPokemon, setOpponentPokemon] = useState(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1200,
      height: 1200,
      parent: phaserContainer.current,
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      backgroundColor: '#6666EB',
    };

    phaserGame.current = new Phaser.Game(config);

    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
      }
    };
  }, []);

  const preload = function () {};

  const create = async function () {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/users/${user.id}/team`,
      );
      const team = response.data;
      setPokemonTeam(team);

      const opponent = await loadNewOpponent(this);
      if (opponent) {
        setOpponentPokemon(opponent);
        loadPlayerPokemon(this, team[0]);
      } else {
        console.error("Couldn't load opponent Pokémon");
      }
    } catch (error) {
      console.error('Error during create phase:', error);
    }
  };

  const update = function () {};

  const loadNewOpponent = async (scene) => {
    try {
      const opponent = await axios.get(
        'http://localhost:4000/api/random-pokemon',
      );
      const opponentPokemon = opponent.data;

      if (!opponentPokemon || !opponentPokemon.frontSprite) {
        console.error('Failed to load opponent Pokémon data');
        return null;
      }

      const opponentImage = await loadImage(opponentPokemon.frontSprite);
      if (opponentImage) {
        if (scene.opponentPokemon) {
          scene.opponentPokemon.destroy();
        }
        if (scene.opponentHpText) {
          scene.opponentHpText.destroy();
        }

        // Remove existing texture if it exists
        if (scene.textures.exists('opponentPokemonSprite')) {
          scene.textures.remove('opponentPokemonSprite');
        }

        // Check if the scene is still valid before adding the new texture
        if (scene.textures) {
          scene.textures.addImage('opponentPokemonSprite', opponentImage);
          scene.opponentPokemon = scene.add.sprite(
            650,
            300,
            'opponentPokemonSprite',
          );

          scene.opponentHpText = scene.add.text(
            650,
            260,
            `HP: ${opponentPokemon.hp}`,
            {
              font: '16px Arial',
              fill: '#ffffff',
            },
          );
        }

        return opponentPokemon;
      } else {
        console.error('Failed to load opponent sprite image');
        return null;
      }
    } catch (error) {
      console.error('Error loading opponent Pokémon', error);
      return null;
    }
  };

  const loadPlayerPokemon = async (scene, playerPokemon) => {
    try {
      const playerImage = await loadImage(playerPokemon.frontSprite);
      if (playerImage) {
        if (scene.playerPokemon) {
          scene.playerPokemon.destroy();
        }
        if (scene.playerHpText) {
          scene.playerHpText.destroy();
        }

        // Remove existing texture if it exists
        if (scene.textures.exists('playerPokemonSprite')) {
          scene.textures.remove('playerPokemonSprite');
        }

        // Check if the scene is still valid before adding the new texture
        if (scene.textures) {
          scene.textures.addImage('playerPokemonSprite', playerImage);
          scene.playerPokemon = scene.add.sprite(
            150,
            300,
            'playerPokemonSprite',
          );

          scene.playerHpText = scene.add.text(
            150,
            260,
            `HP: ${playerPokemon.hp}`,
            {
              font: '16px Arial',
              fill: '#ffffff',
            },
          );

          playerPokemon.skills.forEach((skill, index) => {
            if (scene.skillTexts && scene.skillTexts[index]) {
              scene.skillTexts[index].destroy();
            }

            scene.skillTexts = scene.skillTexts || [];
            scene.skillTexts[index] = scene.add
              .text(20, 50 + index * 50, skill.name, {
                font: '16px Arial',
                fill: '#ffffff',
              })
              .setInteractive()
              .on('pointerdown', () =>
                attack(skill, opponentPokemon, playerPokemon, scene),
              );
          });

          if (scene.log) {
            scene.log.destroy();
          }

          scene.log = scene.add.text(20, 400, '', {
            font: '16px Arial',
            fill: '#ffffff',
          });
        }
      } else {
        console.error('Failed to load player sprite image');
      }
    } catch (error) {
      console.error('Error loading player Pokémon', error);
    }
  };

  const attack = async (skill, opponentPokemon, playerPokemon, scene) => {
    if (!opponentPokemon || !opponentPokemon.hp) {
      console.error('Opponent Pokémon data is missing or invalid');
      return;
    }

    const skillPower = skill.power || 50;
    const damage = calculateDamage(playerPokemon, opponentPokemon, skillPower);
    opponentPokemon.hp -= damage;
    scene.opponentHpText.setText(`HP: ${opponentPokemon.hp}`);
    scene.log.setText(
      `${playerPokemon.name} utilise ${skill.name} et inflige ${damage} dégâts !`,
    );

    if (opponentPokemon.hp <= 0) {
      scene.log.setText(`${opponentPokemon.name} est KO !`);
      scene.opponentPokemon.setVisible(false);
      const newOpponent = await loadNewOpponent(scene);
      if (newOpponent) setOpponentPokemon(newOpponent);
    } else {
      opponentAttack(scene);
    }
  };

  const opponentAttack = (scene) => {
    if (!opponentPokemon || !opponentPokemon.skills) {
      console.error('Opponent Pokémon or skills are missing');
      return;
    }

    const skill =
      opponentPokemon.skills[
        Math.floor(Math.random() * opponentPokemon.skills.length)
      ];
    const skillPower = skill.power || 50;
    const damage = calculateDamage(
      opponentPokemon,
      pokemonTeam[currentPlayerPokemonIndex],
      skillPower,
    );
    pokemonTeam[currentPlayerPokemonIndex].hp -= damage;
    scene.playerHpText.setText(
      `HP: ${pokemonTeam[currentPlayerPokemonIndex].hp}`,
    );
    scene.log.setText(
      `${opponentPokemon.name} utilise ${skill.name} et inflige ${damage} dégâts !`,
    );

    if (pokemonTeam[currentPlayerPokemonIndex].hp <= 0) {
      scene.log.setText(
        `${pokemonTeam[currentPlayerPokemonIndex].name} est KO !`,
      );

      const nextIndex = currentPlayerPokemonIndex + 1;
      if (nextIndex < pokemonTeam.length) {
        setCurrentPlayerPokemonIndex(nextIndex);
        loadPlayerPokemon(scene, pokemonTeam[nextIndex]);
      } else {
        scene.log.setText('Tous vos Pokémon sont KO ! Vous avez perdu.');
        scene.playerPokemon.setVisible(false);
      }
    }
  };

  const calculateDamage = (attacker, defender, skillPower) => {
    if (!attacker || !defender) {
      console.error('Attacker or defender data is missing', {
        attacker,
        defender,
      });
      return 0;
    }

    const attackStat = skillPower.isSpecial
      ? attacker.specialAttack
      : attacker.attack;
    const defenseStat = skillPower.isSpecial
      ? defender.specialDefense
      : defender.defense;

    if (
      attackStat === null ||
      attackStat === undefined ||
      defenseStat === null ||
      defenseStat === undefined
    ) {
      console.error('Invalid stats for damage calculation', {
        attackStat,
        defenseStat,
        skillPower,
      });
      return 0;
    }

    const damage =
      (((2 * (attacker.level || 50)) / 5 + 2) *
        skillPower *
        (attackStat / defenseStat)) /
        50 +
      2;

    return Math.floor(damage);
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (err) => {
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '10px',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Retour
      </button>
      <div
        ref={phaserContainer}
        style={{ width: '1200px', height: '1200px', margin: 'auto' }}
      />
    </div>
  );
};

export default Battle;
