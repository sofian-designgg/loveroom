const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const {
  getCoupleByUser,
  createCouple,
} = require('../../database');

const pendingProposals = new Map();

async function proposer(client, message, args) {
  const target = message.mentions.users.first() || client.users.cache.find(
    (u) => u.username.toLowerCase() === args[0]?.toLowerCase() || u.tag.toLowerCase() === args.join(' ').toLowerCase()
  );

  if (!target) {
    return message.reply(
      '**Usage:** `=proposer @utilisateur` ou `=proposer pseudo`'
    );
  }

  if (target.id === message.author.id) {
    return message.reply('Tu ne peux pas te proposer à toi-même 💔');
  }

  if (target.bot) {
    return message.reply('Tu ne peux pas te lier à un bot.');
  }

  const authorCouple = await getCoupleByUser(message.author.id);
  if (authorCouple) {
    return message.reply(
      `Tu es déjà en couple avec quelqu'un ! Utilise \`${client.prefix}deslier [raison]\` pour demander une séparation.`
    );
  }

  const targetCouple = await getCoupleByUser(target.id);
  if (targetCouple) {
    return message.reply(`${target.username} est déjà en couple.`);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accept_proposal')
      .setLabel('Accepter 💕')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('refuse_proposal')
      .setLabel('Refuser 💔')
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setColor(0xff69b4)
    .setTitle('💘 Demande en mariage')
    .setDescription(
      `**${message.author.username}** veut se lier à toi dans le Loveroom !\n\n` +
      'Clique sur un bouton pour répondre.'
    )
    .setTimestamp();

  try {
    await target.send({
      embeds: [embed],
      components: [row],
    });
  } catch (e) {
    return message.reply(
      `Impossible d'envoyer un MP à ${target.username}. Vérifie que ses DMs sont ouverts.`
    );
  }

  pendingProposals.set(target.id, {
    proposerId: message.author.id,
    guildId: message.guild.id,
    timestamp: Date.now(),
  });

  setTimeout(() => {
    if (pendingProposals.has(target.id)) {
      pendingProposals.delete(target.id);
    }
  }, 300000);

  return message.reply(
    `💌 Demande envoyée à **${target.username}** ! Ils doivent accepter ou refuser en MP.`
  );
}

async function setupButtonHandler(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'accept_proposal' && interaction.customId !== 'refuse_proposal') return;

    const data = pendingProposals.get(interaction.user.id);
    if (!data) {
      return interaction.reply({
        content: 'Cette proposition a expiré.',
        ephemeral: true,
      });
    }

    const guild = client.guilds.cache.get(data.guildId);
    if (!guild) return;

    const proposerUser = await client.users.fetch(data.proposerId).catch(() => null);
    if (!proposerUser) return;

    if (interaction.customId === 'refuse_proposal') {
      pendingProposals.delete(interaction.user.id);
      try {
        await proposerUser.send(
          `**${interaction.user.username}** a refusé ta demande. 💔`
        );
      } catch (_) {}
      return interaction.reply({
        content: 'Demande refusée. Le proposant a été notifié.',
        ephemeral: true,
      });
    }

    if (interaction.customId === 'accept_proposal') {
      pendingProposals.delete(interaction.user.id);

      const { commandChannelId, loungeCategoryId } = client.config;
      if (!loungeCategoryId) {
        return interaction.reply({
          content: 'Erreur: `loungeCategoryId` non configuré dans config.json.',
          ephemeral: true,
        });
      }

      const category = guild.channels.cache.get(loungeCategoryId);
      if (!category) {
        return interaction.reply({
          content: 'Erreur: Catégorie des salons couples introuvable.',
          ephemeral: true,
        });
      }

      const user1 = data.proposerId;
      const user2 = interaction.user.id;
      const names = [proposerUser.username, interaction.user.username].sort();
      const channelName = `💕-${names[0]}-${names[1]}`.toLowerCase().replace(/\s+/g, '-');

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: user1, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: user2, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        ],
      });

      await createCouple(user1, user2, channel.id);

      const embed = new EmbedBuilder()
        .setColor(0xff69b4)
        .setTitle('💘 Liaison créée !')
        .setDescription(
          `**${proposerUser.username}** et **${interaction.user.username}** sont maintenant liés !\n\n` +
          `Salon privé: ${channel}\n\n` +
          'Envoyez des messages dans votre salon pour accumuler des points d\'amour. 💕'
        )
        .setTimestamp();

      await channel.send({
        content: `<@${user1}> <@${user2}>`,
        embeds: [embed],
      });

      try {
        await proposerUser.send(
          `**${interaction.user.username}** a accepté ! Votre salon privé: ${channel}`
        );
      } catch (_) {}

      return interaction.reply({
        content: `Félicitations ! Vous êtes maintenant liés. Votre salon: ${channel}`,
        ephemeral: true,
      });
    }
  });
}

module.exports = {
  proposer,
  setupButtonHandler,
  pendingProposals,
};
