const { Command, FriendlyError } = require('discord.js-commando');

const playerSearchArguments = require("../../lib/player-search-arguments");
const PlayerSearchRefiner = require("../../lib/refine-player-arguments");
const findMatchingPlayers = require("../../api/find-matching-players");
const getFutbinPriceHistory = require("../../lib/get-futbin-price-history");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");

function formatPriceDetailEmbed(player) {
  let embed = generateBasePlayerEmbed(player, player.prices);
  embed.addField("XBOX", formatPlatformPriceDetail(player.prices.xbox, player.priceHistory.xbox), true);
  embed.addField("PS", formatPlatformPriceDetail(player.prices.ps, player.priceHistory.ps), true);
  return embed;
}

function formatPlatformPriceDetail(platformPrices, platformHistory) {
  return `${formatBins(platformPrices)}
    **Updated**: ${platformPrices.updated}
    **Range**: ${platformPrices.MinPrice} -> ${platformPrices.MaxPrice}
    **PRP**: ${platformPrices.PRP}%

    ${formatPriceHistory(platformHistory)}`;
}

function formatBins(platformPrices) {
  return `**5 Lowest BIN prices**
    - ${platformPrices.LCPrice}
    - ${platformPrices.LCPrice2}
    - ${platformPrices.LCPrice3}
    - ${platformPrices.LCPrice4}
    - ${platformPrices.LCPrice5}`;
}

function formatPriceHistory(history) {
	return `**Change since**
	1 hour ago: ${history["1h"].toFixed(2)}%
	3 hours ago: ${history["3h"].toFixed(2)}%
	6 hours ago: ${history["6h"].toFixed(2)}%
	12 hours ago: ${history["12h"].toFixed(2)}%
	24 hours ago: ${history["1d"].toFixed(2)}%
	2 days ago: ${history["2d"].toFixed(2)}%
	1 week ago: ${history["1w"].toFixed(2)}%
	2 weeks ago: ${history["2w"].toFixed(2)}%
	1 month ago: ${history["1m"].toFixed(2)}%
	2 months ago: ${history["2m"].toFixed(2)}%`;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'price-detail',
      aliases: ['pd'],
      group: 'fut',
      memberName: 'price-detail',
      description: 'Looks up detailed price current and historical price information from EA FUT DB + FUTBIN',
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
