'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
// var path = require('path');
var app = module.exports = loopback();

// configure view handler
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

var cookieParser = require('cookie-parser');
var session = require('express-session');
// Create an instance of PassportConfigurator with the app instance
var lbpassport = require('loopback-component-passport');
var PassportConfigurator = lbpassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

var bodyParser = require('body-parser');
var flash      = require('express-flash');

// Load the provider configurations
// var config = {};
// try {
//   config = require('./providers.js');
// } catch (err) {
//   process.exit(1);
// }

app.use(loopback.token({
  model: app.models.AccessToken,
  currentUserLiteral: 'me',
}));
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json());
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true,
}));

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

// The access token is only available after boot
app.middleware('auth', loopback.token({
  model: app.models.accessToken,
}));
app.middleware('session:before', cookieParser(app.get('cookieSecret')));
app.middleware('session', session({
  secret: 'paypay',
  saveUninitialized: true,
  resave: true,
}));
// Initialize passport
passportConfigurator.init();

// We need flash messages to see passport errors
app.use(flash());

// Set up related models
passportConfigurator.setupModels({
  userModel: app.models.AppUser,
  userIdentityModel: app.models.UserIdentity,
  userCredentialModel: app.models.UserCredential,
});
// Configure passport strategies for third party auth providers
// for (var s in config) {
//   var c = config[s];
//   c.session = c.session !== false;
//   passportConfigurator.configureProvider(s, c);
// }
