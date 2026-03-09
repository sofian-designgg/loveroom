const { EmbedBuilder } = require('discord.js');
const {
  getCoupleByUser,
  createDivorceRequest,
  hasPendingDivorceRequest,
} = require('../../database');

async function deslier(client, message, args) {
  const couple = await getCoupleByUser(message.author.id);
  if (!couple) {
    return message.reply("Tu n'es pas en couple.");
  }

  if (await hasPendingDivorceRequest(couple._id)) {
    return message.reply('Une demande de désunion est déjà en cours. Attends la réponse d\'un admin.');
  }

  const reason = args.join(' ').trim();
  if (!reason || reason.length < 10) {
    return message.reply(
      '**Usage:** `=deslier [raison]` — Indique une raison d\'au moins 10 caractères.'
    );
  }

  await createDivorceRequest(couple._id, reason);

  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle('📋 Demande de désunion envoyée')
    .setDescription(
      'Ta demande a été envoyée aux admins. Un admin doit l\'approuver avec:\n' +
      `\`${client.prefix}approuver [id]\` ou \`${client.prefix}refuserdivorce [id]\``
    )
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

module.exports = { deslier };
