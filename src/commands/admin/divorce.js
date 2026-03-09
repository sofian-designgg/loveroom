const { EmbedBuilder } = require('discord.js');
const {
  getPendingDivorceRequests,
  getDivorceRequestById,
  approveDivorce,
  rejectDivorce,
  getCoupleById,
  deleteCouple,
} = require('../../database');

async function approuverDivorce(client, message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('Cette commande est réservée aux admins.');
  }

  const id = args[0]?.trim();
  if (!id) {
    return message.reply(
      `**Usage:** \`${client.prefix}approuver [id]\` — Utilise \`${client.prefix}demandes\` pour voir les IDs.`
    );
  }

  const request = await getDivorceRequestById(id);
  if (!request || request.status !== 'pending') {
    return message.reply('Demande introuvable ou déjà traitée.');
  }

  await approveDivorce(id);
  const couple = await getCoupleById(request.couple_id);
  if (couple) {
    const guild = message.guild;
    const channel = guild.channels.cache.get(couple.channel_id);
    if (channel) {
      try {
        await channel.delete();
      } catch (e) {
        console.error('Erreur suppression salon:', e);
      }
    }
    await deleteCouple(couple._id);
  }

  try {
    const u1 = await client.users.fetch(request.user1_id);
    const u2 = await client.users.fetch(request.user2_id);
    await u1.send(`Votre demande de désunion a été **approuvée**. Vous n'êtes plus liés.`);
    await u2.send(`Votre demande de désunion a été **approuvée**. Vous n'êtes plus liés.`);
  } catch (_) {}

  return message.reply('Demande de désunion approuvée. Le salon a été supprimé.');
}

async function refuserDivorce(client, message, args) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('Cette commande est réservée aux admins.');
  }

  const id = args[0]?.trim();
  if (!id) {
    return message.reply(
      `**Usage:** \`${client.prefix}refuserdivorce [id]\` — Utilise \`${client.prefix}demandes\` pour voir les IDs.`
    );
  }

  const request = await getDivorceRequestById(id);
  if (!request || request.status !== 'pending') {
    return message.reply('Demande introuvable ou déjà traitée.');
  }

  await rejectDivorce(id);

  try {
    const u1 = await client.users.fetch(request.user1_id);
    const u2 = await client.users.fetch(request.user2_id);
    await u1.send(`Votre demande de désunion a été **refusée** par un admin.`);
    await u2.send(`Votre demande de désunion a été **refusée** par un admin.`);
  } catch (_) {}

  return message.reply('Demande de désunion refusée. Le couple reste lié.');
}

async function demandes(client, message) {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('Cette commande est réservée aux admins.');
  }

  const requests = await getPendingDivorceRequests();
  if (requests.length === 0) {
    return message.reply('Aucune demande de désunion en attente.');
  }

  let description = '';
  for (const r of requests) {
    const reqId = r.id ?? r._id?.toString?.();
    description += `**ID ${reqId}** — <@${r.user1_id}> & <@${r.user2_id}>\nRaison: ${r.reason}\n\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle('📋 Demandes de désunion en attente')
    .setDescription(description)
    .setFooter({ text: `Utilise ${client.prefix}approuver [id] ou ${client.prefix}refuserdivorce [id]` })
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

module.exports = {
  approuverDivorce,
  refuserDivorce,
  demandes,
};
