/*!
 * KeyDiary - utils
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 rockdai <rockdai@qq.com>
 */

/**
 * Module dependencies.
 */

var crypto = require('crypto');

/**
 * md5 hash
 *
 * @param {String} s
 * @return {String} md5 hash string
 * @api public
 */
exports.md5 = function(s) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(s, Buffer.isBuffer(s) ? 'binary' : 'utf8');
  return md5sum.digest('hex');
};

/**
 * Send data in JSON format use res.end(), will auto set JSON header.
 *
 * @param {Object} res, http.Response instance
 * @param {Number} status, response status code
 * @param {Object} data
 * @api public
 */
exports.sendJSON = function(res, status, data) {
  try {
    var buf = new Buffer(JSON.stringify(data));
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', buf.length);
    res.end(buf);
  } catch (ex) {}
};

/**
 * Send redirect response.
 * 
 * @param  {Response} res, http.Response instance
 * @param  {String} url, redirect URL
 * @param  {Number|String} status, response status code, default is `302`
 * @api public
 */
exports.redirect = function(res, url, status) {
  try {
    res.statusCode = status || 302;
    res.setHeader('Location', url);
    res.end('Redirect to ' + url);
  } catch (ex) {}
};
/**
 * md5 hash
 *
 * @param {String} s
 * @return {String} date hash format('yyyy-MM-dd')
 * @api public
 */
//格式化时间yyyy-MM-dd
exports.formatDate = function(ms){
  var time = new Date(ms);
  var month = time.getMonth() + 1;
  if(month < 10){
    month = '0' + month;
  }
  return time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate();
};