import { exec } from 'child_process'
import * as fs from 'fs'

import config from '../app/Configuration'
import Error from '../app/Error'

export class ImageCompilableResult
{
    configuration : any
    dockerKey : string
    log : string

    constructor(config : any, dockerKey : string, log : string)
    {
        this.configuration = config
        this.dockerKey = dockerKey
        this.log = log
    }
}

export interface ImageCompilationCallback
{
    (error : Error, result? : ImageCompilableResult) : void
}

export interface ImageCompilationOptions
{
    zipFilePath : string
    deleteFileOnExit? : boolean
    deleteFileOnError? : boolean
    deleteFileOnSuccess? : boolean
}

export interface ImageExecuteCallback
{
    (error : Error, stdout? : string) : void
}

export interface ImageExecuteOptions
{
    dockerKey : string
    timeout : number | string
    stdin? : any
}

export class ImageUtil
{
    static execute(options : ImageExecuteOptions, callback : ImageExecuteCallback)
    {
        if(!options.dockerKey || !options.dockerKey.trim || options.dockerKey.trim().length === 0)
        {
            callback(new Error(null, 'compilation.missing', 'No compilation found.'))
            return;
        }

        var child = exec('docker run --rm -i ' + options.dockerKey + ' timeout ' + options.timeout + 's /bin/node /root/index.js', (e,stdout,se) => {
            if(e || se && se.trim().length > 0)
            {
                callback(new Error(e, 'undefined', undefined, se));
                return;
            }

            callback(null, stdout);
        });
        if(options.stdin === undefined || options.stdin === null)
            child.stdin.write('{}');
        else
            if(options.stdin.constructor === Object || options.stdin.constructor === Array)
                child.stdin.write(JSON.stringify(options.stdin));
            else
                child.stdin.write(options.stdin.toString());
    }
    
    static compile(options : ImageCompilationOptions, callback : ImageCompilationCallback)
    {
        var root = '/root';
        var destFileName = 'content.tgz';
        var destFilePath = root + '/' + destFileName;
        var destFolder = root + '/bin';

        function errorCallback(e, type?, message?, se?)
        {
            if(options.deleteFileOnExit || options.deleteFileOnError)
                fs.unlink(options.zipFilePath)

            if(callback)
                callback(new Error(e, type, message, se))
        }

        exec('docker run -idt ' + config.compilation.image_base + ' timeout ' + config.compilation.timeout_sec + 's bash', (e,id,se) => {
            if(e)
            {
                errorCallback(e, 'system.image', "Internal error : Couldn't start the base snapshot. Please, contact the server owner.", se);
                return;
            }
            id = id.trim();
            var mng = (callback, type?, message?) => function(e, o, se) {
                if(e || se)
                {
                    exec('docker rm -f ' + id);
                    errorCallback(e, type, message, se);
                }
                else
                    callback(o);
            };
            exec('docker cp "' + options.zipFilePath + '" ' + id + ':' + destFilePath, mng(() => {
            exec('docker exec ' + id + ' tar -zxvf ' + destFilePath + ' -C ' + destFolder, mng(() => {
            exec('docker exec ' + id + ' cat ' + destFolder + '/_d__config__', mng(configStr => {
                var configContent;
                try
                {
                    configContent = JSON.parse(configStr);
                }
                catch(ex)
                {
                    errorCallback(ex, "Can't parse the configuration file.");
                    return;
                }

                exec('docker exec ' + id + ' bash -c "cd ' + destFolder + ' && bash _d__install__"', mng(installLog => {
                exec('docker exec ' + id + ' mv ' + destFolder + '/_d__config__ ' + root + '/config.json', mng(() => {
                exec('docker commit ' + id, mng(newKey => {
                    exec('docker rm -f ' + id);
                    if(options.deleteFileOnExit || options.deleteFileOnSuccess)
                        fs.unlink(options.zipFilePath)

                    callback(null, new ImageCompilableResult(configContent, newKey.trim(), installLog));

                }, 'system.image', "Internal server error : Can't save the system. Please, contact the server owner."));
                }, 'user.archive', "Couldn't find the file _d__config__ at the root folder of the archive."));
                }, 'user.archive', "Couldn't execute the file _d__install__ at the root folder of the archive."));
            }, 'user.archive', "Couldn't find the file _d__config__ at the root folder of the archive."));
            }, 'user.archive', "Couldn't extract files from the uploaded archive."));
            }, 'system.image', "Internal server error : Couldn't copy the archive to the snapshot. Please contact the server owner."));
        });
    }

    static delete(dockerKey : string, callback : (error : any) => void)
    {
        exec('docker rmi -f ' + dockerKey, (e, so, se) =>
        {
            callback = callback ? callback : () => {};
            
            if(e)
                callback(e);
            else if(se && se.length > 0)
                callback(se);
            else
                callback(null);
        });
    }
}

export interface Image
{
    execute(options : any, callback : Function);
}

export interface ImageCompilable extends Image
{
    compile(options : ImageCompilationOptions, callback : ImageCompilationCallback)
}
