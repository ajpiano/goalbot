const querystring = require("querystring");
const rp = require("request-promise");
const _ = require("lodash");

async function getFutbinPriceHistory(player, currentPrices) {
	let params = {
		"year": 20,
		"type": "today",
		"player": player.playerResource,
		"_": +new Date()
	};

	let todaySeries = await rp(`https://www.futbin.com/20/playerGraph?${querystring.stringify(params)}`).then(JSON.parse);

	params.type = "yesterday";
	let yesterdaySeries = await rp(`https://www.futbin.com/20/playerGraph?${querystring.stringify(params)}`).then(JSON.parse);

	params.type = "da_yesterday";
	let yPlusOneSeries = await rp(`https://www.futbin.com/20/playerGraph?${querystring.stringify(params)}`).then(JSON.parse);

	params.type="daily_graph";
	let dailySeries = await rp(`https://www.futbin.com/20/playerGraph?${querystring.stringify(params)}`).then(JSON.parse);

	let hourlySeries = {
		xbox: _.concat(yPlusOneSeries.xbox, yesterdaySeries.xbox, todaySeries.xbox),
		ps: _.concat(yPlusOneSeries.ps, yesterdaySeries.ps, todaySeries.ps),
		pc: _.concat(yPlusOneSeries.pc, yesterdaySeries.pc, todaySeries.pc)
	};

	let historyTemplate = {
		"1h": 0,
		"3h": 0,
		"6h": 0,
		"12h": 0,
		"1d": 0,
		"2d": 0,
		"4d": 0,
		"1w": 0,
		"2w": 0,
		"1m": 0,
		"2m": 0,
		"allTime": 0
	};
	let histories = _.reduce(hourlySeries, (p, periods, platform) => {
		let periodCount = periods.length-1;
		let dailyPeriodsCount = dailySeries[platform].length-1;
		let currentValue = _.isString(currentPrices[platform].LCPrice) ? parseFloat(currentPrices[platform].LCPrice.replace(/,/g,'')) : currentPrices[platform].LCPrice;
		p[platform] = _.reduce(historyTemplate, (c, value, label) => {
			let historicalPeriod;
			switch (label) {
				case "1h":
					historicalPeriod = periods[periodCount-1];
					break;
				case "3h":
					historicalPeriod = periods[periodCount-3];
					break;
				case "6h":
					historicalPeriod = periods[periodCount-6];
					break;
				case "12h":
					historicalPeriod = periods[periodCount-12];
					break;
				case "1d":
					historicalPeriod = dailySeries[platform][dailyPeriodsCount-1];
					break;
				case "2d":
					historicalPeriod = dailySeries[platform][dailyPeriodsCount-2];
					break;
				case "4d":
					historicalPeriod = dailySeries[platform][dailyPeriodsCount-4];
					break;
				case "1w":
					historicalPeriod = dailySeries[platform][dailyPeriodsCount-7];
					break;
				case "2w":
					historicalPeriod = dailySeries[platform][dailyPeriodsCount-14];
					break;
				case "1m":
					historicalPeriod = dailySeries[platform][dailyPeriodsCount-30];
					break;
				case "2m":
					historicalPeriod = dailySeries[platform][dailyPeriodsCount-60];
					break;
				case "allTime":
					historicalPeriod = dailySeries[platform][0];
					break;
			}
			if (historicalPeriod && historicalPeriod[1] !== 0) {
				c[label] = ((currentValue - historicalPeriod[1]) / historicalPeriod[1]) * 100;
			} else {
				c[label] = 0;
			}
			return c;
		}, {});
		return p;
	}, {});
	return histories; 
}

module.exports = getFutbinPriceHistory;
