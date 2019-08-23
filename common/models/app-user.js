'use strict';
const app = require('../../server/server');

module.exports = function(Appuser) {
  Appuser.observe('before save', async ctx => {
    if (!ctx.isNewInstance) {
      return Promise.resolve();
    }
    const user = ctx.instance;
    let appUser = await Appuser.findOne({
      where: {
        empcode: user.empcode,
      },
    });
    if (appUser) {
      const error = new Error('Employee code already exist');
      error.status = 400;
      throw error;
    }
    appUser = await Appuser.findOne({
      where: {
        username: user.username,
      },
    });
    if (appUser) {
      const error = new Error('User name already exist');
      error.status = 400;
      throw error;
    }
    appUser = await Appuser.findOne({
      where: {
        email: user.email,
      },
    });
    if (appUser) {
      const error = new Error('Email already exist');
      error.status = 400;
      throw error;
    }
    return Promise.resolve();
  });
    // auto assign role if role not given
  Appuser.observe('before save', ctx => {
    if (!ctx.isNewInstance) {
      return Promise.resolve();
    }
    const user = ctx.instance;
    user.role = user.role != null ? user.role : 'user';
    return Promise.resolve();
  });

  const setUserRole = async (user) => {
    const userRole = user.role;
    if (!userRole) {
      return Promise.resolve();
    }
    const rolePrincipalType = 'USER';
    const roleMappings = await app.models.RoleMapping.find({
      where: {
        principalType: rolePrincipalType,
        principalId: user.id,
      },
    });
    if (roleMappings.length > 0) {
      await app.models.RoleMapping.destroyAll(
        {
          principalType: rolePrincipalType,
          principalId: user.id,
        });
    }
    const role = await app.models.Role.findOne(
      {
        where: {
          name: userRole,
        },
      },
    );
    const roleMapping = await role.principals.findOne({
      where: {
        principalType: rolePrincipalType,
        principalId: user.id,
        roleId: role.id,
      },
    });
    if (!roleMapping) {
      await role.principals.create({
        principalType: rolePrincipalType,
        principalId: user.id,
        roleId: role.id,
      });
    }
  };

  Appuser.observe('after save', async function(ctx) {
    const user = ctx.instance;
    try {
      await setUserRole(user);
      return Promise.resolve();
    } catch (e) {
      console.log(e);
      await Appuser.deleteById(user.id);
      return Promise.reject({
        'message': e.message,
        'status': 422,
      });
    }
  });
  
};
