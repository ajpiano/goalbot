const rp = require("request-promise");
const _ = require("lodash");
const players = require("../players.json").Players;
const playersById = _.keyBy(players, "id");

const playersByLastName = players.reduce((obj,p) => {
	if (p.l) {
		if ( !obj[p.l] ) {
			obj[p.l] = [];
		}
		obj[p.l].push(p);
	}
	return obj;
},{});

function lookupPlayerById(id) {
	return playersById[id];
}

function formatPrettyName(player) {
	return `${player.f} ${player.l} ${player.c ? '(' + player.c + ')' : '' }`;
}

function getFutbinPrices(players) {
	let ids = players.length ? _.pluck(players,"id").join(",") : players.id;
	return rp("https://www.futbin.com/18/playerPrices?player=&all_versions=" + ids).then(function(resp) {
		return JSON.parse(resp);
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
		let player;

		if (_.isFinite(+id)) {
			player = lookupPlayerById(+id);
		}

		if (player) {
			let prettyName = formatPrettyName(player);
			let initialResponse = msg.channel.send(prettyName);
			getFutbinPrices(player).then((futbinPrices) => {
				let prices = futbinPrices[player.id].prices;
				let embed = formatFutbinPrices(prices);
				initialResponse.then((newMsg) => { 
					newMsg.edit(prettyName, {embed});
				});
			});

		} else {
			msg.channel.send(`Sorry, not sure what that means just yet, ${msg.author}`);
		}
	},
	help: 'Lookup player info'
};
