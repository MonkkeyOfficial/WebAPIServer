import { IExercice } from './IExercice'
import Error from '../../app/Error'

export namespace APIResponse
{
    export class Response<T>
    {
        success : boolean
        error? : Error
        data? : T

        constructor(data : T)
        constructor(error : Error)
        constructor(error : Error, data : T)
        constructor(errorOrData : Error | T, data? : T)
        {
            if(data !== undefined)
            {
                this.error = errorOrData as Error;
                this.data = data as T;
            }
            else
            {
                if(errorOrData.constructor === Error)
                    this.error = errorOrData as Error;
                else
                    this.data = errorOrData as T;
            }
            
            this.success = !this.error;
        }
    }

    export class APIExoInformation extends Response<IExercice>
    { }

    export class APIExoExecute extends Response<any>
    { }

    export class APIExoCompile extends Response<any>
    { }

    export class APIUser extends Response<any>
    { }
}
export default APIResponse
