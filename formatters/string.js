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

module.exports = { formatPrettyName, formatShortName, formatHeight, formatWeight };
