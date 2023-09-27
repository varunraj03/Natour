const {promisify} = require('util')
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto')

const signToken = id => {
    return  jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expire: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        secure: false,           //will only send cookie over https
        httpOnly: false          //will send cookie in http format so that browser can not manupilate it!
    }

    if (process.env.NODE_ENV === 'production')  cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)

    //remoe the password
    user.password = undefined
    
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
} 

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser, 201, res);
})

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    //chech if email and password has some value

    if(!email || !password){
        return next(new AppError('Please provide email and password', 400));
    }

    //check if email and password are present in database

    const user= await User.findOne({ email }).select('+password');


    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 404))
    }

    //if everything OK, return token to client

    createSendToken(user, 201, res);
})

exports.logout = (req, res) => {
    res.cookie('jwt','loggedout',{
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync(async (req, res, next) => {
    //check if the token is there
    let token;
    if(req.headers.authorization &&  req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    }

    if(!token){
        return next(new AppError('You are not logged in! Please log in to get access', 401))
    }

    //varification of the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)  //will return a decoded user _id

    //check if user still exists
    const freshuser = await User.findById(decoded.id);
    if(!freshuser) {
        return next( new AppError('User does not exist anymore', 401));
    }
    console.log(freshuser);
    
    //check if user changed password after token was issued
    if(freshuser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User changed password recently!!'))
    }
    //grant access to protected route

    req.user = freshuser;
    res.locals.user = freshuser; 
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array['admin', 'lead-guide']
        if(!roles.includes(req.user.role))
        return next(new AppError('You do not have the permission to perform this action', 403))
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //get user based on POSTED email
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('There is no user with this email ID', 404));
    }

    //generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false })


    //send it to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n
                    If you didnt forgot the password, Please ignore the mail!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Password reset Token (valid only for 10 min).',
            message
        })
    
        res.status(200).json({
            status:'success',
            message: 'Token sent to email'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.log(err);
        return next(new AppError('There was an error sending the mail. Please try again', 500));
    }
})

exports.resetPassword = catchAsync( async (req, res, next) => {
    //Get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    //if token has not expired and there is a user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //update changedPasswordAt property of the user

    //Log the user in, send JWT

    const token = signToken(user._id);

    res.status(200).json({
        status:'success',
        token
    });
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    //get user from the collection
    const user = await User.findById(req.user.id).select('+password');

    //check if the POSTED password is coorect
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong', 401))
    }
    //if so, update Password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //Log user in, send JWT
    createSendToken(user, 201, res);
})


//only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
    try{
    //check if the token is there
    if(req.cookies.jwt){
    //varification of the token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)  //will return a decoded user _id

    //check if user still exists
    const freshuser = await User.findById(decoded.id);
    if(!freshuser) {
       return next();
    }
    
    //check if user changed password after token was issued
    if(freshuser.changedPasswordAfter(decoded.iat)){
        return next()
    }
    //grant access to protected route

    //There is alogged in user
    res.locals.user = freshuser;            //every bug template will be able to use the object
    return next();
}
next();
}catch(err){
    return next();
}
}