const { Command, FriendlyError } = require('discord.js-commando');
const _ = require("lodash");

const exclamations = require('../../lib/our-exclamations');

const findMatchingPlayers = require("../../api/find-matching-players");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");
const playerSearchArguments = require("../../lib/player-search-arguments");

function formatPlayerInfoEmbed(player, prices) {
  let embed = generateBasePlayerEmbed(player, prices);
  embed.addField("PC", `BIN: ${prices.pc.LCPrice}\nUpdated: ${prices.pc.updated}\nRange: ${prices.pc.MinPrice} -> ${prices.pc.MaxPrice}`, true);
  return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pcprice',
      aliases: ['pc', 'pcp'],
      group: 'fut',
      memberName: 'pcprice',
      description: 'Looks up basic player info from EA FUT DB + latest price on PC Market from FUTBIN',
      examples: ['players mertens', 'players mertens 87', 'players "dries mertens"', 'players "dries mertens" 87'],
      args: playerSearchArguments
    });
  }

  async run(msg, { name, rating }) {
    let matchingPlayers = findMatchingPlayers(msg, name, rating);
    let result = await matchingPlayers.next();
    if (!result.done) {
      let players = result.value;
      if (_.isString(players)) {
        return msg.say(`Sorry ${msg.author}, ${players}`);
      } else {
        let preamble = `${exclamations.random()}, ${msg.author}! `;
        if (players.totalMatches === 1) {
          preamble += `I found a match for '${players.search}', here it is:`;
        } else {
          preamble += `${players.totalMatches} players matched '${players.search}', here are the first ${players.matches.length}:`;
        }
        msg.say(preamble);

        players.matches.forEach((player) => {
          let prices = players.prices[player.id].prices;
          let embed = formatPlayerInfoEmbed(player, prices);
          msg.embed(embed);
        })
      }
    }
    return;
  }

};
