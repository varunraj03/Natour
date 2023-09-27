const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const API_feature = require('./../utils/apifeatures')


exports.deleteOne = Model => catchAsync(async (req, res, next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id)
    if(!doc){
        return next( new AppError('No document found with that ID', 404))
    }    
    res.status(204).json({                  //204 means no data to return
            status: 'success',
            data: null
        })
}
);

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,  //will sent back the newly updated data
        runValidators: true   //will again run validation for data
    })
    if(!doc){
        return next( new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: 'status',
        data: {
            doc
        }
    })
}
)

exports.createOne = Model => catchAsync(async (req, res, next) => { 
     const doc = await Model.create(req.body); 
     res.status(201).json({
         status:'success',
         data: {
             doc
         }
     })
 })
 
exports.getOne = (Model, popOptions) => catchAsync(async (req,res, next) => {        //:id is an variable here
    let query = Model.findById(req.params.id)
    if(popOptions) query = query.populate(popOptions);           //findOne({_id: req.params.id})

    const doc = await query;
    if(!doc){
        return next( new AppError('No document found with that ID', 404))
    }   
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
}
)

exports.getAll = Model => catchAsync(async (req, res, next)=>{
    // execute Query
    let filter = {};                    //for review of specific tour
    if(req.params.tourId) filter = {Tour: req.params.tourId}

    const feature = new API_feature(Model.find(filter), req.query)
    .filter()
    .sort()
    .limiting()
    .pagging();

    const doc = await feature.query;

res.status(200).json({
    status: 'success',
    results: doc.length,
    data:{
        doc
    }
})

}
)