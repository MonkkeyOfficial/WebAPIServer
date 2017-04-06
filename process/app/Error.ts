
export default class Error
{
    type : string
    message : string
    details : any

    constructor(exception : any, type? : string, message? : string, details? : string)
    {
        this.message = message;
        this.details = details;
        this.type = type;
    }
}
