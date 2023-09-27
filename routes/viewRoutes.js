const express = require('express');
const viewsController = require('./../Controller/viewsController');
const authController = require('./../Controller/authController');

const viewRouter = express.Router();

viewRouter.route('/').get(authController.isLoggedIn,viewsController.getOverview);
viewRouter.route('/login').get(authController.isLoggedIn,viewsController.getLoginForm);
viewRouter.route('/tour/:slug').get(authController.isLoggedIn,viewsController.getTour);
viewRouter.route('/me').get(authController.protect, viewsController.getAccount);

// viewRouter.route('/submit-user-data').patch(
//   authController.protect,
//   viewsController.updateUserData
// );

module.exports = viewRouter;
