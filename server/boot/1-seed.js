'use strict';
const roles = ['admin', 'user'];
const admin = {
  role: 'admin',
  username: 'administrator',
  email: 'admin@backend.com',
  password: 'password',
  firstname: 'admin',
  lastname: 'backend',
  empcode: 'admin001',
  emailVerified: true,
};
const user1 = {
  role: 'user',
  username: 'user1',
  email: 'user1@backend.com',
  password: 'password',
  firstname: 'userfirst',
  lastname: 'backendfirstuser',
  empcode: 'user001',
  emailVerified: true,
};
const user2 = {
  role: 'user',
  username: 'user2',
  email: 'user2@backend.com',
  password: 'password',
  firstname: 'usersecond',
  lastname: 'backendseconduser',
  empcode: 'user002',
  emailVerified: true,
};

module.exports = async function (app) {
  const User = app.models.AppUser;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;
  async function createRole() {
    try {
      let results = await Promise.all(roles.map(async (role) => {
        let [model, created] = await Role.findOrCreate(
          {
            where: {
              name: role,
            },
          },
          {
            name: role,
          }
        );
        return model;
      }));
      return Promise.resolve(results);
    } catch (e) {
      return Promise.reject({
        'message': e.message,
        'status': 422,
      });
    }
  }
  async function createAdmin() {
    try {
      let [model, created] = await User.findOrCreate(
        {
          where: {
            username: admin.username,
          },
        }, admin);
      return Promise.resolve({model, created});
    } catch (e) {
      return Promise.reject({
        'message': e.message,
        'status': 422,
      });
    }
  }
  async function assignRole(user, role) {
    try {
      let roleMapping = await role.principals.findOne({
        where: {
          principalType: RoleMapping.USER,
          principalId: user.id,
          roleId: role.id,
        },
      });
      if (!roleMapping) {
        roleMapping = await role.principals.create({
          principalType: RoleMapping.USER,
          principalId: user.id,
        });
      }
      return Promise.resolve(roleMapping);
    } catch (e) {
      return Promise.reject({
        'message': e.message,
        'status': 422,
      });
    }
  }
  async function createUser(user) {
    try {
      let [model, created] = await User.findOrCreate(
        {
          where: {
            username: user.username,
          },
        }, user);
      return Promise.resolve({model, created});
    } catch (e) {
      return Promise.reject({
        'message': e.message,
        'status': 422,
      });
    }
  }

  try {
    const _roles = await createRole();

    const {model: _adminUser} = await createAdmin();
    const _adminRole = _roles.find((role) => {
      return role.name === 'admin';
    });
    await assignRole(_adminUser, _adminRole);

    const _userRole = _roles.find((role) => {
      return role.name === 'user';
    });
    const {model: _user1} = await createUser(user1);
    await assignRole(_user1, _userRole);

    const {model: _user2} = await createUser(user2);
    await assignRole(_user2, _userRole);

    console.log('Done seed');
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
