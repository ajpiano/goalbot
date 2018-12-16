const _ = require("lodash");
const { Command, FriendlyError } = require('discord.js-commando');

const findMatchingPlayers = require("../../api/find-matching-players");
const generateBasePlayerEmbed = require("../../formatters/base-player-embed");
const playerSearchArguments = require("../../lib/player-search-arguments");

const attrLookup = {
  "PAC": {
    name: "Pace",
    attributes: {
      "acceleration": "Acceleration",
      "sprintspeed": "Sprint Speed",
    }
  },
  "SHO": {
    name: "Shooting",
    attributes: {
      "positioning": "Positioning",
      "finishing": "Finishing",
      "shotpower": "Shot Power",
      "longshots": "Long Shots",
      "volleys": "Volleys",
      "penalties": "Penalties",
    }
  },
  "PAS": {
    name: "Passing",
    attributes: {
      "vision": "Vision",
      "crossing": "Crossing",
      "freekickaccuracy": "FK Accuracy",
      "shortpassing": "Short Passing",
      "longpassing": "Long Passing",
      "curve": "Curve",
    }
  },
  "DRI":{
    name: "Dribbling",
    attributes: {
      "agility": "Agility",
      "balance": "Balance",
      "reactions": "Reactions",
      "ballcontrol": "Ball Control",
      "dribbling": "Dribbling",
      "composure": "Composure",
    }
  },
  "DEF":{
    name: "Defending",
    attributes: {
      "interceptions": "Interceptions",
      "headingaccuracy": "Heading Accuracy",
      "marking": "Marking",
      "standingtackle": "Standing Tackle",
      "slidingtackle": "Sliding Tackle",
    }
  },
  "PHY":{
    name: "Physicality",
    attributes: {
      "jumping": "Jumping",
      "stamina": "Stamina",
      "strength": "Strength",
      "aggression": "Aggression",
    }
  },
  "DIV":{
    name: "Diving",
    attributes: {
      "gkdiving": "Diving",
    }
  },
  "HAN":{
    name: "Handling",
    attributes: {
      "gkhandling": "Handling",
    }
  },
  "KIC":{
    name: "Kicking",
    attributes: {
      "gkkicking": "Kicking",
    }
  },
  "REF":{
    name: "Reflexes",
    attributes: {
      "gkreflexes": "Reflexes",
    }
  },
  "SPD":{
    name: "Speed",
    attributes: {
      "acceleration": "Acceleration",
      "sprintspeed": "Sprint Speed",
    }
  },
  "POS":{
    name: "Positioning",
    attributes: {
      "gkpositioning": "Positioning",
    }
  },
  
};

const outfieldAttrs = [ 
  // { name: 'fut.attribute.PAC', value: "N/A", chemistryBonus: [ 0 ] },
  { name: 'fut.attribute.SHO', value: "N/A", chemistryBonus: [ 0 ] },
  { name: 'fut.attribute.PAS', value: "N/A", chemistryBonus: [ 0 ] },
  { name: 'fut.attribute.DRI', value: "N/A", chemistryBonus: [ 0 ] },
  { name: 'fut.attribute.DEF', value: "N/A", chemistryBonus: [ 0 ] },
  { name: 'fut.attribute.PHY', value: "N/A", chemistryBonus: [ 0 ] }
];

function formatSubAttributes(attrKey, player) {
  return _.map(attrLookup[attrKey].attributes, (displayName, keyName) => {
    return `${displayName}: ${player[keyName]}`;
  }).join("\n");
}

function formatTraits(player) {
  if (!player.traits) {
    player.traits = ["No traits"];
  }
  return _.map(player.traits, _.identity).join("\n");
}

function formatSpecialities(player) {
  if (!player.specialities) {
    player.specialities = ["No specialities"];
  }
  return _.map(player.specialities, _.identity).join("\n");
}

function calculateStatTotals(player, attrValues) {
  return _.reduce(attrValues, (total, value, attrKey) => {
    total.face += value;
    total.ingame += _.reduce(attrLookup[attrKey].attributes, (igTotal, displayName, keyName) => {
      igTotal += player[keyName];
      return igTotal;
    }, 0);
    return total;
  },{ face: 0, ingame: 0 });
}
 
function formatPlayerInfoEmbed(player) {
  let embed = generateBasePlayerEmbed(player, player.prices);
  if (player.position === "GK") {
    player.attributes = player.attributes.concat(outfieldAttrs);
  }
  let attrValues = player.attributes.reduce((table, attr,i) => {
    table[attr.name.split(".")[2]] = attr.value;
    return table;
  },{});
  let totals = calculateStatTotals(player, attrValues);
  //embed.addField("XBOX", `BIN: ${player.prices.xbox.LCPrice}`, true);
  //embed.addField("PS", `BIN: ${player.prices.ps.LCPrice}`, true);
  embed.addField("Total Face Stats", totals.face, true);
  embed.addField("Total In-Game Stats", totals.ingame,  true);
  _.forEach(attrValues, (value,attrKey) => {
    embed.addField(`${attrLookup[attrKey].name}: ${value}`, formatSubAttributes(attrKey, player), true);
  });
  embed.addField("Traits", formatTraits(player));
  embed.addField("Specialities", formatSpecialities(player));
  return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      aliases: ['s'],
      group: 'fut',
      memberName: 'stats',
      description: 'Looks up detailed player card statistics from EA FUT DB',
      examples: ['stats mertens', 'stats mertens 87', 's mertens', 's mertens 87'],
      args: playerSearchArguments
    });
  }

  async run(msg, { name, rating }) {
    let matchingPlayers = findMatchingPlayers(this.client, msg, name, rating);
    for await (const player of matchingPlayers) {
      let embed = formatPlayerInfoEmbed(player);
      msg.embed(embed);
    }
    return;
  }
};
