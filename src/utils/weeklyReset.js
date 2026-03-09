const { EmbedBuilder } = require('discord.js');
const {
  resetWeeklyPoints,
  getLeaderboard,
} = require('../database');

function getNextSunday() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(23, 59, 59, 999);
  return next;
}

function scheduleWeeklyReset(client) {
  const run = async () => {
    const couples = await getLeaderboard(10);

    const guild = client.guilds.cache.get(client.config.guildId);
    const rankRoles = client.config.rankRoles || {};
    const roleIds = Object.values(rankRoles).filter(Boolean);

    if (guild && roleIds.length > 0) {
      for (const roleId of roleIds) {
        const role = guild.roles.cache.get(roleId);
        if (role) {
          const members = role.members;
          for (const [, m] of members) {
            await m.roles.remove(role).catch(() => {});
          }
        }
      }
    }

    await resetWeeklyPoints();

    if (!guild) return;
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    for (let i = 0; i < couples.length; i++) {
      const rank = i + 1;
      const roleId = rankRoles[String(rank)];
      if (!roleId) continue;

      const role = guild.roles.cache.get(roleId);
      if (!role) continue;

      try {
        const u1 = await guild.members.fetch(couples[i].user1_id);
        const u2 = await guild.members.fetch(couples[i].user2_id);
        await u1.roles.add(role);
        await u2.roles.add(role);
      } catch (e) {
        console.error('Erreur attribution rôle:', e);
      }
    }

    let desc = '**Classement de la semaine écoulée:**\n';
    for (let j = 0; j < couples.length; j++) {
      const c = couples[j];
      const u1 = await guild.members.fetch(c.user1_id).catch(() => null);
      const u2 = await guild.members.fetch(c.user2_id).catch(() => null);
      const n1 = u1?.user?.username ?? c.user1_id;
      const n2 = u2?.user?.username ?? c.user2_id;
      desc += `${medals[j] || `${j + 1}.`} **${n1}** & **${n2}** — ${c.weekly_points} pts\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle('💘 Sayuri Loveroom — Reset hebdomadaire')
      .setDescription(
        'Les points de la semaine ont été réinitialisés.\n\n' + (desc || 'Aucun couple.')
      )
      .setFooter({ text: 'Les liaisons sont conservées. Nouvelle semaine !' })
      .setTimestamp();

    const channelId = client.config.commandChannelId;
    if (channelId) {
      const ch = guild.channels.cache.get(channelId);
      if (ch) {
        await ch.send({ embeds: [embed] }).catch(console.error);
      }
    }
  };

  const next = getNextSunday();
  const msUntil = next.getTime() - Date.now();
  setTimeout(() => {
    run();
    setInterval(run, 7 * 24 * 60 * 60 * 1000);
  }, Math.max(msUntil, 0));
}

module.exports = { scheduleWeeklyReset, getNextSunday };
