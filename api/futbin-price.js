const rp = require("request-promise");
const _ = require("lodash");

module.exports = async function getFutbinPrices(players) {
  let ids = (players.length ? _.map(players,"playerResource").join(",") : players.playerResource.toString()).split(",");
  let firstId = ids[0];
  let remainingIds = ids.slice(1);
  let reqUrl = `https://www.futbin.com/20/playerPrices?player=${firstId}=&rids=${remainingIds}&_=${+new Date}`;
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

