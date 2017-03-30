import React = require('react')
import { Api } from '../lib/services/Api'

import { TabControl, Tab } from '../lib/directives/TabControl'
import { Icon } from '../lib/directives/Icon'
import { Config } from '../config'

import { ExerciceExecution } from './ExerciceExecution'

declare var $ : any;

interface ExerciceProps
{
  id: number;
}

function def(root, name, defaultValue)
{
  if(root[name] === undefined || root[name] === null)
    root[name] = defaultValue;
}

interface UserScriptProps
{
  name: string;
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
          {
            this.state.found ?
              <ExerciceExecution className="test-wrapper" image={this.state.image} url={this.getUrl()} />
            : <span />
          }
        </div>
      </div>
    </div>
  }
}

export const ExerciceRoute = ({ match }) => (
  <Exercice id={match.params.id} />
);
