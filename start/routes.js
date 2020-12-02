'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/','AppController.page');

Route.post('api/register', 'AuthController.register');
Route.post('api/auth/authenticate', 'AuthController.authenticate');
Route.post('api/change-password/:resetHash', 'AuthController.changePassword');
Route.post('api/auth/facebook', 'AuthController.facebookAuthenticate');
Route.post('api/auth/google', 'AuthController.googleAuthenticate');

Route.get('app', 'AppController.index').middleware(['auth']);

Route.group(() => {
  Route.resource("tweets", "TweetController").apiOnly().except("update");
}).middleware(['auth']);


