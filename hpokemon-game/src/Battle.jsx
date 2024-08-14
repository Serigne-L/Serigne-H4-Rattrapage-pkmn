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
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const [opponentPokemon, setOpponentPokemon] = useState(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1200,
      height: 1200,
      parent: phaserContainer.current,
      scene: new BattleScene(user, setPokemonTeam, setOpponentPokemon),
      backgroundColor: '#6666EB',
    };

    phaserGame.current = new Phaser.Game(config);

    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
      }
    };
  }, [user]);

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

class BattleScene extends Phaser.Scene {
  constructor(user, setPokemonTeam, setOpponentPokemon) {
    super({ key: 'BattleScene' });
    this.user = user;
    this.setPokemonTeam = setPokemonTeam;
    this.setOpponentPokemon = setOpponentPokemon;
    this.currentPlayerPokemonIndex = 0;
    this.pokemonTeam = [];
    this.opponentPokemon = null;
    this.playerPokemon = null;
    this.playerSprite = null;
    this.opponentSprite = null;
    this.isSceneActive = true;
  }

  preload() {
    // Preload any common assets here, if needed.
  }

  async create() {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/users/${this.user.id}/team`,
      );
      const team = response.data;
      this.setPokemonTeam(team);
      this.pokemonTeam = team;

      if (team.length === 0) {
        console.error("L'équipe du joueur est vide");
        return;
      }

      this.playerPokemon = team[this.currentPlayerPokemonIndex];
      await this.loadPokemon(this.playerPokemon, 'playerPokemonSprite');

      const opponent = await this.loadNewOpponent();
      if (opponent) {
        this.opponentPokemon = opponent;
        this.setOpponentPokemon(opponent);
      } else {
        console.error('Impossible de charger le Pokémon adverse');
      }
    } catch (error) {
      console.error('Erreur lors de la phase de création:', error);
    }
  }

  async loadNewOpponent() {
    try {
      const opponent = await axios.get(
        'http://localhost:4000/api/random-pokemon',
      );
      const opponentPokemon = opponent.data;

      if (!opponentPokemon || !opponentPokemon.frontSprite) {
        console.error('Données du Pokémon adverse non valides');
        return null;
      }

      await this.loadPokemon(opponentPokemon, 'opponentPokemonSprite');
      return opponentPokemon;
    } catch (error) {
      console.error('Erreur lors du chargement du Pokémon adverse', error);
      return null;
    }
  }

  async loadPokemon(pokemon, spriteKey) {
    return new Promise((resolve, reject) => {
      if (!this.sys.isActive()) {
        this.isSceneActive = false;
        return reject('Scène inactive lors du chargement du Pokémon');
      }

      if (this.textures.exists(spriteKey)) {
        this.textures.remove(spriteKey);
      }

      this.load.image(spriteKey, pokemon.frontSprite);
      this.load.once('complete', () => {
        if (this.sys.isActive()) {
          this.addPokemonSprite(spriteKey, pokemon);
          resolve();
        } else {
          reject(
            'Scène inactive lors de la tentative de chargement du Pokémon',
          );
        }
      });
      this.load.start();
    });
  }

  addPokemonSprite(spriteKey, pokemon) {
    if (!this.isSceneActive) return;

    if (spriteKey === 'playerPokemonSprite') {
      this.playerSprite?.destroy();
      this.playerSprite = this.add.sprite(150, 300, spriteKey);
      this.playerHpText?.destroy();
      this.playerHpText = this.add.text(150, 260, `HP: ${pokemon.hp}`, {
        font: '16px Arial',
        fill: '#ffffff',
      });
      this.addSkillActions(pokemon);
    } else if (spriteKey === 'opponentPokemonSprite') {
      this.opponentSprite?.destroy();
      this.opponentSprite = this.add.sprite(650, 300, spriteKey);
      this.opponentHpText?.destroy();
      this.opponentHpText = this.add.text(650, 260, `HP: ${pokemon.hp}`, {
        font: '16px Arial',
        fill: '#ffffff',
      });
    }
  }

  addSkillActions(playerPokemon) {
    playerPokemon.skills.forEach((skill, index) => {
      this.skillTexts?.[index]?.destroy();
      this.skillTexts = this.skillTexts || [];
      this.skillTexts[index] = this.add
        .text(20, 50 + index * 50, skill.name, {
          font: '16px Arial',
          fill: '#ffffff',
        })
        .setInteractive()
        .on('pointerdown', () => this.attack(skill));
    });

    this.log?.destroy();
    this.log = this.add.text(20, 400, '', {
      font: '16px Arial',
      fill: '#ffffff',
    });
  }

  async attack(skill) {
    if (!this.opponentPokemon || !this.opponentPokemon.hp) {
      console.error('Données du Pokémon adverse manquantes ou invalides');
      return;
    }

    const damage = this.calculateDamage(
      this.playerPokemon,
      this.opponentPokemon,
      skill.power || 50,
    );
    this.opponentPokemon.hp -= damage;
    if (this.opponentHpText && this.opponentHpText.active) {
      this.opponentHpText.setText(`HP: ${this.opponentPokemon.hp}`);
    }
    if (this.log && this.log.active) {
      this.log.setText(
        `${this.playerPokemon.name} utilise ${skill.name} et inflige ${damage} dégâts !`,
      );
    }

    if (this.opponentPokemon.hp <= 0) {
      if (this.log && this.log.active) {
        this.log.setText(`${this.opponentPokemon.name} est KO !`);
      }
      if (this.opponentSprite && this.opponentSprite.active) {
        this.opponentSprite.setVisible(false);
      }
      const newOpponent = await this.loadNewOpponent();
      if (newOpponent) this.opponentPokemon = newOpponent;
    } else {
      this.opponentAttack();
    }
  }

  opponentAttack() {
    if (
      !this.opponentPokemon ||
      !this.opponentPokemon.skills ||
      this.opponentPokemon.skills.length === 0
    ) {
      console.error('Le Pokémon adverse ou ses compétences sont manquants');
      return;
    }

    const skill =
      this.opponentPokemon.skills[
        Math.floor(Math.random() * this.opponentPokemon.skills.length)
      ];
    const damage = this.calculateDamage(
      this.opponentPokemon,
      this.playerPokemon,
      skill.power || 50,
    );
    this.playerPokemon.hp -= damage;
    if (this.playerHpText && this.playerHpText.active) {
      this.playerHpText.setText(`HP: ${this.playerPokemon.hp}`);
    }
    if (this.log && this.log.active) {
      this.log.setText(
        `${this.opponentPokemon.name} utilise ${skill.name} et inflige ${damage} dégâts !`,
      );
    }

    if (this.playerPokemon.hp <= 0) {
      if (this.log && this.log.active) {
        this.log.setText(`${this.playerPokemon.name} est KO !`);
      }

      this.currentPlayerPokemonIndex += 1;
      if (this.currentPlayerPokemonIndex < this.pokemonTeam.length) {
        this.playerPokemon = this.pokemonTeam[this.currentPlayerPokemonIndex];
        this.loadPokemon(this.playerPokemon, 'playerPokemonSprite');
      } else {
        if (this.log && this.log.active) {
          this.log.setText('Tous vos Pokémon sont KO ! Vous avez perdu.');
        }
        if (this.playerSprite && this.playerSprite.active) {
          this.playerSprite.setVisible(false);
        }
      }
    }
  }

  calculateDamage(attacker, defender, skillPower) {
    if (!attacker || !defender) {
      console.error(
        'Les données de l’attaquant ou du défenseur sont manquantes',
        {
          attacker,
          defender,
        },
      );
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
      console.error('Statistiques invalides pour le calcul des dégâts', {
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
  }
}

export default Battle;
