import ReactDOM = require('react-dom')

declare var $:any;

export class Html
{
  static getReactAttributes(element) : any
  {
    var $e = $(element);
    var attrs:any = {};
    for(var i = 0; i < $e[0].attributes.length; ++i)
    {
      var kv = $e[0].attributes[i];
      attrs[kv.name] = kv.value;
    }

    return attrs;
  }

  static reactDefaultTagBuilders;

  static compile(reactRootTag, htmlToInject, reactTagBuilder?) : void
  {
    var $reactRootTag = $(reactRootTag);
    var $content = $reactRootTag.append(htmlToInject);

    if(!reactTagBuilder)
      reactTagBuilder = this.reactDefaultTagBuilders;
    if(!reactTagBuilder)
      return;
    if(!reactTagBuilder.react)
      reactTagBuilder.react = this.reactDefaultTagBuilders.react;
    if(!reactTagBuilder.jquery)
      reactTagBuilder.jquery = this.reactDefaultTagBuilders.jquery;
    
    if(reactTagBuilder.react)
    {
      var sels = {}
      for(var selector in reactTagBuilder.react) // buffered
        sels[selector] = $reactRootTag.find(selector);

      for(var selector in sels)
      {
        var es = sels[selector];
        for(var i = 0; i < es.length; ++i)
        {
          var e = es[i];
          ReactDOM.render(reactTagBuilder.react[selector](e), e);
        }
      }
    }
    
    if(reactTagBuilder.jquery)
    {
      if(reactTagBuilder.jquery.constructor === Array)
        for(var k in reactTagBuilder.jquery)
          reactTagBuilder.jquery[k]($content);
      else
        reactTagBuilder.jquery($content);
    }
  }
}