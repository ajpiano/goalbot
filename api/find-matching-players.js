const { FriendlyError } = require('discord.js-commando');
const _ = require("lodash");
const exclamations = require('../lib/our-exclamations');
const searchFutDB = require("./ea-fut-db");
const getFutbinPrices = require("./futbin-price");
const getFutbinPriceHistory = require("../lib/get-futbin-price-history");
const PlayerSearchRefiner = require("../lib/refine-player-arguments");

async function* findMatchingPlayers(client, msg, name, rating, history=false) {

    let dbResults = await searchFutDB(name);
    let failurePrefix = `Sorry ${msg.author}`;
    let successPrefix = `${exclamations.random()}, ${msg.author}!`;
    let successMsg = "";

    if (!dbResults.totalResults) {
      msg.say(`${failurePrefix}, No players found matching '${name}'`);
      return;
    } else {

      let lookupPlayers = dbResults.items;
      let searchName = name + (rating ? ` ${rating}`: '');

      // Suppresses FUT Champs Reward players
      lookupPlayers = _.reject(lookupPlayers, {rarityId: 18});

      if (rating) {
        lookupPlayers = _.filter(lookupPlayers, {rating: rating})
      }

      if (!lookupPlayers.length) {
        msg.say(`${failurePrefix}, ${dbResults.items.length} players matched '${name}', but none are rated ${rating}`);
        return;
      }

      if (lookupPlayers.length === 1) {
         successMessage = `${successPrefix} I found a match for '${searchName}':`;
      }

      if (lookupPlayers.length > 1) {
        let refiner = new PlayerSearchRefiner(client, msg, searchName, lookupPlayers);
        lookupPlayers = await refiner.refine();
        if (lookupPlayers === false) {
          throw new FriendlyError(`Sorry, I didn't get your answer there and have canceled the request.`)
        } else {
          successMessage = `Thanks for getting back to me, ${msg.author}! Here's the player you requested:`;
        } 
      }

      let futbinPrices = await getFutbinPrices(lookupPlayers);
      let matchedPlayer = lookupPlayers[0];
      matchedPlayer.prices = futbinPrices[matchedPlayer.id].prices;
      if (history) {
          matchedPlayer.priceHistory = await getFutbinPriceHistory(matchedPlayer, matchedPlayer.prices);
      }
      msg.say(successMessage);
      yield matchedPlayer;
      return;
    }

    throw new FriendlyError(`We have reached a section of the search code that we never should reach, ${msg.author}, I'm not sure how, but I'm sorry.`);
}

module.exports = findMatchingPlayers;
