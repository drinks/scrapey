
/**
* Module dependencies.
*/

var express = require('express'),
    app = module.exports = express.createServer(),
    $ = require('jQuery'),
    jsdom = require('jsdom'),
    rest = require('restler');

    var useragents = {
      chrome: 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.872.0 Safari/535.2',
      firefox: 'Mozilla/5.0 (Windows NT 6.1; rv:6.0) Gecko/20110814 Firefox/6.0',
      ie: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
      safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/534.48.3 (KHTML, like Gecko) Version/5.1 Safari/534.48.3',
      android: 'Mozilla/5.0 (Linux; U; Android 2.3; en-us) AppleWebKit/999+ (KHTML, like Gecko) Safari/999.9',
      ipad: 'Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
      iphone: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
      googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    }

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get('/scrape', function(req, res){
  var headers = {
    'User-Agent': useragents[(req.query.useragent || 'chrome')]
  }

  jsdom.env({
    html: req.query.url,
    // headers: headers,
    scripts: [
      'http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js',
      req.query.scraper
    ],
    done: function(errors, window){
      if(errors){
        res.json({errors: errors});
      }
      delete req.query.useragent;
      delete req.query.url;
      delete req.query.scraper
      console.log('Got options: ', req.query);

      res.json(window.run_scraper(window.jQuery, req.query));
    }
  });

});

var port = process.env.PORT || 3000
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
