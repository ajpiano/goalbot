const rp = require("request-promise");
const castFields = ["rating", "id", "rare_type", "rare"];


module.exports = async function searchFutbinAutocomplete(term) {
  let data = await rp(`https://www.futbin.com/search?year=20&extra=1&term=${encodeURIComponent(term)}&_=${+new Date}`);
  data = JSON.parse(data);
  if (data.error) {
    return data;
  }
  data = data.map((p, i) => {
    castFields.forEach((f) => {
      p[f] = +p[f];
    });
    return p;
  });
  return data;
}

