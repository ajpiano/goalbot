const rp = require("request-promise");
const _ = require("lodash");
const cheerio = require("cheerio");

const faceStatKeys = ["ppace", "pshooting", "ppassing", "pdribbling", "pdefending", "pphysical"];
const gkFaceStatKeys = ["gkdiving", "gkhandling", "gkkicking", "gkreflexes", "speed", "gkpositioning"];

module.exports = async function getFutbinPage(fbPlayer) {

  let id = fbPlayer.id;
  let reqUrl = `https://www.futbin.com/20/player/${id}`;
  return rp(reqUrl).then(function(resp) {
    let $ = cheerio.load(resp);
    let pageInfo = $("#page-info").data();
    let playerStats = JSON.parse($("#player_stats_json").first().text().trim())[0];
    let playerFaceStats = [];
    if (fbPlayer.position === "GK") {
      playerFaceStats = _.reduce(gkFaceStatKeys, (c, k, i) => {
        c[k] = +$(`#main-${k}-val-0 .stat_val`).text();
        return c;
      }, {});
    } else {
      playerFaceStats = _.reduce(_.pick(JSON.parse($("#player_stats_json").eq(1).text().trim()), faceStatKeys), (c, v, p) => {
        c[p.substr(1)] = v;
        return c;
      },{});
    }
    let playerTraits = $("#traits_content div.its_tr").map((i, traitRow) => $(traitRow).text().trim()).get();
    let playerInfo = $("#info_content table tr").get().reduce((info, row, index) => {
      let propName = $(row).find("th").text().trim().toLowerCase().replace(/\s|\./g,"");
      let propValue = $(row).find("td").text().trim();
      if (propName !== "name") {
        info[propName] = propValue;
      }
      return info;
    },{});
    let player = {...pageInfo, ...fbPlayer, ...playerInfo,
      faceStats: playerFaceStats,
      stats: playerStats,
      traits: playerTraits.length ? playerTraits : false,
      quality: fbPlayer.rating <= 64 ? "Bronze" : (fbPlayer.rating <= 74 ? "Silver" : "Gold")
    };
    return player;
  });
}

