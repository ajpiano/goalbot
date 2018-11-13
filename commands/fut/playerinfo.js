const { Command, FriendlyError } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const rp = require("request-promise");
const _ = require("lodash");
const flag = require('emoji-flag');
const countries = require('country-list/data');
const rarities = require('../../lib/futitemraritytunables').rarities;

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
	embed.setDescription(attrsString);
	embed.addField("Nation", player.nation.abbrName, true);
	embed.addField("Club", `${player.club.name} (${player.league.abbrName})`, true);
	embed.addField("XBOX", `BIN: ${xboxPrice}\nRange: ${xboxMin} -> ${xboxMax}`, true);
	embed.addField("PS", `BIN: ${psPrice}\nRange: ${psMin} -> ${psMax}`, true);
	embed.addField("PC", `BIN: ${pcPrice}\nRange: ${pcMin} -> ${pcMax}`, true);
	return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'players',
      group: 'fut',
      memberName: 'players',
      description: 'Looks up player info from EA FUT DB + price from FUTBIN',
      examples: ['players mertens'],
      args: [
        {
          key: 'term',
          prompt: 'Which player(s) do you want to search for?',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { term }) {
    let id = term; 
    let name, player, players;

    if (_.isFinite(+id)) {
      throw new FriendlyError(`Sorry ${msg.author}, you can't search by numeric ID right now`);
    } 

    name = id;
    let dbResults = await searchFutDB(name);

    if (!dbResults.totalResults) {
      return msg.say(`Sorry ${msg.author}, no players found matched '${name}'`);
    } else {
      let futbinPrices = await getFutbinPrices(dbResults.items);

      let truncatedResults = dbResults.items.slice(0,4);
      msg.say(`Hooray ${msg.author}, ${dbResults.totalResults} players matched '${name}', here are the first ${truncatedResults.length}:`);
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
