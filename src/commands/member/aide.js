const { EmbedBuilder } = require('discord.js');

function aide(client, message) {
  const prefix = client.prefix;

  const embed = new EmbedBuilder()
    .setColor(0xff69b4)
    .setTitle('💘 Sayuri Loveroom — Aide')
    .setDescription(
      '**Commandes membres:**\n' +
      `\`${prefix}proposer @user\` — Demander quelqu'un en mariage\n` +
      `\`${prefix}deslier [raison]\` — Demander une désunion (admin doit approuver)\n` +
      `\`${prefix}leaderboard\` — Voir le classement hebdomadaire\n` +
      `\`${prefix}aide\` — Afficher cette aide\n\n` +
      '**Commandes admin:**\n' +
      `\`${prefix}approuver [id]\` — Approuver une demande de désunion\n` +
      `\`${prefix}refuserdivorce [id]\` — Refuser une demande de désunion\n` +
      `\`${prefix}demandes\` — Lister les demandes de désunion en attente`
    )
    .setFooter({ text: 'Envoie des messages dans ton salon couple pour gagner des points !' })
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

module.exports = { aide };
