const { Command, FriendlyError } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const rp = require("request-promise");
const _ = require("lodash");
const flag = require('emoji-flag');
const countries = require('country-list/data');
const exclamations = require('exclamation');
const rarities = require('../../lib/futitemraritytunables').rarities;
const version = require('../../package').version;

countries.push({code: 'NL', name: 'Holland'});

async function searchFutDB(term) {
  return rp(`https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${encodeURIComponent(term)}%22%7D`).then((resp) => {
    let apiResp = JSON.parse(resp)
    return apiResp;
  });
}
async function getFutbinPrices(players) {
	let ids = players.length ? _.map(players,"id").join(",") : players.id;
        let reqUrl = `https://www.futbin.com/19/playerPrices?player=&all_versions=${ids}`;
	return rp(reqUrl).then(function(resp) {
		let playerPrices = JSON.parse(resp);
		playerPrices = _.reduce(playerPrices,(obj, p, id) => {
			if (id > 0) {
				obj[id] = p;
			}
			return obj;
		},{});
		return playerPrices;
	});
}

function formatPrettyName(player) {
	return `${player.firstName} ${player.lastName} ${player.commonName ? '(' + player.commonName + ')' : '' }`;
}

function formatPlayerEmbed(player, prices) {
	let embed = new RichEmbed();
	let [xboxPrice, psPrice, pcPrice] = [prices.xbox.LCPrice, prices.ps.LCPrice, prices.pc.LCPrice];
	let [xboxMin, psMin, pcMin] = [prices.xbox.MinPrice, prices.ps.MinPrice, prices.pc.MinPrice];
	let [xboxMax, psMax, pcMax] = [prices.xbox.MaxPrice, prices.ps.MaxPrice, prices.pc.MaxPrice];
	let [xboxUpdated, psUpdated, pcUpdated] = [prices.xbox.updated, prices.ps.updated, prices.pc.updated];
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
	embed.setDescription(`${attrsString}\n${keyStats}`);
	embed.addField("Nation", player.nation.abbrName, true);
	embed.addField("Club", `${player.club.name} (${player.league.abbrName})`, true);
	embed.addField("XBOX", `BIN: ${xboxPrice}\nUpdated: ${xboxUpdated}\nRange: ${xboxMin} -> ${xboxMax}`, true);
	embed.addField("PS", `BIN: ${psPrice}\nUpdated: ${psUpdated}\nRange: ${psMin} -> ${psMax}`, true);
	//embed.addField("PC", `BIN: ${pcPrice}\nUpdated: ${pcUpdated}\nRange: ${pcMin} -> ${pcMax}`, true);
        embed.setFooter(`goalbot v${version} | prices from FUTBIN | made w ❤️💡💪 by ajpiano`, "https://static-cdn.jtvnw.net/badges/v1/cce0dfdc-5160-4c9c-9c4b-b02dc4a684b2/1");
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
        let embed = formatPlayerEmbed(player, prices);
        msg.embed(embed);
      });

      return;
    }

    throw new FriendlyError(`We have reached a section of code that we shouldn't have, ${msg.author}, I'm not sure how, but I'm sorry.`);
  }
};
