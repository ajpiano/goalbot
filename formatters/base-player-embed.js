const { RichEmbed } = require('discord.js');
const _ = require("lodash");
const flag = require('emoji-flag');
const countries = require('country-list/data');

const version = require('../package').version;
const rarities = require('../lib/futitemraritytunables').rarities;
const { formatPrettyName, formatHeight, formatWeight } = require("./string");

countries.push({code: 'NL', name: 'Holland'});

function formatBasePlayerEmbed(player, prices) {
  let embed = new RichEmbed();
  let nationInfo = _.find(countries, {name: player.nation.name});
  let flagEmoji = "";
  if (nationInfo) {
    flagEmoji = flag(nationInfo.code) + " ";
  }
  let cardTypeInfo = _.find(rarities, {id: player.rarityId});
  let cardTypeName = "";
  if (cardTypeInfo) {
    cardTypeName = _.startCase(_.camelCase(`${cardTypeInfo.name} ${player.quality}`));
    embed.setColor(`${cardTypeInfo.colorArray[0]}`.substr(0,6));
  }
  embed.setThumbnail(player.headshot.imgUrl);
  embed.setAuthor(`${flagEmoji} ${formatPrettyName(player)} - ${player.rating} ${player.position} `, player.club.imageUrls.dark.small);
  let attrsString = player.attributes.map((a) => {
    return `**${a.name.split(".")[2]}**: ${a.value}`;
  }).join(" ");
  if (cardTypeName.length) {
    embed.setTitle(cardTypeName);
  }
  let keyStats = `**WR**: ${player.atkWorkRate.substr(0,1)}/${player.defWorkRate.substr(0,1)} **SM**: ${player.skillMoves}★ **WF**:${player.weakFoot}★`;
  let phyStats = `👣 ${player.foot.substr(0,1)} 📏 ${formatHeight(player.height)} ⚖️ ${formatWeight(player.weight)}`;
  embed.setDescription(`${attrsString}\n${keyStats}\n${phyStats}`);
  embed.addField("Nation", player.nation.abbrName, true);
  embed.addField("Club", `${player.club.name} (${player.league.abbrName})`, true);
  embed.setFooter(`goalbot v${version} | prices from FUTBIN | made w ❤️💡💪 by ajpiano`, "https://static-cdn.jtvnw.net/badges/v1/cce0dfdc-5160-4c9c-9c4b-b02dc4a684b2/1");
  return embed;
}

module.exports = formatBasePlayerEmbed;
