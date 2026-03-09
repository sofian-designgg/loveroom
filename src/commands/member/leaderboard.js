const { EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../database');

async function leaderboard(client, message, args) {
  const limit = Math.min(parseInt(args[0]) || 10, 25);

  const couples = await getLeaderboard(limit);
  if (couples.length === 0) {
    return message.reply('Aucun couple pour le moment.');
  }

  const guild = message.guild;
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  let description = '';
  for (let i = 0; i < couples.length; i++) {
    const c = couples[i];
    const u1 = await guild.members.fetch(c.user1_id).catch(() => null);
    const u2 = await guild.members.fetch(c.user2_id).catch(() => null);
    const name1 = u1?.user?.username ?? c.user1_id;
    const name2 = u2?.user?.username ?? c.user2_id;
    const medal = medals[i] || `${i + 1}.`;
    description += `${medal} **${name1}** & **${name2}** — ${c.weekly_points} pts\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(0xff69b4)
    .setTitle('💘 Classement hebdomadaire — Sayuri Loveroom')
    .setDescription(description || 'Aucun couple.')
    .setFooter({ text: 'Points réinitialisés chaque fin de semaine' })
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

module.exports = { leaderboard };
