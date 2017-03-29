import React = require('react')
import ReactDOM = require('react-dom')

declare var $:any;

interface PopoverPropDelay {
  show: number
  hide: number
}
interface PopoverPropViewport {
  selector: string
  padding: number
}
interface PopoverProps {
  content: string | (() => string)
  animation?: boolean
  container?: string | boolean
  delay?: number | PopoverPropDelay
  html?: boolean
  placement?: string | (() => string)
  selector?: string
  template?: string
  title?: string | (() => string)
  trigger?: string
  viewport?: string | (() => string) | PopoverPropViewport
}

export class Popover extends React.Component<PopoverProps, any>
{
  componentDidMount()
  {
    var $this = $(ReactDOM.findDOMNode(this));
    $this.popover(this.props);
  }

  static defaultProps = {
    placement: 'bottom',
    trigger: 'hover'
  }

  static init(elm, params?: any) : any
  {
    var $elm = $(elm);

    if(!params)
      params = this.defaultProps;
    else
    {
      for(var k in this.defaultProps)
        if(!params[k])
          params[k] = this.defaultProps[k];
    }

    $elm.popover(params);
  }
  
  render()
  {
    return <div className="popover-wrapper" style={{display:'inline-block'}}>{this.props.children}</div>
  }
}
