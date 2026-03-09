require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { connectDatabase, initDatabase } = require('./src/database');
const { handleCommand } = require('./src/commands/handler');
const { scheduleWeeklyReset } = require('./src/utils/weeklyReset');
const { setupButtonHandler } = require('./src/commands/member/proposer');
const path = require('path');
const fs = require('fs');

function loadConfig() {
  const fromEnv = {
    guildId: process.env.GUILD_ID,
    commandChannelId: process.env.COMMAND_CHANNEL_ID,
    loungeCategoryId: process.env.LOUNGE_CATEGORY_ID,
    rankRoles: process.env.RANK_ROLES ? JSON.parse(process.env.RANK_ROLES) : {},
  };
  let fromFile = {};
  try {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
      fromFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error('Erreur chargement config:', e.message);
  }
  return { ...fromFile, ...fromEnv };
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.prefix = '=';
client.config = loadConfig();

client.once('ready', () => {
  console.log(`💘 Sayuri Loveroom connecté en tant que ${client.user.tag}`);
  client.user.setActivity('=aide pour les commandes', { type: 3 });
  setupButtonHandler(client);
  scheduleWeeklyReset(client);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const { commandChannelId } = client.config;

  if (!message.channel.isDMBased()) {
    const { getCoupleByChannel, addLovePoints } = require('./src/database');
    const couple = await getCoupleByChannel(message.channel.id);
    if (couple) {
      const authorId = message.author.id;
      if (authorId === couple.user1_id || authorId === couple.user2_id) {
        await addLovePoints(message.channel.id, 1);
      }
    }
  }

  if (!message.content.startsWith(client.prefix)) return;

  if (commandChannelId && message.channel.id !== commandChannelId) {
    return;
  }

  const args = message.content.slice(client.prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  try {
    await handleCommand(client, message, commandName, args);
  } catch (err) {
    console.error('Erreur commande:', err);
    const embed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle('Erreur')
      .setDescription(`Une erreur s'est produite: ${err.message}`);
    await message.reply({ embeds: [embed] }).catch(() => {});
  }
});

async function main() {
  await connectDatabase();
  await initDatabase();
  client.login(process.env.DISCORD_TOKEN);
}
main().catch((err) => {
  console.error('Erreur démarrage:', err);
  process.exit(1);
});
