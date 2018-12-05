const _ = require("lodash");
const exclamations = require('exclamation');

// Apparently this is something Robin said during the 1960s Batman TV show. However, it's not something that should be flying into discord price messages for FUT players.
exclamations.all = _.without(exclamations.all, 'Holy Holocaust');
exclamations.random = () => exclamations.all[Math.floor(Math.random() * exclamations.all.length)];

module.exports = exclamations;
