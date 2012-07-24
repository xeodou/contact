/**
 * Template Engine for connect, base on ejs
 * 
 * Use case:
 * 
 * var render = require('./lib/render')
 *   , connect = require('connect');
 * 
 * connect(
 *     render({
 *         root: __dirname + '/views'
 *       , cache: true
 *       , layout: 'layout.html' // or false
 *       , helpers: {
 *          config: config,
 *          sitename: 'NodeBlog Engine'
 *       }
 *     });
 * );
 * 
 * res.render('index.html', {title: 'Index Page', items: items});
 * 
 * // no layout 
 * res.render('blue.html', {items: items, layout: false});
 * 
 * 
 */

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , ejs = require('ejs')
  , ServerResponse = http.ServerResponse;

var settings = {
    root: __dirname + '/views'
  , cache: true
  , layout: 'layout.html'
  , csrf: false
};

var cache = {};

module.exports = function(options) {
    options = options || {};
    for(var k in options) {
        settings[k] = options[k];
    }
    return function(req, res, next) {
        if(settings.csrf===true){
          res._csrf = req.session._csrf;
        }
        req.next = next;
        res.req = req;
        res.render = render;
        res._render = _render;
        res.redirect = redirect;
        next();
    };
};

function render(view, options, code) {
    options = options || {};
    options.layout = (!options.layout&&options.layout!==false)?'layout.html':options.layout;
    if(settings.helpers) {
        for(var k in settings.helpers) {
            options[k] = settings.helpers[k];
        }
    }
    if(this._csrf){
      options._csrf = this._csrf;
    }
    var layout = options.layout;
    if(layout){
        if(!/.html$/.test(layout)){
            layout+='.html';
        }
        settings.layout = layout;
    }
    var self = this;
    // add request to options
    options.request = self.req;
    // render view template
    // 默认为html
    if(!/.html$/.test(view)){
        view += '.html';
    }
    self._render(view, options, function(err, str) {
        if(err) {
            return self.req.next(err);
        }
        var layout = settings.layout;
        if(options.layout === false || !layout) {
            return self.end(str);
        }
        // render layout template, add view str to layout's locals.body;
        options.body = str;
        self._render(layout, options, function(err, str) {
            if(err) {
                return self.req.next(err);
            }
            if(code){
                self.writeHead(code);
            }
            self.end(str);
        });
    });
};

function _render_tpl(fn, options, callback) {
    try {
        var str = fn.call(options.scope, options);
        callback(null, str);
    } catch(err) {
        callback(err);
    }
}

function _render(view, options, callback) {
    var view = path.join(settings.root, view);
    var fn = settings.cache && cache[view];
    if(fn) {
        return _render_tpl(fn, options, callback);
    }
    // read template data from view file
    fs.readFile(view, 'utf-8', function(err, data) {
        if(err) {
            return callback(err);
        }
        fn = ejs.compile(data, {filename: view});
        if(settings.cache) {
            cache[view] = fn;
        }
        _render_tpl(fn, options, callback);
    });
};
function redirect(url){
    //defualt to 302
    var statusCode = 302;
    if(arguments.length===2){
        var statusCode = url;
        url = arguments[1];
    }
    this.writeHead(statusCode, {"Location":url});
    this.end('redirect: '+ url);
}