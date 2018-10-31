const { Command } = require('discord.js-commando');
const rp = require("request-promise");
const _ = require("lodash");
const playersJson = require("../../players.json")
const eaPlayers = _.concat(playersJson.Players, playersJson.LegendsPlayers);
const playersById = _.keyBy(eaPlayers, "id");
const removeDiacritics = require('diacritics').remove;

const playersByLastName = eaPlayers.reduce((obj,p) => {
	if (p.l) {
		let lastName = removeDiacritics(p.l.toLowerCase());
		if ( !obj[lastName] ) {
			obj[lastName] = [];
		}
		obj[lastName].push(p);
	}
	return obj;
},{});

const playersByNickName = eaPlayers.reduce((obj,p) => {
	if (p.c) {
		let nickName = removeDiacritics(p.c.toLowerCase());
		if ( !obj[nickName] ) {
			obj[nickName] = [];
		}
		obj[nickName].push(p);
	}
	return obj;
},{});

const playersByFirstName = eaPlayers.reduce((obj,p) => {
	if (p.f) {
		let firstName = removeDiacritics(p.f.toLowerCase());
		if ( !obj[firstName] ) {
			obj[firstName] = [];
		}
		obj[firstName].push(p);
	}
	return obj;
},{});

const playersByPrettyName = eaPlayers.reduce((obj,p) => {
	let prettyName = removeDiacritics(formatPrettyName(p).toLowerCase());
	if ( !obj[prettyName] ) {
		obj[prettyName] = [];
	}
	obj[prettyName].push(p);
	return obj;
},{});


function lookupPlayerById(id) {
	return playersById[id];
}

function lookupPlayersByName(name) {
	let n = removeDiacritics(name.toLowerCase());
	let lastNameMatches = playersByLastName[n];
	let nickNameMatches = playersByNickName[n];
  let firstNameMatches = playersByFirstName[n];
	return _.compact(_.concat(lastNameMatches, nickNameMatches, firstNameMatches));
}

function lookupPlayersByFuzzyName(name) {
	let fuzzyRegexp = new RegExp(removeDiacritics(name.toLowerCase()));
	let fuzzyMatches = _.pickBy(playersByPrettyName, (player,prettyName) => {
		return fuzzyRegexp.test(prettyName);
	});
	let fuzzyPlayers = _.flatten(_.map(fuzzyMatches, (playerSet,prettyName) => {
		return playerSet;
	}));
	return fuzzyPlayers;
}

function formatPrettyName(player) {
	return `${player.f} ${player.l} ${player.c ? '(' + player.c + ')' : '' }`;
}

function getFutbinPrices(players) {
	let ids = players.length ? _.map(players,"id").join(",") : players.id;
        let reqUrl = `https://www.futbin.com/19/playerPrices?player=&all_versions=${ids}`;
        console.log(reqUrl);
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

function formatFutbinPrices(prices) {
	let [xboxPrice, psPrice, pcPrice] = [prices.xbox.LCPrice, prices.ps.LCPrice, prices.pc.LCPrice];
	let [xboxMin, psMin, pcMin] = [prices.xbox.MinPrice, prices.ps.MinPrice, prices.pc.MinPrice];
	let [xboxMax, psMax, pcMax] = [prices.xbox.MaxPrice, prices.ps.MaxPrice, prices.pc.MaxPrice];
	let embed = {
		description: "Latest FUTBIN price",
		fields: [{
			name: "XBOX",
			value: `BIN: ${xboxPrice}\nRange: ${xboxMin} -> ${xboxMax}`,
			inline: true
		},{
			name: "PS",
			value: `BIN: ${psPrice}\nRange: ${psMin} -> ${psMax}`,
			inline: true
		},{
			name: "PC",
			value: `BIN: ${pcPrice}\nRange: ${pcMin} -> ${pcMax}`,
			inline: true
		}]
	};
	return embed;
}

function outputMultiplePlayers(msg, name, players) {
	getFutbinPrices(players).then((futbinPrices) => {
		let keys = _.keys(futbinPrices);

		if (keys.length >= 5) {
			msg.say(`"${name}" matched ${keys.length} players. Displaying the first 4 only:`);
			let truncatedPrices = {};
			_.forEach(keys.slice(0,4), (k) => {
				truncatedPrices[k] = futbinPrices[k];
			});
			futbinPrices = truncatedPrices;
		}

		_.forEach(futbinPrices,(playerPrices,id) => {
			let prettyName = formatPrettyName(lookupPlayerById(id)); 
			let embed = formatFutbinPrices(playerPrices.prices);
			msg.say(prettyName, {embed});
		});
	});

}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'players',
      group: 'fut',
      memberName: 'players',
      description: 'Looks up player info + price from FUTBIN',
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

  run(msg, { term }) {
    let id = term; 
    let name, player, players;

    // First try an ID lookup
    if (_.isFinite(+id)) {
      player = lookupPlayerById(+id);

      if (player) {
        let prettyName = formatPrettyName(player);
        let initialResponse = msg.say(prettyName);
        getFutbinPrices(player).then((futbinPrices) => {
          let prices = futbinPrices[player.id].prices;
          let embed = formatFutbinPrices(prices);
          initialResponse.then((newMsg) => { 
            newMsg.edit(prettyName, {embed});
          });
        });
      }
      return;
    } 

    // Next, try looking up on exact name match for First Name, Last Name, or NickName
    name = id;
    players = lookupPlayersByName(name);
    if (players.length) {
      return outputMultiplePlayers(msg, name, players);
    }

    // Next, try a fuzzy search on the entire prettyprinted name
    players = lookupPlayersByFuzzyName(name);
    if (players.length) {
      return outputMultiplePlayers(msg, name, players);
    }

    // Otherwise, give up
    return msg.say(`Sorry ${msg.author}, I couldn't find any FUT players that match "${name}"`);
  }
};
