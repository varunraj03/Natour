const express = require('express');
const path = require('path')
const morgan = require('morgan');
const dotenv = require('dotenv')
const AppError = require('./utils/appError')
const viewRouter = require('./routes/viewRoutes')
const tourRouter = require('./routes/tourRoute')
const userRouter = require('./routes/userRoute')
const reviewRouter = require('./routes/reviewRoute')
const globalErrorHandler = require('./Controller/errorController')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser');
const cors = require('cors')

const app = express();
dotenv.config({ path: './config.env'}); 

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.use(express.static(path.join(__dirname,'public')));      //  express.jon is a middleware that can moddify the incoming data //all pug files request data via this static route 

//MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}                                                   //3rd party middleware :- give information about the different request

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.header);
    next();
})

const limiter = rateLimit({                 //limits the rate of request for an IP so the brute force attacks dont work
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an hour'
})

app.use('/api', limiter)

// app.use(
//     helmet()
//   );

// app.use(helmet())  //setting http secuty heads  //causing a

app.use(express.json({ Limit: '10kb' }));        //body parser, reading data from body to req.body
app.use(cookieParser());

// app.use((req, res, next) => {
//     console.log(req.cookies);
//     next();
// })

//data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss // psuhing some html and js data to dbs
app.use(xss());

app.use(hpp({
    whitelist: ['duration','ratingsAverage','ratingsQuantity','maxGroupSize']
}));     //prevents parameter polution(adding multiple parameter into params)

//3)-Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);               //mounting a new router on a route

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})

app.use(globalErrorHandler);

module.exports = app;