var mysql = require('mysql'),
    config = require('./config.js');

var pool  = mysql.createPool(config.db);

module.exports = pool;
