const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}
function formatFile(username, file){
  return {
    username,
    file,
    time: moment().format('h:mm a')
  };
}

module.exports = {
  formatMessage,
  formatFile
};
