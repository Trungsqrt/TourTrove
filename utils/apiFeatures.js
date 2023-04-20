class APIFeature {
  constructor(query, queryString) {
    //NOTE: Object query, initial value by Tour.find();
    this.query = query;

    //NOTE: The query paramater get from req.query (URL)
    this.queryString = queryString;
  }

  //TOPIC: 1. ADVANCED FILTERING
  filter() {
    //EX:  localhost:3000/api/v1/tours/?id="123" => queryObj{id: "123"}
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    //BUILD QUERY
    let queryStr = JSON.stringify(queryObj);

    // match is just gte or gt or lte or lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // NOTE: IT JUST CREATE A QUERY OBJECT, AND IT NOT RUN YET NOTE: add .exec() to execute
    // SUB: same EX: await MyModel.find({ name: 'john', age: { $gte: 18 } });
    this.query = this.query.find(JSON.parse(queryStr));

    // SUB: same EX: await MyModel.find({ name: 'john', age: { $gte: 18 } }).exec();

    return this;
  }

  //TOPIC: 2. SORTING
  sort() {
    if (this.queryString.sort) {
      /*
       * get something in url after base url ?sort=price
       * sort by req.query.sort: price, tag, category....
       * query.sort can have multiple sort (EX: priority search price, tag...)
       * EX: localhost:3000/api/v1/tours?sort=price
       * EX: localhost:3000/api/v1/tours?sort=price,category
       * NOTE: /tours?sort=price is increase . /tours?sort=-price is decrease
       * But need to handle it
       */

      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("");
    }

    return this;
  }

  // TOPIC: FIELD LIMITING
  limitField() {
    //EX: localhost:3000/api/v1/tours/?fields=name,duration,difficult,price
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      // console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  // TOPIC: PAGINATION
  paginate() {
    const page = this.queryString.page * 1 || 1; //if ?page in url is exist, get it, if not = 1
    const limit = this.queryString.limit * 1 || 100;

    // limit 5 -> page 1: 1-5   page 2: 6-10
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeature;
