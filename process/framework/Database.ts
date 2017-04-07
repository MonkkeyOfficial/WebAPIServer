import * as mysql from 'mysql';

import config from './Configuration';

if(!config.db)
    console.error(' [!] \'db\' property not defined in configuration file.');

var db = mysql.createPool(config.db)

export default function(callback : (connection : mysql.IConnection, wrapper? : (fn : Function) => Function) => void)
{
    db.getConnection(function(e, connection)
    {
        if(e)
            throw e;
        
        callback(connection, (fn) : Function => (...args : any[]) => {
            fn.apply(this, args);
            connection.release();
        })
    });
}
