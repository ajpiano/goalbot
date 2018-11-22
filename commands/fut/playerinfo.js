const { Command, FriendlyError } = require('discord.js-commando');
const _ = require("lodash");

const exclamations = require('exclamation');
// Apparently this is something Robin said during the 1960s Batman TV show. However, it's not something that should be flying into discord price messages for FUT players.
exclamations.all = _.without(exclamations.all, 'Holy Holocaust');
exclamations.random = () => exclamations.all[Math.floor(Math.random() * exclamations.all.length)];

const searchFutDB = require("../../api/ea-fut-db");
const getFutbinPrices = require("../../api/futbin-price");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");

function formatPlayerInfoEmbed(player, prices) {
  let embed = generateBasePlayerEmbed(player, prices);
  embed.addField("XBOX", `BIN: ${prices.xbox.LCPrice}\nUpdated: ${prices.xbox.updated}\nRange: ${prices.xbox.MinPrice} -> ${prices.xbox.MaxPrice}`, true);
  embed.addField("PS", `BIN: ${prices.ps.LCPrice}\nUpdated: ${prices.ps.updated}\nRange: ${prices.ps.MinPrice} -> ${prices.ps.MaxPrice}`, true);
  //embed.addField("PC", `BIN: ${prices.pc.LCPrice}\nUpdated: ${prices.pc.updated}\nRange: ${prices.pc.MinPrice} -> ${prices.pc.MaxPrice}`, true);
  return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'players',
      aliases: ['player', 'p'],
      group: 'fut',
      memberName: 'players',
      description: 'Looks up player info from EA FUT DB + price from FUTBIN',
      examples: ['players mertens', 'players mertens 87', 'players "dries mertens"', 'players "dries mertens" 87'],
      args: [
        {
          key: 'name',
          prompt: 'Which player(s) do you want to search for? Use quotes if searching with spaces',
          type: 'string'
        }, {
          key: 'rating',
          prompt: 'Which rating should we match on?',
          type: 'integer',
          default: ''
        }
      ]
    });
  }

  async run(msg, { name, rating }) {

    let dbResults = await searchFutDB(name);

    if (!dbResults.totalResults) {
      return msg.say(`Sorry ${msg.author}, no players found matched '${name}'`);
    } else {

      let lookupPlayers = dbResults.items;

      // Suppresses FUT Champs Reward players
      lookupPlayers = _.reject(lookupPlayers, {rarityId: 18});

      if (rating) {
        lookupPlayers = _.filter(lookupPlayers, {rating: rating})
      }

      if (!lookupPlayers.length) {
        return msg.say(`Sorry ${msg.author}, ${dbResults.items.length} players matched '${name}', but none are rated ${rating}`);
      }

      let truncatedResults = lookupPlayers.slice(0,4);
      let futbinPrices = await getFutbinPrices(truncatedResults);
      let searchName = name + (rating ? ` ${rating}`: '');
      let preamble = `${exclamations.random()}, ${msg.author}! `;

      if (lookupPlayers.length === 1) {
        preamble += `I found a match for '${searchName}', here it is:`;
      } else {
        preamble += `${lookupPlayers.length} players matched '${searchName}', here are the first ${truncatedResults.length}:`;
      }

      msg.say(preamble);

      truncatedResults.forEach((player) => {
        let prices = futbinPrices[player.id].prices;
        let embed = formatPlayerInfoEmbed(player, prices);
        msg.embed(embed);
      });

      return;
    }

    throw new FriendlyError(`We have reached a section of code that we shouldn't have, ${msg.author}, I'm not sure how, but I'm sorry.`);
  }
};
