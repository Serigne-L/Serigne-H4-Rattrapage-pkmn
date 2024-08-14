import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

const ViewTeam = () => {
  const { user } = useUser();
  const [pokemons, setPokemons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPokemons = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          `http://localhost:4000/api/users/${user.id}/team`,
        );
        setPokemons(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des Pokémon:', error);
      }
    };

    fetchPokemons();
  }, [user]);

  const removeFromTeam = async (pokemonId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/users/${user.id}/team/${pokemonId}`,
      );
      setPokemons(pokemons.filter((pokemon) => pokemon.id !== pokemonId));
    } catch (error) {
      console.error('Erreur lors de la suppression du Pokémon:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        Mon Équipe Pokémon
      </h2>
      <button
        onClick={() => navigate('/dashboard')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Retour au tableau de bord
      </button>
      {pokemons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {pokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              removeFromTeam={removeFromTeam}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-xl text-gray-700">
          Aucun Pokémon dans votre équipe.
        </p>
      )}
    </div>
  );
};

const PokemonCard = ({ pokemon, removeFromTeam }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
      <div className="bg-gray-200 p-4">
        <img
          src={pokemon.frontSprite}
          alt={pokemon.name}
          className="w-full h-48 object-contain"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">{pokemon.name}</h3>
        <p className="text-gray-600">
          Type: <span className="capitalize">{pokemon.type}</span>
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-gray-600">
          <p>HP: {pokemon.hp}</p>
          <p>Attack: {pokemon.attack}</p>
          <p>Defense: {pokemon.defense}</p>
          <p>Speed: {pokemon.speed}</p>
          <p>Sp. Attack: {pokemon.specialAttack}</p>
          <p>Sp. Defense: {pokemon.specialDefense}</p>
        </div>
        <button
          onClick={() => removeFromTeam(pokemon.id)}
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-700"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default ViewTeam;
