import model, { User, Exercice } from './app/Model'
import config from './app/Configuration'
import app from './app/Application'

import * as multer from 'multer'

app.match('get', '/', (req, res) => {
    model(c => {
        c.query('SELECT * FROM user', (e, r) => {
            if(e) throw e

            console.log(User.fromDB(r[0]));
            c.release();
        })
    })
})

let upload = multer({
    dest : '/tmp/'
})
app.post('/exo/:id/compile', upload.single('file'), (req, res) => {
    app.byType(req, {
        type: 'json',
        action: () => {
            /*
            image.update(req.params.id, req.session.user, req.file.path, data => {
                res.json(data);
            });*/
        }
    }, {
        type: 'html',
        action: () => app.toRootPage(res)
    })
});

app.get('/exo/:id', (req, res) =>
{
    app.byType(req, {
        type: 'json',
        action: () =>
            model(db =>
                db.query('SELECT * FROM exercice WHERE id = ? LIMIT 1', [ req.params.id ], (e, r) =>
                {
                    if(e)
                        res.json({ success: false, error: e });
                    else if(!r || r.length === 0)
                        res.json({ success: false, error: "Can't find the element of uid : " + req.params.id });
                    else
                        res.json({
                            success: true,
                            exercice: r[0]
                        });
                    
                    db.release();
                })
            )
    }, {
        type: 'html',
        action: () => app.toRootPage(res)
    })
});

/*
app.match('get', '/', (req, res) => {
    res.send('<html><head></head><body>hello!</body></html>');
})
app.get('/:name', (req, res) => {
    res.send('<html><head></head><body>hello ' + req.params.name + '!</body></html>');
})

*/

app.run(config.port, () => {
    console.log(' [o] Started on port ' + config.port + '.');
})
