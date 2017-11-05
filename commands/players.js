const request = require("request");
const players = require("../players.json").Players;
const playersById = players.reduce((obj,p)=> { 
  if (p.id) {
    obj[p.id] = p;
  } else {
	  console.log(p);
  }
  return obj;
},{});
module.exports = {
	main: function(bot, msg) {
		let id = msg.content.trim();
		let player = playersById[id];
		if (player) {
			let prettyName =  `${player.f} ${player.l} ${player.c ? '(' + player.c + ')' : '' }`
			let initialResponse = msg.channel.send(prettyName);
			request("https://www.futbin.com/18/playerPrices?player=&all_versions=" + player.id, (error, response, body) => {
				let prices = JSON.parse(body);
				prices = prices[player.id].prices
				let xboxPrice, psPrice, pcPrice;
				[xboxPrice, psPrice, pcPrice] = [prices.xbox.LCPrice, prices.ps.LCPrice, prices.pc.LCPrice];
				let xboxMin, psMin, pcMin;
				[xboxMin, psMin, pcMin] = [prices.xbox.MinPrice, prices.ps.MinPrice, prices.pc.MinPrice];
				let xboxMax, psMax, pcMax;
				[xboxMax, psMax, pcMax] = [prices.xbox.MaxPrice, prices.ps.MaxPrice, prices.pc.MaxPrice];
				let embed = {
					color: bot.COLOR,
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
