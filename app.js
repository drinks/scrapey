/*
     ____                                                __
    /\  _`\  Y'know, for stealing content from websites /\ \
    \ \,\L\_\    ___  _ __   __     _____     __  __  __\ \ \
     \/_\__ \   /'___\\`'__\'__`\  /\ '__`\ /'__`\\ \/\ \\ \ \
       /\ \L\ \/\ \__/ \ \/\ \L\.\_\ \ \L\ \\  __/ \ \_\ \\ \_\
       \ `\____\ \____\ \_\ \__/.\_\\ \ ,__/ \____\/`____ \\/\_\
        \/_____/\/____/\/_/\/__/\/_/ \ \ \/ \/____/`/___/> \\/_/
                                      \ \_\           /\___/
          By Dan Drinkard.version 0.1  \/_/           \/__/

    =============================================================

    Use it like this:
    http://scrapey.herokuapp.com/scrape.json?
        apikey=mykey&
        url=http://example.com&
        scraper=http://scrapey.s3.amazonaws.com/example.com.js

    =============================================================
*/

// Modules & Inits

var express = require('express')
  , app = module.exports = express.createServer()
  , Q = require('q')
  , jsdom = require('jsdom')
  , rest = require('restler')
  , mongoose = require('mongoose')
  , models = require(__dirname + '/models.js')
  , settings = {}
  , useragents = {
      chrome: 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.872.0 Safari/535.2'
    , firefox: 'Mozilla/5.0 (Windows NT 6.1; rv:6.0) Gecko/20110814 Firefox/6.0'
    , ie: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)'
    , safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/534.48.3 (KHTML, like Gecko) Version/5.1 Safari/534.48.3'
    , android: 'Mozilla/5.0 (Linux; U; Android 2.3; en-us) AppleWebKit/999+ (KHTML, like Gecko) Safari/999.9'
    , ipad: 'Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5'
    , iphone: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5'
    , googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  };

// Configuration

app.configure(function(){
  app.enable('jsonp callback');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  settings = require(__dirname + '/settings.js');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  settings = process.env;
});

// Helpers

var authorized = function(req){
  var User = models.User(mongoose);
  var dfd = Q.defer();
  var key = req.query.apikey || req.headers['X-APIKEY'];

  User.findOne({key: key}, function(err, doc){
    if(err)
      dfd.reject('There was an error connecting to the database.');

    if(doc)
      dfd.resolve(doc);
    else
      dfd.reject('A valid apikey is required.');
  });
  return dfd.promise();
}

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Scrapey'
  });
});

app.get('/scrape.:format', function(req, res){
  Q.when(authorized(req))
    .done(function(user){

      var headers = {
        'User-Agent': useragents[(req.query.useragent || 'chrome')]
      }

      try{

        jsdom.env({
            html: req.query.url
          , headers: headers
          , scripts: [ 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js', req.query.scraper ]
          , done: function(errors, window){
              if(errors){
                res.send({errors: errors});
              }
              delete req.query.useragent;
              delete req.query.url;
              delete req.query.scraper;
              delete req.query.apikey;
              console.log('Got options: ', req.query);

              try{
                res.send(window.run_scraper(window.jQuery, req.query));
              }catch(e){
                res.send({errors: [e.message]});
              }
            }
        });

      }catch(e){
        res.send({errors: [e.message]});
      }

    }).fail(function(msg){

      res.send({errors: [msg]});

    });

});

// Bootstrappytime!

var port = settings.PORT || 3000
app.listen(port, function(){
  mongoose.connect(settings.MONGOLAB_URI);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
