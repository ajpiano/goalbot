const { FriendlyError } = require('discord.js-commando');
const _ = require("lodash");
const searchFutDB = require("./ea-fut-db");
const getFutbinPrices = require("./futbin-price");

async function* findMatchingPlayers(msg, name, rating) {

    let dbResults = await searchFutDB(name);

    if (!dbResults.totalResults) {
      yield `No players found matching '${name}'`;
    } else {

      let lookupPlayers = dbResults.items;

      // Suppresses FUT Champs Reward players
      lookupPlayers = _.reject(lookupPlayers, {rarityId: 18});

      if (rating) {
        lookupPlayers = _.filter(lookupPlayers, {rating: rating})
      }

      if (!lookupPlayers.length) {
        yield `${dbResults.items.length} players matched '${name}', but none are rated ${rating}`;
      }

      let truncatedResults = lookupPlayers.slice(0,4);
      let futbinPrices = await getFutbinPrices(truncatedResults);
      let searchName = name + (rating ? ` ${rating}`: '');
      yield {matches: truncatedResults, prices: futbinPrices, totalMatches: lookupPlayers.length, search: searchName};
      return;
    }

    throw new FriendlyError(`We have reached a section of the search code that we never should reach, ${msg.author}, I'm not sure how, but I'm sorry.`);
}

module.exports = findMatchingPlayers;
