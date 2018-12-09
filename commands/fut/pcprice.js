const { Command, FriendlyError } = require('discord.js-commando');

const findMatchingPlayers = require("../../api/find-matching-players");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");
const playerSearchArguments = require("../../lib/player-search-arguments");

function formatPlayerInfoEmbed(player) {
  let embed = generateBasePlayerEmbed(player, player.prices);
  embed.addField("PC", `BIN: ${player.prices.pc.LCPrice}\nUpdated: ${player.prices.pc.updated}\nRange: ${player.prices.pc.MinPrice} -> ${player.prices.pc.MaxPrice}`, true);
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
    let matchingPlayers = findMatchingPlayers(this.client, msg, name, rating, true);
    for await (const player of matchingPlayers) {
      let embed = formatPlayerInfoEmbed(player);
      msg.embed(embed);
    }
  }

};
