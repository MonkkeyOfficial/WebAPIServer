import React = require('react')
import ReactDOM = require('react-dom')

declare var $:any;

type AjaxCallback = (result:any, status:number, xhr:XMLHttpRequest) => void;
type AjaxErrorCallback = (xhr:XMLHttpRequest, status:number, error:any) => void;
type AjaxFinishCallback = (xhr:XMLHttpRequest, status:number) => void;

export class Api
{
  static useCache: boolean = false;
  static base: string;

  static query(url:string, method:string, callback?: AjaxCallback, error?: AjaxErrorCallback, finish?: AjaxFinishCallback, data?:any)
  {
    if(this.base)
    {
      if(url.indexOf('/') === 0)
        url = url.substring(1);
      if(this.base.lastIndexOf('/') !== this.base.length - 1)
        url = this.base + '/' + url;
      else
        url = this.base + url;
    }

    var options: any = {
      url: url,
      type: method,
      cache: method === 'GET' ? this.useCache : false,
    };
    if(data)
      options.data = data;
    if(callback)
      options.success = callback;
    if(error)
      options.error = error;
    if(finish)
      options.complete = finish;
    $.ajax(options);
  }

  static all(url: string, callback?: AjaxCallback, error?: AjaxErrorCallback, finish?: AjaxFinishCallback) {
    this.query(url, 'GET', callback, error, finish);
  }

  static get(url: string, callback?: AjaxCallback, error?: AjaxErrorCallback, finish?: AjaxFinishCallback) {
    this.query(url, 'GET', callback, error, finish);
  }

  static insert(url: string, data: any, callback?: AjaxCallback, error?: AjaxErrorCallback, finish?: AjaxFinishCallback) {
    this.query(url, 'POST', callback, error, finish, data);
  }

  static delete(url: string, callback?: AjaxCallback, error?: AjaxErrorCallback, finish?: AjaxFinishCallback) {
    this.query(url, 'DELETE', callback, error, finish);
  }

  static update(url: string, data: any, callback?: AjaxCallback, error?: AjaxErrorCallback, finish?: AjaxFinishCallback) {
    this.query(url, 'PATCH', callback, error, finish, data);
  }
}