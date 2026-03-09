# 🚂 Tutoriel — Déployer Sayuri Loveroom sur Railway

Ce guide explique comment déployer le bot de bout en bout sur Railway avec MongoDB.

---

## Étape 1 — Prérequis

- Compte [Railway](https://railway.app)
- Compte [GitHub](https://github.com)
- Un bot Discord (créé sur [Discord Developer Portal](https://discord.com/developers/applications))
- Node.js installé en local (pour les tests)

---

## Étape 2 — Créer MongoDB sur Railway

1. Va sur [railway.app](https://railway.app) et connecte-toi.
2. Clique sur **New Project**.
3. Choisis **Provision MongoDB** (dans "Deploy from Template" ou dans l’onglet).
4. Une fois MongoDB créé, clique dessus.
5. Onglet **Variables** : note le nom `MONGO_URL` (Railway injecte souvent cette variable quand tu connectes MongoDB au service).
   - Le bot accepte `MONGODB_URI` ou `MONGO_URL`.
   - Si tu connectes MongoDB au service bot (icône "Connect" sur MongoDB), Railway injecte `MONGO_URL` automatiquement.

---

## Étape 3 — Préparer le projet

1. Ouvre le dossier du projet dans ton éditeur.
2. Crée un fichier **`.gitignore`** (déjà présent) avec :
   ```
   node_modules/
   .env
   config.json
   data/
   *.log
   ```
3. Vérifie que ton code est prêt à être poussé sur GitHub.

---

## Étape 4 — Pousser sur GitHub

1. Crée un nouveau dépôt sur [GitHub](https://github.com/new).
2. Dans le terminal, à la racine du projet :

```bash
git init
git add .
git commit -m "Initial commit - Sayuri Loveroom"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/TON_REPO.git
git push -u origin main
```

---

## Étape 5 — Déployer le bot sur Railway

1. Sur Railway, dans le même projet ou un nouveau : **New** → **GitHub Repo**.
2. Connecte ton compte GitHub et sélectionne le dépôt du bot.
3. Railway détecte automatiquement Node.js via `package.json` et configure le build.
4. Le déploiement démarre automatiquement.

---

## Étape 6 — Configurer les variables d'environnement

1. Clique sur le **service du bot** (pas MongoDB).
2. Onglet **Variables**.
3. Clique sur **+ New Variable** et ajoute :

| Variable | Valeur | Obligatoire |
|----------|--------|-------------|
| `DISCORD_TOKEN` | Token du bot Discord | ✅ |
| `MONGODB_URI` | URI MongoDB (ou connecte le service MongoDB au bot pour que `MONGO_URL` soit injecté) | ✅ |
| `GUILD_ID` | ID du serveur Discord | ✅ |
| `COMMAND_CHANNEL_ID` | ID du salon où les commandes fonctionnent | ✅ |
| `LOUNGE_CATEGORY_ID` | ID de la catégorie pour les salons couples | ✅ |
| `RANK_ROLES` | JSON des rôles par rang, ex: `{"1":"id1","2":"id2","3":"id3"}` | Optionnel |

### Obtenir les IDs Discord

- Active le mode développeur : Paramètres → Avancés → Mode développeur (ON).
- Clic droit sur le serveur/salon/catégorie → "Copier l'identifiant".

### Exemple de `RANK_ROLES`

```json
{"1":"1234567890123456789","2":"1234567890123456790","3":"1234567890123456791"}
```

4. À chaque changement de variable, Railway redéploie le service.

---

## Étape 7 — Vérifier le déploiement

1. Onglet **Deployments** : vérifie que le dernier déploiement est en vert.
2. Onglet **Logs** : tu devrais voir quelque chose comme :
   ```
   💘 Sayuri Loveroom connecté en tant que Bot#1234
   ```
3. Sur Discord, le bot doit apparaître en ligne.

---

## Étape 8 — Permissions du bot Discord

Dans le portail développeur Discord :

1. **Bot** → Active :
   - PRESENCE INTENT
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT
2. **OAuth2** → **URL Generator** :
   - Scopes : `bot`
   - Permissions : Gérer les salons, Gérer les rôles, Envoyer des messages, Lire l’historique des messages, Utiliser des commandes slash (si tu en ajoutes plus tard)

---

## Résumé du flux

```
GitHub (code)  ──push──►  Railway (bot)
                              │
MongoDB (Railway)  ◄──MONGODB_URI──  Bot
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Bot ne se connecte pas | Vérifie `DISCORD_TOKEN` et les intents du bot |
| Erreur MongoDB | Vérifie `MONGODB_URI`, inclut le mot de passe, pas d’espace |
| Commandes ne marchent pas | Vérifie que tu es dans le salon défini par `COMMAND_CHANNEL_ID` |
| Salons non créés | Vérifie `LOUNGE_CATEGORY_ID` et que le bot a la perm "Gérer les salons" |
| Logs vides ou erreurs | Consulte les logs Railway pour le message exact d’erreur |

---

## Mises à jour

Pour mettre à jour le bot :

```bash
git add .
git commit -m "Description des changements"
git push
```

Railway redéploiera automatiquement avec le nouveau code.
