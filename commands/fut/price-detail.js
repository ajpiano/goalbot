const { Command, FriendlyError } = require('discord.js-commando');
const _ = require("lodash");
const exclamations = require('../../lib/our-exclamations');

const playerSearchArguments = require("../../lib/player-search-arguments");
const PlayerSearchRefiner = require("../../lib/refine-player-arguments");
const findMatchingPlayers = require("../../api/find-matching-players");
const getFutbinPriceHistory = require("../../lib/get-futbin-price-history");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");

function formatPriceDetailEmbed(player, prices, priceHistory) {
  let embed = generateBasePlayerEmbed(player, prices);
  embed.addField("XBOX", formatPlatformPriceDetail(prices.xbox, priceHistory.xbox), true);
  embed.addField("PS", formatPlatformPriceDetail(prices.ps, priceHistory.ps), true);
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
    let matchingPlayers = findMatchingPlayers(msg, name, rating);
    let result = await matchingPlayers.next();
    if (!result.done) {
      let players = result.value;
      if (_.isString(players)) {
        return msg.say(`Sorry ${msg.author}, ${players}`);
      } else {
        let preamble = `${exclamations.random()}, ${msg.author}! `;
        if (players.totalMatches === 1) {
          preamble += `I found a match for '${players.search}', here is detailed information about its price:`;
          msg.say(preamble);
        } else {
          preamble += `${players.totalMatches} players matched '${players.search}', please select one:`;
          msg.say(preamble);
          let refiner = new PlayerSearchRefiner(this.client, msg, players)
          let choice = await refiner.collector.obtain(msg);
          if (choice.values) {
            players.matches = [players.matches[choice.values.index-1]];
          } else {
            msg.reply("No selection made, cancelling command.");
            return;
          }
        }

        players.matches.forEach(async (player) => {
          let prices = players.prices[player.id].prices;
          let priceHistory = await getFutbinPriceHistory(player, prices);
          let embed = formatPriceDetailEmbed(player, prices, priceHistory);
          msg.embed(embed);
        })
      }
    }
    return;
  }
};
