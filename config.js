var config = {};
// for web
config.port = 2013;
config.sitename = '常联系';
config.version = '2012072501';
config.session_secret = 'I am a secret.';
config.session_timeout = 1000 * 60 * 60 * 24 * 14;
config.statCode = {
  'UNKNOWN': 0,
  'SUCCEED': 1,
  'DATABASE_ERR': 2,
  'UNAUTHORIZED': 3,
  'ILLEGAL_PARAMETER': 4,
  'DUPLICATE': 5,
  'REMOTE_CONN': 6,
};
config.logdir = './tmp/logs';
config.mongo = {};
config.mongo.url = '127.0.0.1:27017/contact';
config.mongo.collections = {
  'contacts': 'contacts',
};
config.debug = false;
module.exports = config;