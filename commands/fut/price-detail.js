const { Command, FriendlyError } = require('discord.js-commando');

const playerSearchArguments = require("../../lib/player-search-arguments");
const findMatchingPlayers = require("../../api/find-matching-players");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");
const { formatPlatformPriceDetail, formatBins, formatPriceHistory } = require("../../formatters/string")

function formatPriceDetailEmbed(player) {
  let embed = generateBasePlayerEmbed(player, player.prices);
  embed.addField("XBOX", formatPlatformPriceDetail(player.prices.xbox, player.priceHistory.xbox), true);
  embed.addField("PS", formatPlatformPriceDetail(player.prices.ps, player.priceHistory.ps), true);
  return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'price-detail',
      aliases: ['pd'],
      group: 'fut',
      memberName: 'price-detail',
      description: 'Looks up detailed current and historical price information from FUTBIN',
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
