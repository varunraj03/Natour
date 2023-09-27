const Review = require('./../models/reviewModel')
const factory = require('./handlerFactory')

exports.AddTourId = (req, res, next) => {
    if(!req.body.Tour) req.body.Tour = req.params.tourId;
    if(!req.body.User) req.body.User = req.user.id;
    next();
}

exports.getAllReview = factory.getAll(Review)

exports.deleteaReview = factory.deleteOne(Review);

exports.updateaReview = factory.updateOne(Review);

exports.getaReview = factory.getOne(Review);

exports.postaReview = factory.createOne(Review);