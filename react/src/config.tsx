import { Html } from './lib/services/Html'
import { Api } from './lib/services/Api'

import { Icon } from './lib/directives/Icon'
import { Popover } from './lib/directives/Popover'
import ReactDOM = require('react-dom')

declare var $:any;

export class Config
{
  private static _instance: Config;
  public static get get(): Config
  {
    if(!this._instance)
      this._instance = new Config();
    return this._instance;
  }

  public initialize()
  {
    Api.base = '';
    Icon.defaultProps.folder = '/icons';
    
    Html.reactDefaultTagBuilders = {
      react: {
        Icon: e => <Icon {...Html.getReactAttributes(e)}/>
      },
      jquery: [
        $e => $e.find('Popover').each(function() {
          Popover.init(this, {
            content: $(this).attr('content')
          });
        })
      ]
    };
  }

  websiteName:string = 'Hard Coder';
}