class API_feature{
    constructor(query, querystr){
        this.query = query;
        this.querystr = querystr;
    }

    filter(){
        const queryObj = JSON.parse(JSON.stringify(this.querystr));
        const excludedField = ['page', 'sort', 'limit', 'fields'];
        excludedField.forEach(el => delete queryObj[el]);

        //advance filtering
        let querystr = JSON.stringify(queryObj);
        querystr = querystr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`); 
        
        // set Query
        this.query = this.query.find(JSON.parse(querystr));

        return this;
    }

    sort(){
        if(this.querystr.sort){
            const sortby = this.querystr.sort.split(',').join(" ");
            this.query = this.query.sort(sortby);
        }
        else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limiting(){
        if(this.querystr.fields){
            const queryfield = this.querystr.fields.split(",").join(" ");
            this.query = this.query.select(queryfield)
        }
        else{
            this.query = this.query.select('-__v')  //- means excluding this field
        }
        return this;
    }

    pagging(){
        const page = this.querystr.page * 1 || 1;
        const limit = this.querystr.limit * 1 || 100;
        const skip  = (page - 1)*limit;

        //setting pagging
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = API_feature