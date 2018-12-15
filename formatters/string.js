const convert = require('convert-units');
 
function formatPrettyName(player) {
  return `${player.firstName} ${player.lastName}${player.commonName ? ' (' + player.commonName + ')' : '' }`;
}

function formatShortName(player) {
  return player.commonName || `${player.firstName} ${player.lastName}`;
}

function formatHeight(cm) {
  let feet = convert(cm).from('cm').to('ft');
  let roundFeet = Math.floor(feet);
  let inches = Math.round(convert(feet - roundFeet).from('ft').to('in'));
  return `${roundFeet}'${inches}'/${cm/100}m`;
}

function formatWeight(kg) {
  let pounds = Math.round(convert(kg).from('kg').to('lb'));
  return `${pounds}lb/${kg}kg`;
}

function formatPlatformPriceDetail(platformPrices, platformHistory) {
  return `${formatBins(platformPrices)}
    **Updated**: ${platformPrices.updated}
    **Range**: ${platformPrices.MinPrice} -> ${platformPrices.MaxPrice}
    **PRP**: ${platformPrices.PRP}%

    ${formatPriceHistory(platformHistory)}`;
}

function formatBins(platformPrices) {
  return `**5 Lowest BIN prices**
    - ${platformPrices.LCPrice}
    - ${platformPrices.LCPrice2}
    - ${platformPrices.LCPrice3}
    - ${platformPrices.LCPrice4}
    - ${platformPrices.LCPrice5}`;
}

function formatPriceHistory(history) {
	return `**Change since**
	1 hour ago: ${history["1h"].toFixed(2)}%
	3 hours ago: ${history["3h"].toFixed(2)}%
	6 hours ago: ${history["6h"].toFixed(2)}%
	12 hours ago: ${history["12h"].toFixed(2)}%
	24 hours ago: ${history["1d"].toFixed(2)}%
	2 days ago: ${history["2d"].toFixed(2)}%
	1 week ago: ${history["1w"].toFixed(2)}%
	2 weeks ago: ${history["2w"].toFixed(2)}%
	1 month ago: ${history["1m"].toFixed(2)}%
	2 months ago: ${history["2m"].toFixed(2)}%`;
}

module.exports = { 
  formatPrettyName,
  formatShortName,
  formatHeight,
  formatWeight,
  formatPlatformPriceDetail,
  formatBins,
  formatPriceHistory
};
