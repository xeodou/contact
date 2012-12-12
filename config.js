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
  'CONFIRM_PASS_ERR': 7,
  'OLD_PASS_ERR': 8
};
config.weibo = {
  'name' : '457493671@qq.com',
  'pass' : 'xeodou',
  'cookies' : 'USER_LAST_LOGIN_NAME=457493671%40qq.com;gsid_CTandWM=3_5affa1d9b616dd08a2216e2172d5e1555e'
}
config.logdir = './tmp/logs';
config.mongo = {};
config.mongo.url = '127.0.0.1:27017/contact';
config.mongo.collections = {
  'contacts': 'contacts',
  'users' : 'users',
  'message' : 'message'
};
config.debug = true;
config.appkey = '1898686613';
config.appsecret = 'a2d3f916a3df774e7193152cfd5e802a';
config.callback_url = 'http://127.0.0.1:2013/set/auth/success';
config.callback_cancel_url = 'http://127.0.0.1:2013/set';
module.exports = config;