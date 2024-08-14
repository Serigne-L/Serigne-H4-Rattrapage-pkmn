import React, { useState } from 'react';
import { useUser } from './UserContext';
import axios from 'axios';

const Battle = () => {
  const { user } = useUser();
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [log, setLog] = useState([]);

  useEffect(() => {
    // Récupérer l'équipe de Pokémon de l'utilisateur
    const fetchTeam = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          `http://localhost:4000/api/users/${user.id}/team`,
        );
        setPokemonTeam(response.data);
        setCurrentPokemon(response.data[0]); // Le premier Pokémon de l'équipe
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'équipe de Pokémon:",
          error,
        );
      }
    };

    fetchTeam();
  }, [user]);

  const startBattle = async () => {
    // Simuler l'obtention d'un Pokémon adverse
    const opponent = await axios.get(
      'http://localhost:4000/api/random-pokemon',
    ); // Implémente une route pour obtenir un Pokémon aléatoire
    setOpponentPokemon(opponent.data);
    setLog([`Un ${opponent.data.name} sauvage apparaît !`]);
  };

  const attack = (skill) => {
    if (!currentPokemon || !opponentPokemon) return;

    const damage = calculateDamage(currentPokemon, opponentPokemon, skill);
    setOpponentPokemon((prev) => ({
      ...prev,
      hp: Math.max(0, prev.hp - damage),
    }));
    setLog((prevLog) => [
      ...prevLog,
      `${currentPokemon.name} utilise ${skill.name} et inflige ${damage} dégâts !`,
    ]);

    if (opponentPokemon.hp - damage <= 0) {
      setLog((prevLog) => [...prevLog, `${opponentPokemon.name} est KO !`]);
      setOpponentPokemon(null); // Fin du combat
    } else {
      opponentAttack();
    }
  };

  const opponentAttack = () => {
    const skill =
      opponentPokemon.skills[
        Math.floor(Math.random() * opponentPokemon.skills.length)
      ];
    const damage = calculateDamage(opponentPokemon, currentPokemon, skill);

    setCurrentPokemon((prev) => ({
      ...prev,
      hp: Math.max(0, prev.hp - damage),
    }));

    setLog((prevLog) => [
      ...prevLog,
      `${opponentPokemon.name} utilise ${skill.name} et inflige ${damage} dégâts !`,
    ]);

    if (currentPokemon.hp - damage <= 0) {
      setLog((prevLog) => [...prevLog, `${currentPokemon.name} est KO !`]);
      // Passer au Pokémon suivant si l'utilisateur en a encore dans l'équipe
      const nextPokemon = pokemonTeam.find((p) => p.hp > 0);
      if (nextPokemon) {
        setCurrentPokemon(nextPokemon);
      } else {
        setLog((prevLog) => [
          ...prevLog,
          `Tous les Pokémon sont KO ! Vous avez perdu.`,
        ]);
        setCurrentPokemon(null);
      }
    }
  };

  const calculateDamage = (attacker, defender, skill) => {
    const attackStat = skill.isSpecial
      ? attacker.specialAttack
      : attacker.attack;
    const defenseStat = skill.isSpecial
      ? defender.specialDefense
      : defender.defense;
    const damage =
      (((2 * attacker.level) / 5 + 2) *
        skill.power *
        (attackStat / defenseStat)) /
        50 +
      2;
    return Math.floor(damage);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Combat Pokémon</h2>
      {opponentPokemon && currentPokemon ? (
        <div className="flex justify-around">
          <div className="text-center">
            <h3 className="text-xl font-bold">{currentPokemon.name}</h3>
            <img
              src={currentPokemon.frontSprite}
              alt={currentPokemon.name}
              className="h-48"
            />
            <p>HP: {currentPokemon.hp}</p>
            <div>
              {currentPokemon.skills.map((skill) => (
                <button
                  key={skill.id}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
                  onClick={() => attack(skill)}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">{opponentPokemon.name}</h3>
            <img
              src={opponentPokemon.frontSprite}
              alt={opponentPokemon.name}
              className="h-48"
            />
            <p>HP: {opponentPokemon.hp}</p>
          </div>
        </div>
      ) : (
        <button
          onClick={startBattle}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Commencer le combat
        </button>
      )}
      <div className="mt-8 bg-white p-4 rounded shadow">
        {log.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
      </div>
    </div>
  );
};

export default Battle;
