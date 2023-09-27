const fs = require('fs')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require("./../../models/tourModel");
const { log } = require('console');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

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

//file reading
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//IMPORT DATA INTO DATA BASE

const import_data = async () => {
    try {
      await User.create(users, { validateBeforeSave: false });
      await Tour.create(tours);
      await Review.create(reviews);
      console.log("data has been added");
    } catch (err) {
      console.log(err);
    }
} 

//Deleting all data

const delete_data = async () => {
    try {
        await User.deleteMany();
        await Tour.deleteMany();
        await Review.deleteMany();
        console.log("Data has been deleted");
    } catch (error) {
        console.log(error);
    }
}
if(process.argv[2] === '--import'){
    import_data();
    console.log("data successfully uploaded");
}
if(process.argv[2] === '--delete'){
    delete_data();
}
console.log(process.argv);