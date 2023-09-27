const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {                    //uncaught exceptions like using undefined variable etc
    console.log(err.name, err.message);
    process.exit(1);
})

dotenv.config({ path: './config.env'});     //loads config environemnt variables to process variables

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD); 
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connection successful!')
})

const server = app.listen( 3000, ()=> {
    console.log('App running on port 3000');
})

process.on('unhandledRejection', err => {      //an error when a promiss is rejected!! 
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
})
