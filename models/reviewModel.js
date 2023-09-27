//review/ rating / createdAt / ref to tour / ref to user
const Tour = require('./tourModel')
const mongoose =  require('mongoose');

const reviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required: [true,"Must have a review"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    Tour:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    User: {
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required: [true, 'Review must belong to a user as well']
    }
},
{
    toJSON: { virtuals: true },     //those properties which are not in the model but calculated must also be in the query
    toObject: { virtuals: true }
});

reviewSchema.index({ Tour: 1, User: 1 }, { unique: true});          //this would set the 1 user to write 1 review for 1 tour

reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //   path: 'Tour',
    //   select: 'name'
    // })
    this.populate({
        path: 'User',
        select: 'name photo'
    });
    next();
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: {Tour: tourId}
        },
        {
            $group: {
                _id: '$Tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    console.log(stats);
    if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    })}
    else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}

reviewSchema.post('save', function () {
    // this points to the current review
    this.model('Review').calcAverageRatings(this.Tour);
});


//for findoneupdate and delete
reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.Tour)
})

const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;


//POST   /tour/2131121312/reviews