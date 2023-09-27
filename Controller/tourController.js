const express = require('express')
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) =>{
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image! Please upload only image', 400), false)
    }
}

const upload = multer({ 
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
])

//aliasing  
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )

// exports.checkID = (req, res, next, val)=>{
//     if (req.params.id*1 > tours.length){
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         })
//     }
//     next();
// }


exports.getalltour = factory.getAll(Tour);

// exports.getalltour = catchAsync(async (req, res, next)=>{
//     // execute Query
//     const feature = new API_feature(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limiting()
//     .pagging();

//     const tours = await feature.query;

// res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data:{
//         tours
//     }
// })

// }
// )


exports.getatour = factory.getOne(Tour, {path: 'reviews'})

// exports.getatour = catchAsync(async (req,res, next) => {        //:id is an variable here
//     const tours = await Tour.findById(req.params.id).populate('reviews'); //findOne({_id: req.params.id})
//     if(!tours){
//         return next( new AppError('No tour found with that ID', 404))
//     }   
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tours
//         }
//     })
// }
// )

exports.addatour = factory.createOne(Tour)


// exports.addatour =  catchAsync(async (req, res, next) => {           //express doesnt put data on req, we use middleware for it
//    // const newTour = new Tour({})
//     // newTour.save()

//     const newTour = await Tour.create(req.body); 
//     res.status(201).json({
//         status:'success',
//         data: {
//             tour:newTour
//         }
//     })
// })

exports.updateatour = factory.updateOne(Tour)


// exports.updateatour =  catchAsync(async (req, res, next) => {
//     const tours = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,  //will sent back the newly updated data
//         runValidators: true   //will again run validation for data
//     })
//     if(!tours){
//         return next( new AppError('No tour found with that ID', 404))
//     }
//     res.status(200).json({
//         status: 'status',
//         data: {
//             tours
//         }
//     })
// }
// )

 
// exports.deleteatour = catchAsync(async (req, res, next)=>{
//     const tours = await Tour.findByIdAndDelete(req.params.id)
//     if(!tours){
//         return next( new AppError('No tour found with that ID', 404))
//     }    
//     res.status(204).json({                  //204 means no data to return
//             status: 'success',
//             data: null
//         })
// }
// )

exports.deleteatour = factory.deleteOne(Tour)


exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group:{
                _id: { $toUpper: "$difficulty"},
                numTours: { $sum: 1 },
                NumRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        {
            $match: { _id: { $ne: 'EASY' } }
        }
    ])
    res.status(200).json({                  //204 means no data to return
        status: 'success',
        data: stats
    })
}
)

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.Year * 1;
        const Plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numOfTours: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { Month : '$_id' }
            },
            {
                $project: { _id: 0 }
            },
            {
                $sort: { numOfTours: -1 }
            },
            {
                $limit: 12
            }
        ])

        res.status(200).json({
            status: 'success',
            data: Plan
        })
}
)

exports.getToursWithin = catchAsync( async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;

    if(!lat || !lng){
        next(new AppError('Please provide the parameter as specified', 400))
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere : [[lng, lat], radius] } } });

    res.status(200).json({
        status:'success',
        length: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync( async (req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        next(new AppError('Please provide the parameter as specified', 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng*1, lat*1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1, 
                name: 1
            }
        }
    ])
    res.status(200).json({
        status:'success',
        data: {
            data: distances
        }
    })
} )

