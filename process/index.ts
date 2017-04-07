import { exec } from 'child_process'
import * as multer from 'multer'
import * as mysql from 'mysql'

import { ExerciceExecuteCallback } from './entities/Exercice'
import APIResponse from './entities/shared/APIResponse'
import { ImageUtil } from './entities/ImageCompilable'
import model, { User, Exercice } from './app/Model'
import config from './app/Configuration'
import app from './app/Application'
import Error from './app/Error'

app.match('get', '/', (req, res) => {
    model(c => {
        c.query('SELECT * FROM user', (e, r) => {
            if(e) throw e

            console.log(User.fromDB(r[0]));
            c.release();
        })
    })
})

namespace utils
{
    export function findExerciceById(db : mysql.IConnection, unitId : string | number, callback : (error : Error, exercice? : Exercice) => void)
    {
        db.query('SELECT * FROM exercice WHERE id = ? LIMIT 1', [ unitId ], (e, r) =>
        {
            if(e)
            {
                callback(new Error(e, 'system.database', "Unkown error while requesting the database."))
                return;
            }

            if(!r || !r.length)
            {
                callback(new Error(undefined, 'user.database', "Can't find the unit of uid '" + unitId + "'."))
                return;
            }

            var exercice : Exercice = Exercice.fromDB(r[0]);
            callback(null, exercice);
        })
    }

    export function compileFromDB(unitId : string | number, filePath : string, callback : (error : Error) => void)
    {
        model((db, rs) =>
        {
            callback = rs(callback) as ExerciceExecuteCallback

            findExerciceById(db, unitId, (e, exercice) =>
            {
                if(e)
                { callback(e); return; }

                exercice.compile({
                    zipFilePath: filePath,
                    deleteFileOnExit: true
                }, (e, r) => {
                    if(e)
                    { callback(e); return; }

                    ImageUtil.delete(exercice.docker_key, e => {
                        if(e)
                        { callback(e); return; }

                        db.query('UPDATE exercice SET docker_key = ?, install_log = ?, config = ? WHERE id = ?', [ r.dockerKey, r.log, JSON.stringify(r.configuration), exercice.id ], (e, r) =>
                        {
                            if(e)
                                callback(new Error(e))
                            else
                                callback(null);
                        })
                    })
                })
            })
        })
    }

    export function executeFromDB(unitId : string | number, body : any, callback : ExerciceExecuteCallback)
    {
        model((db, rs) =>
        {
            callback = rs(callback) as ExerciceExecuteCallback

            findExerciceById(db, unitId, (e, exercice) =>
            {
                if(e)
                {
                    callback(e)
                    return;
                }

                if(!exercice.docker_key)
                {
                    callback(new Error(undefined, 'user.compilationMissing', "No compilation done for unit of uid '" + unitId + "'."))
                    return;
                }

                /*
                var timeout = r[0].timeout;
                if(timeout.constructor === String)
                    timeout = Number(timeout);
                timeout = Math.abs(timeout);
                if(timeout > config.execution.timeout_max_sec)
                    timeout = config.execution.timeout_max_sec;
                */
                //var timeout = config.execution.timeout_max_sec;
                var timeout = 5;

                exercice.execute({
                    timeout: timeout,
                    stdin: body
                }, callback);
            })
        })
    }
}

let upload = multer({
    dest : '/tmp/'
})
app.post('/exo/:id/compile', upload.single('file'), (req, res) => {
    app.byType(req, {
        type: 'json',
        action: () =>
            utils.compileFromDB(req.params.id, (req as any).file.path, e => res.json(new APIResponse.APIExoCompile(e)))
    }, {
        type: 'html',
        action: () => app.toRootPage(res)
    })
});

app.post('/exo/:id/invoke', (req, res) =>
{
    app.byType(req, {
        type: 'json',
        action: () =>
            utils.executeFromDB(req.params.id, req.body, (e, r) => res.json(new APIResponse.APIExoExecute(e, r)))
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
                    var error : Error = null;
                    var result = null;

                    if(e)
                        error = new Error(e)
                    else if(!r || r.length === 0)
                        error = new Error(null, 'user.missing', "Can't find the element of uid : " + req.params.id)
                    else
                        result = r[0]
                    
                    res.json(new APIResponse.APIExoInformation(error, result))
                    db.release();
                })
            )
    }, {
        type: 'html',
        action: () => app.toRootPage(res)
    })
});

app.run(config.port, () =>
    console.log(' [o] Started on port ' + config.port + '.')
)
