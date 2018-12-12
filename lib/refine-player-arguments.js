const _ = require("lodash");
const exclamations = require('../lib/our-exclamations');
const { ArgumentCollector } = require('discord.js-commando');
const formatRefinePlayerList = require("../formatters/refine-player-list");

module.exports = class PlayerSearchRefiner {
  constructor(client, msg, searchName, players) {
    this.msg = msg;
    this.client = client;
    this.players = players;
    this.searchName = searchName;
  }

  async refine() {
    let successPrefix = `${exclamations.random()}, ${this.msg.author}!`;
    let choiceIndexes = _.map(Array(this.players.length), (n,i) => { return i+1; });
    let multiplePlayerMessage = "";
    if (this.players.length > 15 ) {
      this.players = this.players.slice(0,15);
      multiplePlayerMessage = `More than 15 players matched '${this.searchName}', select one of the top 10 matches or 'cancel' to try a more specific search:`;
    } else {
      multiplePlayerMessage = `${this.players.length} players matched '${this.searchName}', please select one:`;
    }
    this.msg.say(`${successPrefix} ${multiplePlayerMessage}`);

    let choiceList = formatRefinePlayerList(this.players);
    this.msg.say(`\`\`\`${choiceList}\`\`\``);

    let playerChooser = new ArgumentCollector(this.client, [{
      key: 'choice',
      prompt: 'Which number player do you want to view?',
      type: 'integer',
      oneOf: choiceIndexes
    }]);

    let result = await playerChooser.obtain(this.msg);

    if (result.values && result.values.choice) {
      return this.players.slice(result.values.choice-1, result.values.choice);
    } else {
      return false;
    }
  }
};
