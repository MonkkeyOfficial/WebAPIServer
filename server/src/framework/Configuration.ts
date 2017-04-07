import * as fs from 'fs'

var config = JSON.parse(fs.readFileSync('./config.json').toString());
export default config;

export interface initializeSyncHandler
{
    (config : any) : boolean;
}
export interface initializeCallback
{
    (valid : boolean) : void;
}
export interface initializeHandler
{
    (config : any, callback : initializeCallback) : void;
}

export function initialize(callback : initializeCallback, ...handlers : (initializeHandler | initializeSyncHandler)[])
{
    if(handlers.length === 0)
    {
        callback(true);
        return;
    }

    let isValid : boolean = true;
    let countOut : number = handlers.length;

    function callbackCountOut(valid : boolean)
    {
        isValid = isValid && valid;
        --countOut;
        if(countOut <= 0)
            callback(isValid);
    }

    for(var k in handlers)
    {
        let handler : Function = handlers[k];
        let result = handler(config, callbackCountOut);
        if(result !== undefined && result !== null && result.constructor === Boolean)
            callbackCountOut(result);
    }
}

export function initializeSync(...handlers : initializeSyncHandler[]) : boolean
{
    for(let k in handlers)
        if(!handlers[k](config))
            return false;
    return true;
}

export function spreadValues(object, values)
{
    for(let keyName in values)
    {
        let value = values[keyName];

        if(!object[keyName] || !value || value.constructor !== Object)
        {
            object[keyName] = value;
            continue;
        }

        spreadValues(object[keyName], value);
    }
}

export function applyMode(config)
{
    if(!config.mode)
        config.mode = 'prod';

    if(config.modes && config.modes[config.mode])
        spreadValues(config, config.modes[config.mode]);
}
