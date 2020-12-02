'use strict'

const User = use('App/Models/User');

class AuthController {
  async register({request, response, auth}) {
    const data = request.only(['username', 'email', 'password']);//pega os dados da request

    if (!data['username']) {
      data['username'] = data['email'];
    }

    const repeatUser = await User.query().where('email', data['email']).orWhere('username', data['username']).getCount();
    if (+repeatUser !== 0) {
      return response.status(400).send('Email ou usuário já cadastrado');
    }

    const user = await User.create(data);
    user.reload();
    const token = await auth.attempt(data['email'], data['password']);
    return {token: token, user: user};
  }

  async authenticate({request, auth}) {
    const {email, password, username} = request.all();
    const token = await auth.attempt(email, password);
    const user = await User.findBy('username', username);
    return {token: token, user: user};
  }

  async facebookAuthenticate({request, auth, response, ally}) {
    const {access_token} = request.only(['access_token']);
    let userFacebook = null;
    try {
      userFacebook = await ally.driver('facebook').getUserByToken(access_token);

      // user details to be saved
      const userDetails = {
        username: userFacebook.getEmail(),
        name: userFacebook.getName(),
        email: userFacebook.getEmail(),
        password: uuidv4()
      };

      // search for existing user
      const whereClause = {
        email: userFacebook.getEmail()
      };

      const user = await User.findOrCreate(whereClause, userDetails);
      const token = await auth.generate(user);
      response.send({token: token, user: user});
    } catch (e) {
      response.status(401).send('Failed to authenticate');
    }
  }

  async googleAuthenticate({request, auth, response, ally}) {
    const {access_token} = request.only(['access_token']);
    let userGoogle = null;
    try {
      userGoogle = await ally.driver('google').getUserByToken(access_token);

      // user details to be saved
      const userDetails = {
        username: userGoogle.getEmail(),
        name: userGoogle.getName(),
        email: userGoogle.getEmail(),
        password: uuidv4()
      };

      // search for existing user
      const whereClause = {
        email: userGoogle.getEmail()
      };

      const user = await User.findOrCreate(whereClause, userDetails);
      const token = await auth.generate(user);
      response.send({token: token, user: user});
    } catch (e) {
      response.status(401).send('Failed to authenticate');
    }
  }

  async changePassword({params, request, response}) {
    const {password} = request.all();
    const {resetHash} = params;
    const user = await User.findByOrFail('reset_hash', resetHash);
    if (!user) {
      return response.status(400).send('Reset hash not found');
    }
    try {
      user.merge({password: password, reset_hash: null});
      await user.save();
    } catch (e) {
      return response.status(400).send('Couldnt change password');
    }
  }

}

module.exports = AuthController
