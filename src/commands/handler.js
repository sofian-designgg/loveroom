const { proposer } = require('./member/proposer');
const { deslier } = require('./member/deslier');
const { leaderboard } = require('./member/leaderboard');
const { approuverDivorce, refuserDivorce, demandes } = require('./admin/divorce');
const { aide } = require('./member/aide');

const commands = {
  proposer,
  epouser: proposer,
  demander: proposer,
  deslier,
  divorce: deslier,
  leaderboard,
  classement: leaderboard,
  top: leaderboard,
  approuverdivorce: approuverDivorce,
  approuver: approuverDivorce,
  refuserdivorce: refuserDivorce,
  demandes,
  aide,
  help: aide,
};

async function handleCommand(client, message, commandName, args) {
  const cmd = commands[commandName];
  if (!cmd) {
    return message.reply(
      `Commande inconnue. Tape \`${client.prefix}aide\` pour la liste.`
    );
  }
  await cmd(client, message, args);
}

module.exports = { handleCommand };
