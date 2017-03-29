var fs = require('fs'),
    watch = require('node-watch');

var fnToCall;

if(!process.argv || process.argv.length < 3)
{
    console.log(' Usage : watch <config-file.json> [<cmd>]');
    console.log('       : <cmd> = clean | dev | prod');
    return;
}
var configFilePath = process.argv[2];
fs.readFile(configFilePath, (e, content) => {
    var config = e ? null : JSON.parse(content);
    if(!config)
    {
        console.error(' [!] Can\'t find a configuration file');
        return;
    }
    if(!config.devWatcher)
    {
        console.error(' [!] Can\'t find \'devWatcher\' in the configuration file');
        return;
    }
    config = config.devWatcher;
    if(!config.cmd)
    {
        if(process.argv.length < 4)
        {
            console.error(' [!] Can\'t \'cmd\' in the configuration file or as process argument');
            return;
        }
        config.cmd = process.argv[3];
    }

    wrap(config);

    switch(config.cmd)
    {
        case 'clean':
            console.log(' [i] Clean mode');
            config.cmd = (f, o, config) => {
                if(config.noClean)
                    return;
                o.clean(config);
                console.log(' [o] cleaned ' + f);
            };
            break;

        case 'dev':
            console.log(' [i] Development mode');
            config.cmd = (f, o, config) => {
                if(o.devRun)
                {
                    o.devRun(config);
                    console.log(' [o] loaded ' + f);
                }
                else if(o.run)
                {
                    o.run(config);
                    console.log(' [o] loaded ' + f);
                }
            }
            break;

        case 'prod':
            console.log(' [i] Production mode');
            config.cmd = (f, o, config) => {
                if(o.prodRun)
                {
                    o.prodRun(config);
                    console.log(' [o] loaded ' + f);
                }
                else if(o.run)
                {
                    o.run(config);
                    console.log(' [o] loaded ' + f);
                }
            }
            break;
        
        default:
            console.log(' [!] Unkown command ' + config.cmd);
            return;
    }

    runWatchers(config);
})

function wrap(config) {
    config.rmdir = deleteFolder;
    config.exec = exec;
    config.watch = watch;
}

