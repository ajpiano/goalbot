const rp = require("request-promise");

module.exports = async function searchFutDB(term) {
  return rp(`https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${encodeURIComponent(term)}%22%7D`).then(JSON.parse);
}

