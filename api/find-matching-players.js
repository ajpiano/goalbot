const { FriendlyError } = require('discord.js-commando');
const _ = require("lodash");
const exclamations = require('../lib/our-exclamations');
const searchFutbinAutocomplete = require("./futbin-autocomplete");
const getFutbinPrices = require("./futbin-price");
const getFutbinPage = require("./futbin-player-page");
const getFutbinPriceHistory = require("./get-futbin-price-history");
const PlayerSearchRefiner = require("../lib/player-search-refiner");

async function* findMatchingPlayers(client, msg, name, rating, history=false) {

    let dbResults = await searchFutbinAutocomplete(name);
    let failurePrefix = `Sorry ${msg.author}`;
    let successPrefix = `${exclamations.random()}, ${msg.author}!`;
    let successMessage = "";
    let pendingPrefix = `Thanks for getting back to me, ${msg.author}!`;
    let pendingMessage;
    let waitMessage = `Hang on a moment while I fetch the price data from FUTBIN...`;

    if (!dbResults.length) {
      msg.say(`${failurePrefix}, No players found matching '${name}'`);
      return;
    } else {

      let lookupPlayers = dbResults;
      let searchName = name + (rating ? ` ${rating}`: '');

      // Suppresses FUT Champs Reward players, not necessary because FUTBIN doesn't include them in the search to begin with
      // lookupPlayers = _.reject(lookupPlayers, {rarityId: 18});

      if (rating) {
        lookupPlayers = _.filter(lookupPlayers, {rating: rating})
      }

      if (!lookupPlayers.length) {
        msg.say(`${failurePrefix}, ${dbResults.length} players matched '${name}', but none are rated ${rating}`);
        return;
      }

      if (lookupPlayers.length === 1) {
         pendingPrefix = `${successPrefix} I found a match for '${searchName}' -`;
         pendingMessage = await msg.say(`${pendingPrefix} ${waitMessage}`);
         successMessage = `${pendingPrefix} here it is:`
      }

      if (lookupPlayers.length > 1) {
        let refiner = new PlayerSearchRefiner(client, msg, searchName, lookupPlayers);
        lookupPlayers = await refiner.refine();
        if (lookupPlayers === false) {
          throw new FriendlyError(`Sorry, I didn't get your answer there and have canceled the request.`)
        } else {
          pendingMessage = await msg.say(`${pendingPrefix} ${waitMessage}`);
          successMessage = `${pendingPrefix} Here's the player you requested:`
        } 
      }

      //let matchedPlayer = lookupPlayers[0];
      let matchedPlayer = await getFutbinPage(lookupPlayers[0]);
      let futbinPrices = await getFutbinPrices(matchedPlayer);
      matchedPlayer.prices = futbinPrices[matchedPlayer.playerResource].prices;
      if (history) {
          matchedPlayer.priceHistory = await getFutbinPriceHistory(matchedPlayer, matchedPlayer.prices);
      }
      await pendingMessage.edit(successMessage);
      yield matchedPlayer;
      return;
    }

    throw new FriendlyError(`We have reached a section of the search code that we never should reach, ${msg.author}, I'm not sure how, but I'm sorry.`);
}

module.exports = findMatchingPlayers;
