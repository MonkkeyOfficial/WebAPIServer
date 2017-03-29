var bodyParser = require('body-parser'),
    exec = require('child_process').exec,
    db = require('../db.js');

module.exports = {
    init: app => {
        app.get('/exo/:id', (req, res) => {
            if(req.accepts(['json', 'html']) === 'html')
            {
                app.toRootPage(res);
                return;
            }

            var mng = (callback) => (e, r) => {
                if(e)
                    res.json({ success: false, error: e });
                else if(!r || r.length === 0)
                    res.json({ success: false, error: "Can't find the element of uid : " + req.params.id });
                else
                    callback(r[0]);
            }

            db.query('SELECT * FROM exercice WHERE uid = ? LIMIT 1', [ req.params.id ], mng(exercice => {
                db.query('SELECT * FROM dockerimage WHERE id = ? LIMIT 1', [ exercice.image_id ], mng(image => {
                    if(image.config)
                    {
                        try
                        {
                            image.config = JSON.parse(image.config);
                        }
                        catch(ex)
                        {
                            image.configError = ex;
                        }
                    }

                    res.json({
                        exercice: exercice,
                        image: image
                    });
                }))
            }))
        });
    }
}