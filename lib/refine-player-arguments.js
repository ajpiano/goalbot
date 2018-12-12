const { ArgumentCollector } = require('discord.js-commando');
const _ = require("lodash");
const formatRefinePlayerList = require("../formatters/refine-player-list");

module.exports = class PlayerSearchRefiner {
  constructor(client, msg, players) {
    this.msg = msg;
    this.players = players;
    this.client = client;
  }

  async refine() {
    let choiceIndexes = _.map(Array(this.players.length), (n,i) => { return i+1; });
    let choiceList = formatRefinePlayerList(this.players);
    this.msg.reply(`\`\`\`${choiceList}\`\`\``);
    let playerChooser = new ArgumentCollector(this.client, [{
      key: 'index',
      prompt: 'Which number player do you want to view?',
      type: 'integer',
      oneOf: choiceIndexes
    }]);
    let choice = await playerChooser.obtain(this.msg);
    if (choice.values && choice.values.index) {
      return this.players.slice(choice.values.index-1, choice.values.index);
    } else {
      return false;
    }
  }
};
