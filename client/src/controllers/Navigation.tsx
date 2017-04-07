import React = require('react')

import { Icon } from '../lib/directives/Icon'
import { Config } from '../config'

export class Navigation extends React.Component<any, any>
{
  render()
  {
    return <div>
      <div className="search">
        <input type="text" name="search" placeholder="Search for..." />
        <button className="btn btn-default"><Icon name="icon-search" /></button>
      </div>
      <div className="brand">
        <Icon name="logo" className="logo" />
        <span className="brand-name">Monkkey</span>
      </div>
    </div>
  }
}
