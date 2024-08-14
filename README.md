Jeu de Combat Pokémon Rattrapge
Vue d'ensemble
Ce projet est un jeu de combat Pokémon développé avec React, Node.js, Express, Prisma et Phaser.js. Les utilisateurs peuvent se connecter, gérer leur équipe de Pokémon, et participer à des combats contre des adversaires générés aléatoirement.

Fonctionnalités
Authentification des utilisateurs : Les utilisateurs peuvent s'inscrire et se connecter.
Gestion d'équipe : Les utilisateurs peuvent voir et gérer leur équipe de Pokémon.
Système de combat : Participez à des combats contre des Pokémon adversaires générés aléatoirement.
Intégration de Phaser.js : Le jeu utilise Phaser.js pour les animations et les interactions de combat.
Design responsive : L'application est conçue pour être responsive et fonctionne sur diverses tailles d'écran.
Technologies utilisées
Frontend :

React.js
Tailwind CSS
Phaser.js (Exercice 2 )
Axios
Backend :

Node.js
Express.js
Prisma (ORM)
SQLite (Base de données)
Prise en main
Prérequis
Assurez-vous d'avoir les éléments suivants installés sur votre système :

Node.js (v14 ou supérieur)
npm (v6 ou supérieur)

Installation

Clonez le dépôt :

```
git clone https://github.com/Serigne-L/Serigne-H4-Rattrapage-pkmn
```

```
cd hokemon-game
```

Installez les dépendances pour le backend et le frontend :

# Installez les dépendances du frontend

npm install

Configurez la base de données :

Prisma est utilisé comme ORM. Le projet utilise SQLite comme base de données, donc aucune configuration supplémentaire n'est requise. Exécutez simplement la migration Prisma pour configurer le schéma de la base de données :

```
cd backend
```

```
npx prisma migrate dev --name init
```

```
npx prisma generate
```

Cette commande créera la base de données et appliquera les migrations.

```
node seed.js
```

Cette commande genere les donné dans la base de donné

Lancez les serveurs de développement :

Backend :

```
cd backend
```

```
node index.js
```

Le serveur backend démarrera sur http://localhost:4000.

Frontend :

```
npm start
```

L'application React frontend démarrera sur http://localhost:3000.

Utilisation
Inscription et Connexion :

Accédez à l'application sur http://localhost:3000.

Inscrivez-vous ou connectez-vous avec un compte existant.

Gestion de l'équipe :

Après vous être connecté, vous pouvez voir et gérer votre équipe de Pokémon.
Combat :

Commencez un combat contre un adversaire généré aléatoirement.

Utilisez les compétences de votre Pokémon pour attaquer et vaincre l'adversaire.

Si votre Pokémon est vaincu, le prochain Pokémon de votre équipe rejoint le combat.

API Endpoints
Le backend fournit plusieurs endpoints API :

Authentification des utilisateurs :

POST /api/users/register : Inscrire un nouvel utilisateur.

POST /api/users/login : Connecter un utilisateur.

Gestion d'équipe :

GET /api/users/:id/team : Obtenir l'équipe de Pokémon de l'utilisateur.

POST /api/users/:id/team : Ajouter un Pokémon à l'équipe de l'utilisateur.

DELETE /api/users/:id/team/:pokemonId : Supprimer un Pokémon de l'équipe de l'utilisateur.
Pokémon :

GET /api/pokemons : Obtenir la liste de tous les Pokémon disponibles.

GET /api/random-pokemon : Obtenir un Pokémon adversaire généré aléatoirement.
