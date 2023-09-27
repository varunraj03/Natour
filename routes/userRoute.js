const express = require('express')
const userRouter = express.Router();
const authController = require('./../Controller/authController')
const userController = require('./../Controller/userController')


userRouter.route('/signup').post(authController.signup);

userRouter.route('/login').post(authController.login);

userRouter.route('/logout').get(authController.logout)

userRouter.route('/forgotPassword').get(authController.forgotPassword);

userRouter.route('/resetPassword/:token').patch(authController.resetPassword);


//after this all routes are protected

userRouter.use(authController.protect)

userRouter.route('/me').get(userController.getMe, userController.getauser)

userRouter.route('/updateMyPassword').patch(authController.updatePassword);

userRouter.route('/updateMe').patch(userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);

userRouter.route('/deleteMe').delete(userController.deleteMe);

userRouter.route('/').get(userController.getalluser).post(userController.addauser);

userRouter.route('/:id').get(userController.getauser).patch(userController.updateauser).delete(userController.deleteauser);

//nested route

// userRouter.route('/:tourId/reviews').post(authController.restrictTo('user'), reviewController.postaReview)

module.exports = userRouter;