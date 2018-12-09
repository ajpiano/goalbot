const _ = require("lodash");
const flag = require('emoji-flag');
const countries = require('country-list/data');

const rarities = require('../lib/futitemraritytunables').rarities;
const { formatPrettyName } = require("./string");

countries.push({code: 'NL', name: 'Holland'});

function formatRefinePlayerList(players) {
  let choiceList = players.map((player, i) => {
    let nationInfo = _.find(countries, {name: player.nation.name});
    let flagEmoji = "";
    if (nationInfo) {
      flagEmoji = flag(nationInfo.code) + " ";
    }
    let cardTypeInfo = _.find(rarities, {id: player.rarityId});
    let cardTypeName = "";
    if (cardTypeInfo) {
      cardTypeName = _.startCase(_.camelCase(`${cardTypeInfo.name} ${player.quality}`));
    }
    return `[${i+1}] ${formatPrettyName(player)} | ${player.nation.abbrName} - ${player.club.abbrName} (${player.league.abbrName}) | ${player.rating} ${player.position} (${cardTypeName})`;
  }).join("\n");
  return choiceList;
}

module.exports = formatRefinePlayerList;
