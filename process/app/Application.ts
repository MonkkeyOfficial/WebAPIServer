import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';

import { Application } from './../framework/Application';
import config from './Configuration';

import { Response, Request } from 'express';
export { Response, Request } from 'express';

export class App extends Application
{
    protected static _app : App;
    public static instance() : App
    {
        if(!this._app)
            this._app = new App();
        return this._app;
    }

    constructor()
    {
        super()
        let app = this.express
        
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(session(config.session))

        app.use(express.static('public'));
    }

    toRootPage(response : Response)
    {
        response.sendFile('./views/index.html', { root: path.join(__dirname, '../../..') });
    }
}

export default App.instance();
