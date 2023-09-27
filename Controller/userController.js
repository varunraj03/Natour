const { filter } = require('lodash');
const multer = require('multer') 
const sharp = require('sharp')
const User = require('./../models/userModel')
const AppError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')

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

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    
    sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`, (err) => {
        if (err) {
            // Handle the error, e.g., by passing it to the error-handling middleware
            return next(err);
        }
        // Move to the next middleware if everything is successful
        next();
    })
}

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe =  catchAsync(async (req, res, next) => {
    console.log(req.file);
    console.log(req.body);

    //create error if user POSTs password data
    if(req.body.password || req.body.confirmPassword)
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400))

    //update user document
    const filterBody = filterObj(req.body, 'name', 'email');

    if(req.file) filterBody.photo = req.file.filename

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    })     //since this time we only changing non compulassary field we ca use findbyidandupdate becuase it is not needed to run middleware
    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(200).json({
        status:'success',
        data:null
    })
})

exports.getalluser = factory.getAll(User)

exports.getauser = factory.getOne(User)

exports.addauser = factory.createOne(User)

exports.updateauser =  factory.updateOne(User)

exports.deleteauser =  factory.deleteOne(User)
