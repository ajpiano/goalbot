const { Command, FriendlyError } = require('discord.js-commando');

const playerSearchArguments = require("../../lib/player-search-arguments");
const findMatchingPlayers = require("../../api/find-matching-players");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");
const { formatPlatformPriceDetail, formatBins, formatPriceHistory } = require("../../formatters/string")

function formatPriceDetailEmbed(player) {
  let embed = generateBasePlayerEmbed(player, player.prices);
  embed.addField("PC", formatPlatformPriceDetail(player.prices.pc, player.priceHistory.pc), true);
  return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pc-price-detail',
      aliases: ['pcpd'],
      group: 'fut',
      memberName: 'pc-price-detail',
      description: 'Looks up detailed current and historical price information for the PC platform from EA FUT DB + FUTBIN',
      examples: ['pd mertens 87'],
      args: playerSearchArguments
    });
  }

  async run(msg, { name, rating }) {
    let matchingPlayers = findMatchingPlayers(this.client, msg, name, rating, true);
    for await (const player of matchingPlayers) {
      let embed = formatPriceDetailEmbed(player);
      msg.embed(embed);
    }
    return;
  }
};
