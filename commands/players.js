const rp = require("request-promise");
const _ = require("lodash");
const eaPlayers = require("../players.json").Players;
const playersById = _.keyBy(eaPlayers, "id");

const playersByLastName = eaPlayers.reduce((obj,p) => {
	if (p.l) {
		let lastName = p.l.toLowerCase();
		if ( !obj[lastName] ) {
			obj[lastName] = [];
		}
		obj[lastName].push(p);
	}
	return obj;
},{});

const playersByNickName = eaPlayers.reduce((obj,p) => {
	if (p.c) {
		let nickName = p.c.toLowerCase();
		if ( !obj[nickName] ) {
			obj[nickName] = [];
		}
		obj[nickName].push(p);
	}
	return obj;
},{});

const playersByFirstName = eaPlayers.reduce((obj,p) => {
	if (p.f) {
		let firstName = p.f.toLowerCase();
		if ( !obj[firstName] ) {
			obj[firstName] = [];
		}
		obj[firstName].push(p);
	}
	return obj;
},{});


function lookupPlayerById(id) {
	return playersById[id];
}

function lookupPlayersByName(name) {
	let n = name.toLowerCase();
	let lastNameMatches = playersByLastName[n];
	let nickNameMatches = playersByNickName[n];
	let firstNameMatches = playersByFirstName[n];
	return _.compact(_.concat(playersByLastName[n], playersByNickName[n], playersByFirstName[n]));
}

function formatPrettyName(player) {
	return `${player.f} ${player.l} ${player.c ? '(' + player.c + ')' : '' }`;
}

function getFutbinPrices(players) {
	let ids = players.length ? _.map(players,"id").join(",") : players.id;
	return rp("https://www.futbin.com/18/playerPrices?player=&all_versions=" + ids).then(function(resp) {
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

module.exports = {
	main: function(bot, msg) {
		let commands = msg.content.trim().split(" ");
		let [id] = commands;
		let name, player;

		// First try an ID lookup
		if (_.isFinite(+id)) {
			player = lookupPlayerById(+id);

			if (player) {
				let prettyName = formatPrettyName(player);
				let initialResponse = msg.channel.send(prettyName);
				return getFutbinPrices(player).then((futbinPrices) => {
					let prices = futbinPrices[player.id].prices;
					let embed = formatFutbinPrices(prices);
					initialResponse.then((newMsg) => { 
						newMsg.edit(prettyName, {embed});
					});
				});
			}
		} 
		name = id;
		players = lookupPlayersByName(name);

		if (players) {
			getFutbinPrices(players).then((futbinPrices) => {
				_.forEach(futbinPrices,(playerPrices,id) => {
					let prettyName = formatPrettyName(lookupPlayerById(id)); 
					let embed = formatFutbinPrices(playerPrices.prices);
					msg.channel.send(prettyName, {embed});
				});
			})
		} else {
			msg.channel.send(`Sorry, not sure what that means just yet, ${msg.author}`);
		}
	},
	help: 'Lookup player info'
};
