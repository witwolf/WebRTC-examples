/**
 * Created by witwolf on 1/5/16.
 */


var conf = require('./config/conf')

var server = require('./server');
server.start(conf.listen_port || 8080);
