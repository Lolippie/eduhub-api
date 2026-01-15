# Projet

Ce projet est une application backend NestJS destinée à la gestion complète d’une plateforme éducative.
Elle permet la création et la gestion de cours, l’inscription des étudiants, l’ajout de ressources pédagogiques, ainsi que la création et la correction de quiz.

Le système prend en charge différents rôles : Administrateur, Enseignant et Étudiant, et sécurise les routes avec JWT et contrôle d’accès basé sur les rôles.

## Fonctionnalités principales

- Gestion des utilisateurs

  -  Création d’utilisateurs (admin, enseignants, étudiants)

  - Connexion et authentification via JWT

  - Récupération du profil utilisateur

- Gestion des cours

  - Création, mise à jour et suppression de cours

  - Inscription et désinscription des étudiants

  - Consultation des cours selon le rôle

  - Ajout et consultation de ressources pédagogiques

- Gestion des quiz

  - Génération automatique de quiz à partir du contenu des cours

  - Soumission et correction automatique des réponses

  - Récupération des quiz avec feedback et score

- Ressources pédagogiques

  - Upload de fichiers associés aux cours

  - Téléchargement des ressources selon le rôle de l’utilisateur   


# Installation

1. Cloner le projet 
```
 git clone https://github.com/Lolippie/eduhub-api.git
 cd eduhub-api
```
2. Installer les dépendances 
```
npm install
```
3. Installer prisma
```
npx prisma generate
```
4. Créer et migrer la base de données
```
npx prisma migrate dev --name init
```

## Configuration
1. Copier le fichier .env.exempl en .env
```
cp .env.example .env
```
2. Modifier les variables d'environnement :
```
DATABASE_URL="postgresql://eduhub:eduhub_password@localhost:55432/eduhub?schema=public"
MISTRAL_API_KEY = "VotreClefMistrai"
JWT_SECRET="votreSecretJWT"
```

## Démarrage
Lancer le serveur en mode développement :
```
npm run start:dev
```

## API 
Une configuration utilisant Bruno est présente dans le fichier  
Sinon swagger est accessible à l'addresse 
```
http://localhost:3000/api
```

