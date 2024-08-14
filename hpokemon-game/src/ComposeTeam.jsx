import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const ComposeTeam = () => {
  const [allPokemons, setAllPokemons] = useState([]);
  const [userTeam, setUserTeam] = useState([]);
  const [addedPokemons, setAddedPokemons] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/pokemons');
        setAllPokemons(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des Pokémon:', error);
      }
    };

    fetchPokemons();
  }, []);

  const addToTeam = async (pokemonId) => {
    if (!user) {
      console.log('Utilisateur non connecté.');
      return; // Vérifie que l'utilisateur est bien connecté
    }

    if (userTeam.length >= 6) {
      alert('Vous ne pouvez avoir que 6 Pokémon dans votre équipe.');
      return;
    }

    try {
      console.log(`Ajout du Pokémon avec ID ${pokemonId} à l'équipe.`);
      const response = await axios.post(
        `http://localhost:4000/api/users/${user.id}/team`,
        { pokemonIds: [pokemonId] },
      );
      setUserTeam([...userTeam, response.data]);
      setAddedPokemons([...addedPokemons, pokemonId]);
    } catch (error) {
      console.error('Erreur lors de l’ajout du Pokémon à l’équipe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Composer mon équipe Pokémon</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Retour
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {allPokemons.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            addToTeam={addToTeam}
            isAdded={addedPokemons.includes(pokemon.id)}
          />
        ))}
      </div>
    </div>
  );
};

const PokemonCard = ({ pokemon, addToTeam, isAdded }) => {
  return (
    <div
      className={`relative rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 ${
        isAdded
          ? 'bg-green-500 text-white'
          : 'bg-white border-4 border-gray-800 hover:scale-105'
      }`}
      onClick={() => !isAdded && addToTeam(pokemon.id)} // Empêcher de cliquer si déjà ajouté
    >
      <div className="bg-gray-200 p-2 text-center">
        <img
          src={pokemon.frontSprite}
          alt={pokemon.name}
          className="w-full h-48 object-contain"
        />
      </div>
      <div className="p-4">
        {isAdded ? (
          <h3 className="text-xl font-bold">
            {' '}
            {pokemon.name} est désormais dans votre équipe
          </h3>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-800">{pokemon.name}</h3>
            <p className="text-gray-600">
              Type: <span className="capitalize">{pokemon.type}</span>
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <p className="text-gray-600">HP: {pokemon.hp}</p>
              <p className="text-gray-600">Attack: {pokemon.attack}</p>
              <p className="text-gray-600">Defense: {pokemon.defense}</p>
              <p className="text-gray-600">Speed: {pokemon.speed}</p>
              <p className="text-gray-600">
                Sp. Attack: {pokemon.specialAttack}
              </p>
              <p className="text-gray-600">
                Sp. Defense: {pokemon.specialDefense}
              </p>
            </div>
          </>
        )}
      </div>
      {!isAdded && (
        <>
          <div className="absolute top-0 left-0 bg-yellow-500 text-white px-2 py-1 text-xs font-bold">
            N°{pokemon.id}
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs font-bold">
            {pokemon.level ? `Lv ${pokemon.level}` : ''}
          </div>
        </>
      )}
    </div>
  );
};

export default ComposeTeam;
