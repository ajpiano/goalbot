const { RichEmbed } = require('discord.js');
const _ = require("lodash");
const moment = require("moment");
const flag = require('emoji-flag');
const countries = require('country-list/data');

const version = require('../package').version;
const rarities = require('../lib/rarities');
const { formatPrettyName, formatHeight, formatWeight } = require("./string");

countries.push({code: 'NL', name: 'Holland'});

function formatBasePlayerEmbed(player, prices) {
  let embed = new RichEmbed();
  let nationInfo = _.find(countries, {name: player.nation});
  let flagEmoji = "";
  if (nationInfo) {
    flagEmoji = flag(nationInfo.code) + " ";
  }
  let cardTypeInfo = _.find(rarities, {id: player.rare_type});
  let cardTypeName = "";
  if (cardTypeInfo) {
    cardTypeName = _.startCase(_.camelCase(`${cardTypeInfo.name} ${player.quality}`));
    embed.setColor(_.last(cardTypeInfo.colors).toString(16));
  }
  embed.setThumbnail(player.image);
  embed.setAuthor(`${flagEmoji} ${player.full_name} - ${player.rating} ${player.position} `, player.club_image);
  let attrsString = _.map(player.faceStats, (value, category) => {
    return `**${category.replace(/^gk/g, "").substr(0,3).toUpperCase()}**: ${value}`;
  }).join(" ");
  if (cardTypeName.length) {
    embed.setTitle(cardTypeName);
  }
  let keyStats = `**WR**: ${player.attwr.substr(0,1)}/${player.defwr.substr(0,1)} **SM**: ${player.skills}★ **WF**:${player.weakfoot}★`;
  let phyStats = `👣 ${player.foot.substr(0,1)} 📏 ${player.height} ⚖️ ${formatWeight(player.weight)}`;
  let description = `${attrsString}\n${keyStats}\n${phyStats}`;
  if (player.age) {
    description += `\n🎂 ${player.age}`;
  }
  embed.setDescription(description);
  embed.addField("Nation", player.nation, true);
  embed.addField("Club", `${player.club} (${player.league})`, true);
  embed.setFooter(`goalbot v${version} | prices from FUTBIN | made w ❤️💡💪 by ajpiano`, "https://static-cdn.jtvnw.net/badges/v1/cce0dfdc-5160-4c9c-9c4b-b02dc4a684b2/1");
  return embed;
}

module.exports = formatBasePlayerEmbed;
