import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-800 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue dans le Monde de Pokémon
        </h1>
        <p className="text-gray-600 mb-8">
          Explore, capture et entraîne tes Pokémon pour devenir le meilleur
          dresseur !
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Inscris-toi
          </Link>
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connecte-toi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
