var db = require('../db.js'),
    crypto = require('crypto'),
    config = require('../config.js'),
    errorBuilder = require('../error.js');

function getPublicUser(user)
{
    return {
        username: user.name
    }
}

module.exports = {
    init: app => {
        app.get('/user', (req, res) =>
        {
            if(!req.session || !req.session.user)
            {
                res.json({
                    connected: false
                });
            }
            else
            {
                res.json({
                    connected: true,
                    user: getPublicUser(req.session.user),
                    session: req.sessionID
                });
            }
        })
        
        app.get('/user/disconnect', (req, res) =>
        {
            req.session.user = null;
            res.json({
                connected: false
            });
        })
        
        app.post('/user/create', (req, res) =>
        {
            if(!req.body.username || !req.body.password)
            {
                res.json({
                    success: false,
                    error: 'user.missing'
                });
                return;
            }

            var username = req.body.username;
            var password = req.body.password;
            var email = req.body.email ? req.body.email : null;

            db.query('SELECT * FROM user WHERE name = ? LIMIT 1', [ username ], (e,r) => {
                if(e)
                {
                    res.json({
                        success: false,
                        error: 'system.database'
                    });
                    return;
                }

                if(r.length > 0)
                {
                    res.json({
                        success: false,
                        error: 'user.exists'
                    });
                    return;
                }

                crypto.pbkdf2(
                    password,
                    config.user.password.salt,
                    config.user.password.iterations,
                    config.user.password.keylen,
                    config.user.password.digest, (e,k) =>
                {
                    if(e)
                    {
                        res.json({
                            success: false,
                            error: 'system.crypto'
                        });
                        return;
                    }
                    password = k.toString('hex');

                    db.query('INSERT INTO user (name, password_hash, email) VALUES (?, ?, ?)', [ username, password, email ], (e,r) => {
                        if(e)
                        {
                            res.json({
                                success: false,
                                error: 'user'
                            });
                            return;
                        }
                        if(!r || r.insertId === undefined || r.insertId === null)
                        {
                            res.json({
                                success: false,
                                error: 'system.database'
                            });
                            return;
                        }

                        db.query('SELECT * FROM user WHERE id = ? LIMIT 1', [ r.insertId ], (e,r) => {
                            if(e)
                            {
                                res.json({
                                    success: false,
                                    error: 'system.database'
                                });
                                return;
                            }
                            if(!r || r.length < 1)
                            {
                                res.json({
                                    success: false,
                                    error: 'system.database'
                                });
                                return;
                            }

                            var user = r[0];
                            req.session.user = user;

                            res.json({
                                success: true,
                                connected: true,
                                user: getPublicUser(user),
                                session: req.sessionID
                            });
                        })
                    });
                });
            });
        });

        app.post('/user/connect', (req, res) =>
        {
            crypto.pbkdf2(
                req.body.password,
                config.user.password.salt,
                config.user.password.iterations,
                config.user.password.keylen,
                config.user.password.digest, (e,k) =>
            {
                if(e)
                {
                    return;
                }

                var password = k.toString('hex');
                var username = req.body.username;

                db.query('SELECT * FROM user WHERE name = ? AND password_hash = ? LIMIT 1', [ username, password ], (e,r) => {
                    var result = {
                        connected: !e && r && r.length && r.length === 1
                    };

                    if(!result.connected)
                        result.error = !e ? 'credential' : 'database';
                    else
                    {
                        var user = r[0];
                        result.user = getPublicUser(user);
                        req.session.user = user;
                        result.session = req.sessionID;
                    }

                    res.json(result);
                })
            });
        });
    }
}