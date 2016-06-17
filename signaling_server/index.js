/**
 * Created by witwolf on 1/4/16.
 */



var server = require('./server')
var conf = require('./config/conf')

server.start(conf.listen_port || 9999)