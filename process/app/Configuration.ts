import * as configNS from './../framework/Configuration'

var config = configNS.applyMode(configNS.default);

export interface Configuration
{
    port : number
    session : any

    compilation : {
        image_base : string
        timeout_sec : number
    }
}

export default configNS.default as Configuration;