watchers = {
    'typescript': {
        prodRun: function(config) {
            config.configFile = config.configFile ? config.configFile : 'package.json';
            config.tempFolder = config.tempFolder ? config.tempFolder : 'dist';
            config.rootFile = config.rootFile ? config.rootFile : 'boot';
            config.dest = config.dest ? config.dest : 'script.js';

            config.exec('tsc --p ' + config.configFile + ' --watch', () => {
                var srcFile = config.tempFolder + '/' + config.rootFile + '.js';
                console.log(' [ ] ' + config.dest + ' updating from ' + srcFile);
                config.exec('browserify -s main ' + srcFile + ' -o ' + config.dest, () => {
                    console.log(' [o] ' + config.dest + ' updated');
                });
            });
        },
        devRun: function(config) {
            config.configFile = config.configFile ? config.configFile : 'package.json';
            config.tempFolder = config.tempFolder ? config.tempFolder : 'dist';
            config.rootFile = config.rootFile ? config.rootFile : 'boot';
            config.dest = config.dest ? config.dest : 'script.js';

            config.exec('tsc --p ' + config.configFile + ' --watch');
            var countOut = 0;
            config.watch(config.tempFolder, { recursive: true }, function(event, filename) {
                ++countOut;
                setTimeout(function() {
                    if(--countOut > 0)
                        return;
                    var srcFile = config.tempFolder + '/' + config.rootFile + '.js';
                    console.log(' [ ] ' + config.dest + ' updating from ' + srcFile);
                    config.exec('browserify -s main ' + srcFile + ' -o ' + config.dest, () => {
                        console.log(' [o] ' + config.dest + ' updated');
                    });
                }, 200);
            });
        },
        clean: (config) => {
            config.tempFolder = config.tempFolder ? config.tempFolder : 'dist';
            config.rmdir(config.tempFolder);
        }
    },
    'sass': {
        prodRun: function(config) {
            if(!config.srcFolder)
            {
                console.error(' [!] \'srcFolder\' must be specified in \'sass\' config.');
                return;
            }
            if(!config.destFolder)
            {
                console.error(' [!] \'destFolder\' must be specified in \'sass\' config.');
                return;
            }
            config.exec('node-sass --output-style compressed ' + config.srcFolder + ' -o ' + config.destFolder);
        },
        devRun: function(config) {
            if(!config.srcFolder)
            {
                console.error(' [!] \'srcFolder\' must be specified in \'sass\' config.');
                return;
            }
            if(!config.destFolder)
            {
                console.error(' [!] \'destFolder\' must be specified in \'sass\' config.');
                return;
            }
            config.exec('node-sass ' + config.srcFolder + ' -o ' + config.destFolder);
            config.exec('node-sass -w ' + config.srcFolder + ' -o ' + config.destFolder);
        },
        clean: (config) => {
            if(!config.destFolder)
            {
                console.error(' [!] \'destFolder\' must be specified in \'sass\' config.');
                return;
            }
            config.rmdir(config.destFolder);
        }
    },
    'svg-extract-layers': {
        devRun: function(config) {
            if(!config.srcFolder)
            {
                console.error(' [!] \'srcFolder\' must be specified in \'svg-extract-layers\' config.');
                return;
            }
            if(!config.destFolder)
            {
                console.error(' [!] \'destFolder\' must be specified in \'svg-extract-layers\' config.');
                return;
            }

            var path = config.srcFolder;
            var folderDest = config.destFolder;

            watch(path, { recursive: false }, function(filename) {
                if(!/\.svg$/.test(filename))
                    return;
                if(!fs.existsSync(filename))
                    return;
                
                console.log(' [ ] extracting ' + filename);
                
                if(!fs.existsSync(folderDest))
                    fs.mkdirSync(folderDest);

                var content = fs.readFileSync(filename);
                var wrapper = fs.readFileSync(path + '/wrapper');

                var offset = 0;
                var index;
                while((index = content.indexOf('inkscape:groupmode="layer"', offset)) > -1)
                {
                    offset = index + 1;

                    var start = content.lastIndexOf('<', index);
                    var end = content.indexOf('>', index);
                    var fullEnd = content.indexOf('inkscape:groupmode="layer"', index + 1);
                    if(fullEnd == -1)
                        fullEnd = content.length;
                    fullEnd = content.lastIndexOf('</g>', fullEnd) + 4;

                    var tag = content.toString('UTF-8', start, end);
                    var full = content.toString('UTF-8', start, fullEnd);
                    full = full.replace(/display( )*:( )*none/img, '');

                    var name = /inkscape:label="([^"]+)"/i.exec(tag)[1];

                    full = full.replace(/id="([a-z0-9]+)"/i, 'id="' + name + '"');

                    var finalFile = wrapper.toString().replace('{{content}}', full);
                    fs.writeFileSync(folderDest + '/' + name + '.svg', finalFile);
                }
                console.log(' [o] extracted ' + filename);
            });
        },
        clean: (config) => {
            if(!config.destFolder)
            {
                console.error(' [!] \'destFolder\' must be specified in \'svg-extract-layers\' config.');
                return;
            }
            config.rmdir(config.destFolder);
        }
    }
}

function runWatchers(config)
{
    function exe(obj, meta, _config) {
        _config = _config ? _config : config;
        wrap(_config);
        config.cmd(meta ? meta : obj.name, obj, _config);
    }

    if(config.runs)
    {
        config.runs.forEach(run => {
            var type = run.type;
            var runObj = watchers[type];
            if(!runObj)
                console.error(' [!] Can\'t load \'' + type + '\'');
            else
            {
                exe(runObj, run.type, run);
                console.log(' [o] Run of ' + type + '');
            }
        })
    }
    else
        console.log(' [?] No \'runs\' in the configuration file');
    
    fs.readdir('./watchers', function(err, files)
    {
        if(err) return;

        files.forEach(function(file) {
            var name = './watchers/' + file;
            exe(require(name), file);
        });
    });
}

function deleteFolder(path)
{
    if(fs.existsSync(path))
    {
        fs.readdirSync(path).forEach(function(file,index)
        {
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory())
                deleteFolder(curPath);
            else
                fs.unlinkSync(curPath);
        });
        fs.rmdirSync(path);
    }
};

function exec(cmd, callback) {
    var exec = require('child_process').exec;
    exec(cmd, function(error, stdout, stderr) {
        if(error)
            console.log(error);
        if(stderr)
            console.log(stderr);
        if(stdout)
            console.log(stdout);
        if(callback)
            callback();
    });
}
