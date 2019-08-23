'use strict';

module.exports = function(app) {
  const AccessToken = app.models.AccessToken;
  const AppUser = app.models.AppUser;
  AccessToken.resolve = async function(id, cb) {
    try {
      const accessToken = await AccessToken.findById(id);
      if (!accessToken) {
        cb();
        return Promise.resolve();
      }
      const {userId} = accessToken;
      const user = await AppUser.findById(userId, {
        include: ['roles'],
      });
      accessToken.roles = user.__data.roles;
      cb(null, accessToken);
      return Promise.resolve(accessToken);
    } catch (e) {
      cb(e);
      return Promise.reject({
        'message': e.message,
        'status': 422,
      });
    }
  };
};
