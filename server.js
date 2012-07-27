/**
 * Module dependencies.
 */
/*var cluster = require('cluster');
var config = require('./config');
if (cluster.isMaster) {
  // fork workers
  var worker = cluster.fork();
} else {
  // run main program
  var app = require('./app.js');
  if (app && app.listen) {
    app.listen(config.port);
    console.log('worker is running');
    console.log('please visit web UI via http://127.0.0.1:%d', config.port);
  }
}
cluster.on('death', function (worker) {
  // if the worker died, fork a new worker
  console.log('worker ' + worker.pid + ' died. restart...');
  cluster.fork();
});
*/
var transfer = require('./transfer_db');
transfer.transf();
var app = require('./app.js');
var config = require('./config');
app.listen(config.port);
