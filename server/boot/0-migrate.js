'use strict';

module.exports = function(app, next) {
  var ds = app.dataSources.db;
  ds.isActual(function(err, actual) {
    if (!actual) {
      ds.autoupdate(function(err) {
        if (err) return next(err);
        return next();
      });
    } else {
      return next();
    }
  });
};
