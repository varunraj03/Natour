const express = require('express')
const tourController = require('./../Controller/tourController')
const authController = require('./../Controller/authController')
const reviewRouter = require('./reviewRoute')

const tourRouter = express.Router();

// tourRouter.param('id',tourController.checkID)

tourRouter.use('/:tourId/reviews', reviewRouter)

tourRouter.route('/getTourStats').get(tourController.getTourStats);
  
tourRouter.route('/getMonthlyPlan/:Year').get(authController.protect,tourController.getMonthlyPlan)

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

tourRouter.route('/get-5-cheap').get(tourController.aliasTopTours, tourController.getalltour);

tourRouter.route('/').get(tourController.getalltour).post(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.addatour)

tourRouter.route('/:id').get(tourController.getatour).patch(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.updateatour).delete(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.deleteatour); 

//nested route

// tourRouter.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.postaReview)

module.exports = tourRouter;