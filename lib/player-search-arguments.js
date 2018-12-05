const _ = require("lodash");

module.exports = [
  {
    key: 'name',
    prompt: 'Which player(s) do you want to search for?',
    type: 'string',
    validate: (val, msg, arg) => {
      let parsed = arg.parser(val, msg, arg);
      return _.isString(parsed);
    },
    parse: (val, msg, arg) => {
      let terms = msg.argString.split(' ');
      let searchName = terms.reduce((term, word) => {
        if (word.length && !_.isFinite(+word)) {
          term.push(word.replace(/"|'/g,''));
        }
        return term;
      },[]).join(' ');
      return searchName;
    }
  }, {
    key: 'rating',
    prompt: 'Which OVR rating should we search for?',
    type: 'integer',
    default: '',
    validate: (val, msg, arg) => {
      let parsed = arg.parser(val, msg, arg);
      return arg.isEmpty ? true : _.isFinite(parsed);
    },
    parse: (val, msg, arg) => {
      let rating = +msg.argString.split(' ').pop();
      return rating;
    }
  }
];
