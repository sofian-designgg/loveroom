# 💘 Sayuri Loveroom — Bot Discord

Bot Discord pour le serveur Sayuri Loveroom avec système de liaisons amoureuses, classement hebdomadaire et rôles selon le rang.

## Installation

1. **Cloner / Télécharger** le projet
2. **Installer les dépendances :**
   ```bash
   npm install
   ```
3. **Configurer :**
   - Copier `.env.example` vers `.env` et mettre ton token Discord
   - Copier `config.example.json` vers `config.json` et remplir les IDs

## Configuration (config.json)

| Clé | Description |
|-----|-------------|
| `guildId` | ID du serveur Discord |
| `commandChannelId` | ID du salon où les commandes sont autorisées |
| `loungeCategoryId` | ID de la catégorie où seront créés les salons couples |
| `rankRoles` | Rôles par rang : `{"1": "id_rang1", "2": "id_rang2", ...}` |

## Commandes

**Membres :**
- `=proposer @user` — Demander quelqu'un en mariage (la cible reçoit un MP avec accepter/refuser)
- `=deslier [raison]` — Demander une désunion (un admin doit approuver)
- `=leaderboard` — Classement hebdomadaire
- `=aide` — Afficher l'aide

**Admins :**
- `=approuver [id]` — Approuver une demande de désunion
- `=refuserdivorce [id]` — Refuser une demande de désunion
- `=demandes` — Voir les demandes en attente

## Fonctionnement

- Les commandes ne fonctionnent que dans le salon configuré (`commandChannelId`)
- Quand quelqu'un propose, la cible reçoit un MP avec des boutons pour accepter ou refuser
- À l'acceptation, un salon privé est créé pour le couple
- Chaque message dans ce salon donne des points d'amour
- Chaque fin de semaine, les points sont remis à 0, un classement est affiché, et les rôles sont attribués selon le rang
- Pour se désunir, le couple doit faire une demande avec une raison ; un admin doit l'approuver

## Lancer le bot

```bash
npm start
```
"# loveroom" 
