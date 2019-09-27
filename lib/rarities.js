const rarities = require('./futitemraritytunables').rarities;
const webappLocalization = require('./webapp-localization');

const namedRarities = rarities.map((r) => {
  r.name = webappLocalization[`item.raretype${r.id}`];
  return r;
});

module.exports = namedRarities;
