const { Command, FriendlyError } = require('discord.js-commando');

const findMatchingPlayers = require("../../api/find-matching-players");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");
const playerSearchArguments = require("../../lib/player-search-arguments");

function formatPlayerInfoEmbed(player) {
  let embed = generateBasePlayerEmbed(player, player.prices);
  embed.addField("XBOX", `BIN: ${player.prices.xbox.LCPrice}\nUpdated: ${player.prices.xbox.updated}\nRange: ${player.prices.xbox.MinPrice} -> ${player.prices.xbox.MaxPrice}`, true);
  embed.addField("PS", `BIN: ${player.prices.ps.LCPrice}\nUpdated: ${player.prices.ps.updated}\nRange: ${player.prices.ps.MinPrice} -> ${player.prices.ps.MaxPrice}`, true);
  return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'price',
      aliases: ['player', 'players', 'p'],
      group: 'fut',
      memberName: 'price',
      description: 'Looks up basic player info and latest PS & XBOX Market price from FUTBIN',
      examples: ['price mertens', 'price mertens 87', 'price "dries mertens"', 'price "dries mertens" 87'],
      args: playerSearchArguments
    });
  }

  async run(msg, { name, rating }) {
    let matchingPlayers = findMatchingPlayers(this.client, msg, name, rating);
    for await (const player of matchingPlayers) {
      let embed = formatPlayerInfoEmbed(player);
      msg.embed(embed);
    }
    return;
  }
};
