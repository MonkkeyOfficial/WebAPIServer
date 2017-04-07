import React = require('react')

interface TabProps
{
  name: string;
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
      activated: this.props.children.length > 0 ? this.getKey(this.props.children[0]) : null
    }
  }

  getKey(child: Tab) : string
  {
    return child.props.name;
  }

  activate(child: number|Tab)
  {
    if(child === undefined || child === null)
    {
      this.setState({
        activated: null
      })
      return;
    }

    if(child.constructor === Number)
    {
      this.setState({
        activated: this.getKey(this.props.children[child as number])
      });
      return;
    }

    this.setState({
      activated: this.getKey(child as Tab)
    })
  }

  render()
  {
    var tabs = [];
    var activated = <span />;

    for(var k in this.props.children)
    {
      let child = this.props.children[k];
      if(child.type.constructor !== Function)
      {
        console.error('The direct children of a TabControl must be Tab elements.');
        continue;
      }
      
      if(this.state.activated === this.getKey(child))
        activated = child;
        
      tabs.push(<li key={k} role="presentation" onClick={() => this.activate(child)} className={activated === child ? 'active' : ''}><a role="tab">{child.props.name}</a></li>);
    }

    return <div>
      <ul className="nav nav-tabs" role="tablist">
        {tabs}
      </ul>
      {activated}
    </div>;
  }
}