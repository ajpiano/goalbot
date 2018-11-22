const rp = require("request-promise");
const _ = require("lodash");

module.exports = async function getFutbinPrices(players) {
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

