/* z.js - Seizen's dialect of prototype.js */

Function.prototype.bind=function(obj){
  var me=this;
  return function(){me.call(obj)};
};

function $(s){return document.getElementById(s);}

var Try = {
  these: function() {
    var returnValue;
    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }
    return returnValue;
  }
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  Request: function(url,after) {
    this.url=url;
    this.transport = Ajax.getTransport();
    this.options = {
      method:       'POST',// thus no length limit
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    for(var m in after)
      this.options[m]=after[m];

    this.request= function(){
      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.transport.open(this.options.method, this.url, this.options.asynchronous);
      this.setRequestHeaders();
      this.body = this.options.parameters;
      this.transport.send(this.body);
    };

    this.onStateChange= function() {
      var readyState = this.transport.readyState;
      if (readyState == 4){
        if(this.options.onComplete)
          this.options.onComplete();
        if(this.options.evalJS)
          eval(this.transport.responseText);
      }
    };

    this.setRequestHeaders=function(){
      var headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
        'Content-type': this.options.contentType
      };
      for (var name in headers)
        this.transport.setRequestHeader(name, headers[name]);
    };

    this.request();
  }

};

var Element = {
  remove:
    function(e){
      e.parentNode.removeChild(e);
    },
  update:
    function(id, data) {
      var div,a,script='',e=$(id);
      e.innerHTML='';
      if(typeof data=='string'){
        var div=document.createElement('div');
        div.innerHTML=data;
        a=div.childNodes;
        while(a.length>0){
          if(a[0].nodeName=='SCRIPT')
            script+=a[0].text;
          e.appendChild(a[0]);
        }
        if(script!='')
          eval(script);
      }else{
        e.appendChild(data);
      }
    },
  replace:
    function(id, text){
      var div,a,script='',e=$(id);
      div=document.createElement('div');
      div.innerHTML=text;
      a=div.childNodes;
      while(a.length>0){
        if(a[0].nodeName=='SCRIPT')
          script+=a[0].text;
        e.parentNode.insertBefore(a[0],e);
      }
      e.parentNode.removeChild(e);
      if(script!='')
        eval(script);
    },
  insert:
    function(id,obj){
      var div,te,script='',e=$(id),a;
      div=document.createElement('div');
      a=div.childNodes;
      for(pos in obj){
        div.innerHTML=obj[pos];
        switch(pos){
          case 'before':
          case 'after':
            te=div.firstChild;
            while(a.length>0){
              if(a[0].nodeName=='SCRIPT')
                script+=a[0].text;
              e.parentNode.insertBefore(a[0],e);
            }
            if(pos=='after')
              e.parentNode.insertBefore(e,te);
            break;
          case 'top':
            te=e.firstChild;
            while(a.length>0){
              if(a[0].nodeName=='SCRIPT')
                script+=a[0].text;
              e.insertBefore(a[0],te);
            }
            break;
          case 'bottom':
            while(a.length>0){
              if(a[0].nodeName=='SCRIPT')
                script+=a[0].text;
              e.appendChild(a[0]);
            }
            break;
        }
      }
      if(script!='')
        eval(script);
    }
};

var Form = {
  serialize:
    function(form, options) {
      var i,es,qs='';
      es=form.elements;
      for(i=0;i<es.length;i++){
        if(es[i].name && es[i].name!=''){
          qs+="&"+encodeURIComponent(es[i].name)+"="+encodeURIComponent(es[i].value);
        }
      }
      return qs;
    },
  synthesize:
    function(o) {
      var qs='';
      for(m in o)
        qs+="&"+encodeURIComponent(m)+"="+encodeURIComponent(o[m]);
      return qs;
    }
};

function Klass(n,o){
  var m;
  window[n]=o.init;
  delete o.init;
  for(m in o){
    if(m[0]=='_')
      window[n][m]=o[m];
    else
      window[n].prototype[m]=o[m];
  }
  delete o;
  window[n].$={};
}
