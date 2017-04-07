import { Image, ImageUtil, ImageCompilable, ImageCompilableResult, ImageCompilationCallback, ImageCompilationOptions, ImageExecuteCallback, ImageExecuteOptions } from './ImageCompilable'
import { IExercice } from './shared/IExercice'
import Error from '../app/Error'

export interface ExerciceExecuteCallback
{
    (error : Error, result? : any) : void
}

export class Exercice extends IExercice implements ImageCompilable
{
    static fromDB(data : any) : Exercice
    {
        var obj = new Exercice();
        IExercice.copyTo(data, obj);
        return obj;
    }

    compile(options : ImageCompilationOptions, callback : ImageCompilationCallback)
    {
        ImageUtil.compile(options, (e, r) => {
            if(r)
            {
                this.configuration = r.configuration
                this.install_log = r.log
                this.docker_key = r.dockerKey
                this.config = JSON.stringify(r.configuration)
            }

            callback(e, r)
        })
    }
    
    execute(options : ExerciceExecuteOptions, callback : ExerciceExecuteCallback)
    {
        ImageUtil.execute({
            dockerKey: this.docker_key,
            timeout: options.timeout ? options.timeout : 5,
            stdin : options.stdin ? options.stdin : null
        }, (e, stdout) => {
            if(e)
            {
                callback(e, null)
                return;
            }

            var result;
            try
            {
                result = JSON.parse(stdout);
            }
            catch(ex)
            {
                callback(new Error(ex, 'system.imageRuntime', "The result of the image execution is not a valid JSON string.", stdout));
                return;
            }

            result.success = result.success !== undefined ? result.success : true;
            callback(e, result)
        })
    }
}

export interface ExerciceExecuteOptions
{
    timeout? : number | string
    stdin? : any
}
