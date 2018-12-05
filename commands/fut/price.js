const { Command, FriendlyError } = require('discord.js-commando');
const _ = require("lodash");
const exclamations = require('../../lib/our-exclamations');

const findMatchingPlayers = require("../../api/find-matching-players");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");
const playerSearchArguments = require("../../lib/player-search-arguments");

function formatPlayerInfoEmbed(player, prices) {
  let embed = generateBasePlayerEmbed(player, prices);
  embed.addField("XBOX", `BIN: ${prices.xbox.LCPrice}\nUpdated: ${prices.xbox.updated}\nRange: ${prices.xbox.MinPrice} -> ${prices.xbox.MaxPrice}`, true);
  embed.addField("PS", `BIN: ${prices.ps.LCPrice}\nUpdated: ${prices.ps.updated}\nRange: ${prices.ps.MinPrice} -> ${prices.ps.MaxPrice}`, true);
  return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'price',
      aliases: ['player', 'players', 'p'],
      group: 'fut',
      memberName: 'price',
      description: 'Looks up basic player info from EA FUT DB + latest PS & XBOX Market price from FUTBIN',
      examples: ['price mertens', 'price mertens 87', 'price "dries mertens"', 'price "dries mertens" 87'],
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
