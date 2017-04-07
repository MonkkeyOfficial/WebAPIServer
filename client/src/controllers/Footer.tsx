import React = require('react')

import { Icon } from '../lib/directives/Icon'
import { Config } from '../config'

export class Footer extends React.Component<any, any>
{
  render()
  {
    return <div className="footer">
      <div>
        <Icon name="logo.mono" />
      </div>
      <div>© 2017 Adrien Castex.</div>
    </div>;
  }
}
