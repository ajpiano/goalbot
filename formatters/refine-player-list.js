const _ = require("lodash");
const AsciiTable = require("ascii-table");
const flag = require('emoji-flag');
const countries = require('country-list/data');

const rarities = require('../lib/futitemraritytunables').rarities;
const { formatShortName } = require("./string");

countries.push({code: 'NL', name: 'Holland'});

function formatRefinePlayerList(players) {
  var table = AsciiTable.factory({
    heading: [ 'Choice', 'Name', 'OVR', 'VER', 'Nation', 'Club', 'League'],
    rows: players.map((player, i) => {
      let nationInfo = _.find(countries, {name: player.nation.name});
      let flagEmoji = "";
      let cardTypeInfo = _.find(rarities, {id: player.rarityId});
      let cardTypeName = "";
      if (cardTypeInfo) {
        cardTypeName = _.startCase(_.camelCase(`${cardTypeInfo.name} ${player.quality}`));
      }
      return [i+1, formatShortName(player), player.rating, cardTypeName, player.nation.abbrName, player.club.abbrName, player.league.abbrName];
    })
  });
  return table.toString();
}

module.exports = formatRefinePlayerList;
