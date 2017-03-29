import React = require('react')

import { TabControl, Tab } from '../lib/directives/TabControl'
import { Popover } from '../lib/directives/Popover'
import { Icon } from '../lib/directives/Icon'

declare var $ : any;

interface ExerciceExecutionProps
{
  url: string;
  className?: string;
  image: any;
}

export class ExerciceExecution extends React.Component<ExerciceExecutionProps, any>
{
  run()
  {
    var query = {
      codes: {}
    };

    for(var name in this.props.image.config.userFiles)
    {
      var info = this.props.image.config.userFiles[name];
      var value = $('#_test_' + name).val();
      query.codes[name] = value;
    }

    this.setState({
      running: true
    })
    $.ajax({
        url: this.props.url + '/invoke',
        method: 'POST',
        dataType: 'jsonp',
        data: query,
        success: result => {
            this.setState({
              test: result,
              error: null,
              running: false
            })
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.log('error');
          console.log(textStatus);
          console.log(errorThrown);
          this.setState({
            error: textStatus,
            running: false
          })
        }
    })
  }

  constructor(a1, a2)
  {
    super(a1, a2)
    this.state = {
      test: null,
      running: false
    }
  }

  render()
  {
    var testFields = [];
    for(var name in this.props.image.config.userFiles)
    {
      var info = this.props.image.config.userFiles[name];
      testFields.push(<Tab key={name} name={name}>
        <div className="col-xs-12">
          <textarea className="form-control" defaultValue={info.default ? info.default : ''} id={'_test_' + name} key={name} />
        </div>
      </Tab>);
    }

    return <div className={this.props.className}>
      <label>Online test</label>
      <button className="btn btn-success btn-xs run-btn" onClick={() => this.run()}>
        Run {
          this.state.running ?
            <Icon name="icon-spinner" className="spin" />
          : !this.state.test && !this.state.error ?
            <span />
          : !this.state.error && this.state.test.success && !this.state.test.error ?
            <Icon name="icon-check" />
          : <Popover content={this.state.error}>
              <Icon name="icon-remove" />
            </Popover>
        }
      </button>
      <div className="test row">
        <div className="col-xs-12">
          <TabControl>
            {testFields}
          </TabControl>
        </div>
      </div>
      { !this.state.test ? <span /> :
        <div>
          <TabControl>
            <Tab name="Std::out">
              <pre>{this.state.test.stdout}</pre>
            </Tab>
            <Tab name="Error (JSON)">
              <pre>{JSON.stringify(this.state.test.error, null, 2)}</pre>
            </Tab>
            <Tab name="Std::err">
              <pre>{this.state.test.stderr}</pre>
            </Tab>
            <Tab name="Full JSON">
              <pre>{JSON.stringify(this.state.test, null, 2)}</pre>
            </Tab>
          </TabControl>
        </div>
      }
    </div>
  }
}
