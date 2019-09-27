const _ = require("lodash");
const AsciiTable = require("ascii-table");
const flag = require('emoji-flag');
const countries = require('country-list/data');

const rarities = require('../lib/rarities');
const { formatShortName } = require("./string");
const webappLocalization = require('../lib/webapp-localization');

countries.push({code: 'NL', name: 'Holland'});

function formatRefinePlayerList(players) {
  var table = AsciiTable.factory({
    heading: [ 'Choice', 'Name', 'OVR',
    // 'CLB',
    'Version'],
    rows: players.map((player, i) => {
      let cardTypeInfo = _.find(rarities, {id: player.rare_type});
      let cardTypeName = "";
      //let clubAbbr = webappLocalization[`global.teamabbr3.2020.team${player.club.id}`] || player.club.abbrName;
      if (cardTypeInfo) {
        cardTypeName = _.startCase(_.camelCase(`${cardTypeInfo.name}`)).replace("Champions League", "UCL");
      }
      return [i+1, player.full_name, player.rating,
      //clubAbbr,
      cardTypeName];
    })
  });
  return table.toString();
}

module.exports = formatRefinePlayerList;
