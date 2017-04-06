import * as expressCore from "express-serve-static-core";
import * as express from 'express';
import * as http from 'http';

export class Application
{
    public express : express.Express = express();

    get(path : expressCore.PathParams, ...handler: express.RequestHandler[]) : this
    {
        this.express.get(path, ...handler);
        return this;
    }
    post(path : expressCore.PathParams, ...handler: express.RequestHandler[]) : this
    {
        this.express.post(path, ...handler);
        return this;
    }
    patch(path : expressCore.PathParams, ...handler: express.RequestHandler[]) : this
    {
        this.express.patch(path, ...handler);
        return this;
    }
    delete(path : expressCore.PathParams, ...handler: express.RequestHandler[]) : this
    {
        this.express.delete(path, ...handler);
        return this;
    }

    match(method: string | string[], path : expressCore.PathParams, ...handler: express.RequestHandler[]) : this
    {
        if(method instanceof Array)
        {
            for(var k in method)
                this.match(method[k], path, ...handler);
        }
        else
            this.express[method](path, ...handler);
        return this;
    }

    run(port : number, callback? : () => void) : http.Server
    {
        return this.express.listen(port, callback);
    }

    byType(req : express.Request, ...handlers : ByTypeHandler[])
    {
        var types = [];
        var map = {}

        handlers.forEach(v => {
            types.push(v.type);
            map[v.type] = v.action;
        })

        var type = req.accepts(types);

        if(type)
            map[type as string]();
    }
}

interface ByTypeHandler
{
    type : string
    action : () => void
}
