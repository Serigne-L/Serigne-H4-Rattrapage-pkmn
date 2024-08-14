import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-800 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-8">
        Bienvenue, Dresseur Pokémon!
      </h1>
      <div className="space-y-4">
        <Link
          to="/battle"
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded block text-center"
        >
          Faire un combat
        </Link>
        <Link
          to="/compose-team"
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded block text-center"
        >
          Composer mon équipe
        </Link>
        <Link
          to="/view-team"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block text-center"
        >
          Voir mon équipe
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
