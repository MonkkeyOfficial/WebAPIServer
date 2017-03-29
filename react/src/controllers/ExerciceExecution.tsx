import React = require('react')

import { TabControl, Tab } from '../lib/directives/TabControl'
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

    $.ajax({
        url: this.props.url + '/invoke',
        method: 'POST',
        data: query,
        success: result => {
            this.setState({
              test: result
            })
        }
    })
  }

  constructor(a1, a2)
  {
    super(a1, a2)
    this.state = {
      text: null
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
        Run
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
