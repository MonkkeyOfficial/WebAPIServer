var exec = require('child_process').exec,
    errorBuilder = require('../error.js'),
    image = require('../system/image.js'),
    db = require('../db.js'),
    config = require('../config.js');

module.exports = {
    init: app => {
        app.get('/', (req, res) => {
            app.toRootPage(res);
        });

        app.post('/exo/:id/invoke', (req, res) => {
            if(req.accepts(['json', 'html']) === 'html')
            {
                app.toRootPage(res);
                return;
            }

            image.execute(req.params.id, req.body, data => {
                res.json(data);
            });
        })
    }
}