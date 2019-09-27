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

function formatSubAttributes(attrKey, player) {
  const seenAttrs = {};
  const subAttrs = _.reduce(player.stats[attrKey], (c, attrObj, index) => {
    if (!seenAttrs[attrObj.id]) {
      c.push(`${attrObj.name}: ${attrObj.value}`);
      seenAttrs[attrObj.id] = true;
    }
    return c;
  }, []);
  return subAttrs.join("\n");
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

function calculateStatTotals(player) {
  return _.reduce(player.stats, (total, values, category) => {
    total.face += player.faceStats[category];
    total.ingame += _.reduce(values, (igTotal, attrObj, index) => {
      igTotal += attrObj.value;
      return igTotal;
    },0);
    return total;
  },{ face: 0, ingame: 0 });
}
 
function formatPlayerInfoEmbed(player) {
  let embed = generateBasePlayerEmbed(player, player.prices);
  let totals = calculateStatTotals(player);
  embed.addField("Total Face Stats", totals.face, true);
  embed.addField("Total In-Game Stats", totals.ingame,  true);
  _.forEach(player.faceStats, (value, attrKey) => {
    embed.addField(`${_.capitalize(attrKey.replace(/^gk/g,""))}: ${value}`, formatSubAttributes(attrKey, player), true);
  });
  embed.addField("Traits", formatTraits(player));
  //embed.addField("Specialities", formatSpecialities(player));
  return embed;
}

module.exports = class ReplyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      aliases: ['s'],
      group: 'fut',
      memberName: 'stats',
      description: 'Looks up detailed player card statistics from FUTBIN',
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
