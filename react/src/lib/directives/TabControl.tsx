import React = require('react')

interface TabProps
{
  name: String;
}
export class Tab extends React.Component<TabProps, any>
{
  active()
  {
    this.setState({
      active: true
    })
  }

  constructor(a1, a2)
  {
    super(a1, a2);

    this.state = {
      active: false
    }
  }

  render()
  {
    return <div className="tab-content active">{this.props.children}</div>;
  }
}

export class TabControl extends React.Component<any, any>
{
  constructor(a1, a2)
  {
    super(a1, a2);
    this.state = {
      activated: this.props.children.length > 0 ? this.props.children[0] : null
    }
  }

  activate(child)
  {
    this.setState({
      activated: child
    })
  }

  render()
  {
    var tabs = [];

    for(var k in this.props.children)
    {
      let child = this.props.children[k];
      if(child.type.constructor !== Function)
      {
        console.error('The direct children of a TabControl must be Tab elements.');
        continue;
      }
      
      tabs.push(<li key={k} role="presentation" onClick={() => this.activate(child)} className={this.state.activated === child ? 'active' : ''}><a role="tab">{child.props.name}</a></li>);
    }

    return <div>
      <ul className="nav nav-tabs" role="tablist">
        {tabs}
      </ul>
      {this.state.activated}
    </div>;
  }
}