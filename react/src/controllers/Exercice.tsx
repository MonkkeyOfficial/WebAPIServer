import React = require('react')
import { Api } from '../lib/services/Api'

import { Icon } from '../lib/directives/Icon'
import { Config } from '../config'

declare var $ : any;

interface ExerciceProps
{
  id: Number;
}

function def(root, name, defaultValue)
{
  if(root[name] === undefined || root[name] === null)
    root[name] = defaultValue;
}

interface UserScriptProps
{
  name: String;
  config: any;
}

export class UserScript extends React.Component<UserScriptProps, any>
{
  render()
  {
    var config = this.props.config;

    var filters = [];
    if(config.filters)
    for(var k in config.filters)
      filters.push(<ul key={k} className="filter">
        <li className="filter-path">{config.filters[k].substring(config.filters[k].indexOf('_d__filters__') + '_d__filters__'.length + 1)}</li>
      </ul>);

    return <div className="user-script col-xs-12">
      <div className="row">
        <label className="name col-xs-9">
          <span>{this.props.name} </span>
          <span className="path">({config.path})</span>
        </label>
        <div className="col-xs-3 text-right">
          <button role="button" data-toggle="collapse" href={'#filters_' + this.props.name} className="btn btn-default btn-xs">Filters <span className="label label-primary">{filters.length}</span></button>
        </div>
      </div>
      { !config.default ? '' : <div className="default-value-wrapper">
        <label>Default value</label>
        <pre className="default-value">{config.default}</pre>
      </div>}
      <div className="filters-wrapper">
        <div className="filters collapse" id={'filters_' + this.props.name}>{filters}</div>
      </div>
    </div>
  }
}

interface TabProps
{
  name: String;
}
class Tab extends React.Component<TabProps, any>
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
class TabControl extends React.Component<any, any>
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

export class Exercice extends React.Component<ExerciceProps, any>
{
  componentDidMount()
  {
    Api.all('/exo/' + this.props.id, data => {
      if(data.success !== undefined && !data.success)
      {
        this.setState({
          found: false
        })
        return;
      }
      
      data.exercice.creation_date = new Date(data.exercice.creation_date);
      data.exercice.edit_date = new Date(data.exercice.edit_date);
      data.image.last_edit = new Date(data.image.last_edit);
      
      this.setState({
        found: true,
        exercice: data.exercice,
        image: data.image
      });
    });
  }

  copyUrl()
  {
    var copyTextarea : HTMLTextAreaElement = document.querySelector('.url .value') as HTMLTextAreaElement;
    copyTextarea.select();

    try
    {
      this.setState({
        copied: document.execCommand('copy')
      })
    }
    catch(err)
    {
      this.setState({
        copied: false
      })
    }
  }

  runTest()
  {
    var query = {
      codes: {}
    };

    for(var name in this.state.image.config.userFiles)
    {
      var info = this.state.image.config.userFiles[name];
      var value = $('#_test_' + name).val();
      query.codes[name] = value;
    }

    $.ajax({
        url: this.getUrl() + '/invoke',
        method: 'POST',
        data: query,
        success: result => {
            this.setState({
              test: result
            })
        }
    })
  }

  getUrl()
  {
    return 'http://192.168.0.36:9000/exo/' + this.state.exercice.uid;
  }

  render()
  {
    if(!this.state)
      return <div>Loading...</div>;
    if(!this.state.found)
      return <div>Not found.</div>;

    var userScripts = [];
    for(var name in this.state.image.config.userFiles)
      userScripts.push(<UserScript key={name} name={name} config={this.state.image.config.userFiles[name]} />)

    var json = { codes: {}, stdin: '... [optional]', args: 'arg1 arg2 arg3 ... [optional]' };
    for(var name in this.state.image.config.userFiles)
      json.codes[name] = '...';
    
    var testFields = [];
    for(var name in this.state.image.config.userFiles)
    {
      var info = this.state.image.config.userFiles[name];
      testFields.push(<Tab key={name} name={name}>
        <div className="col-xs-12">
          <textarea className="form-control" defaultValue={info.default ? info.default : ''} id={'_test_' + name} key={name} />
        </div>
      </Tab>);
    }

    return <div className="exercice">
      <div className="header">
        <div className="dates">
          <div className="creation-date">{this.state.exercice.creation_date.toDateString()}</div>
          <div className="edit-date">{this.state.exercice.edit_date.toDateString()}</div>
        </div>
        <div>{this.state.exercice.name ? this.state.exercice.name : <span className="undefined undefined-name">No name</span>}</div>
        <div>{this.state.exercice.description ? this.state.exercice.description : <span className="undefined undefined-desc">No description</span>}</div>
        <div className="url">
          <button className="btn btn-default" onClick={() => { this.copyUrl() }}>Copy {
            this.state.copied !== undefined ?
              <Icon name={this.state.copied ? 'icon-check' : 'icon-remove'} />
            : <span />
          }
          </button>
          <textarea rows={1} cols={30} className="value" readOnly value={this.getUrl()}></textarea>
        </div>
      </div>
      <div className="body">
        <div className="repositories-wrapper">
          <label>Repositories</label>
          <div className="repositories">
            {
              !this.state.exercice.repositories || !this.state.exercice.repositories.length ?
                <div className="undefined undefined-repositories">No repository available.</div>
              : <ul>
                  <li><a href="https://github.com/Polytech-AdrienCastex/POP3-Server">Github <small>(https://github.com/Polytech-AdrienCastex/POP3-Server)</small></a></li>
                </ul>
            }
          </div>
        </div>
        <div className="image">
          <div className="name row"><label className="col-sm-2">Image key</label> <span className="value">{this.state.image.image_name}</span></div>
          <div className="timeout row"><label className="col-sm-2">Timeout</label> <span className="value">{this.state.image.timeout} second{this.state.image.timeout > 1 ? 's' : ''}</span></div>
          <div className="command row"><label className="col-sm-2">Command</label> <samp className="value">{this.state.image.config.command}</samp></div>
          <div className="user-scripts-wrapper">
            <label>User scripts</label>
            <div className="user-scripts">
              {userScripts}
            </div>
          </div>
          <div className="config-wrapper">
            <label>Configuration</label>
            {
              !this.state.image.config ?
                <div className="undefined undefined-config">No configuration available.</div>
              : <pre className="config">{JSON.stringify(this.state.image.config, null, 2)}</pre>
            }
          </div>
          <div className="install-log-wrapper">
            <label>Install log</label>
            {
              !this.state.image.install_log || this.state.image.install_log.trim().length === 0 ?
                <div className="undefined undefined-install-log">No installation log available.</div>
              : <samp className="install-log">{this.state.image.install_log}</samp>
            }
          </div>
          <div className="api-wrapper">
            <label>API - JSON</label>
            <pre>{JSON.stringify(json, null, 2)}</pre>
          </div>
          <div className="test-wrapper">
            <label>Online test</label>
            <button className="btn btn-success btn-xs run-btn" onClick={() => this.runTest()}>Run</button>
            <div className="test row">
              <div className="col-xs-12">
                <TabControl>
                  {testFields}
                </TabControl>
              </div>
            </div>
            { !this.state.test ? <span /> :
              <div>
                <Icon name={this.state.test.success && !this.state.test.error ? 'icon-check' : 'icon-remove'} />
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
        </div>
      </div>
    </div>
  }
}

export const ExerciceRoute = ({ match }) => (
  <Exercice id={match.params.id} />
);
