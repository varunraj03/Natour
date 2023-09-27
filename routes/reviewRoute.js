const express = require('express');
const reviewController = require('./../Controller/reviewController');
const authController = require('./../Controller/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect)

reviewRouter.route('/').post(authController.restrictTo('user'),reviewController.AddTourId, reviewController.postaReview).get(reviewController.getAllReview);

reviewRouter.route('/:id').delete(authController.restrictTo('user','admin'),reviewController.deleteaReview).patch(authController.restrictTo('user','admin'),reviewController.updateaReview).get(reviewController.getaReview)

module.exports = reviewRouter;