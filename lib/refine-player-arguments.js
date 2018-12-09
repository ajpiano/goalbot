const { ArgumentCollector } = require('discord.js-commando');
const _ = require("lodash");
const formatRefinePlayerList = require("../formatters/refine-player-list");

module.exports = class PlayerSearchRefiner {
  constructor(client, msg, players) {
    let choiceIndexes = _.map(Array(players.length), (n,i) => { return i+1; });
    let choiceList = formatRefinePlayerList(players);
    msg.reply(`\`\`\`${choiceList}\`\`\``);
    let playerChooser = new ArgumentCollector(client, [{
      key: 'index',
      prompt: 'Which number player do you want to view?',
      type: 'integer',
      oneOf: choiceIndexes
    }]);
    this.collector = playerChooser;
  }
};
