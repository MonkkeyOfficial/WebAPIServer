import React = require('react')
import ReactDOM = require('react-dom')

declare var $:any;

interface IconProps {
  name: string,
  folder?: string,
  className?: string
}

export class Icon extends React.Component<IconProps, any>
{
  currentName: String = null;

  componentDidMount()
  {
    this.update();
  }
  componentDidUpdate()
  {
    this.update();
  }

  update()
  {
    var tag = this.refs.icon;
    
    var folder = this.props.folder;
    var name = this.props.name;
    if(this.currentName === name)
      return;
    this.currentName = name;

    if(this.props.folder.lastIndexOf('/') === this.props.folder.length - 1)
      folder = this.props.folder.substring(0, this.props.folder.length - 1);
    if(this.props.name.indexOf('/') === 0)
      name = this.props.name.substring(1);

    $.ajax({
      url: folder + '/' + name + '.svg',
      method: 'GET',
      dataType: 'html',
      success: d => $(tag).html(d)
    });
  }

  static defaultProps = {
    folder: '/icons/nicons',
    className: ''
  }
  
  render()
  {
    return <span className={'icon ' + this.props.className} ref="icon"/>
  }
}
