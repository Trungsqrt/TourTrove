const fs = require("fs");
const Tour = require("../models/tourModel");

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //NOTE: BUILD QUERY
    //EX:  localhost:3000/api/v1/tours/?id="123" => queryObj{id: "123"}
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    //NOTE: 1. ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);

    // match is just gte or gt or lte or lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(queryStr);
    // console.log(JSON.parse(queryStr));

    // NOTE: IT JUST CREATE A QUERY OBJECT, AND IT NOT RUN YET NOTE: add .exec() to execute
    // SUB: same EX: await MyModel.find({ name: 'john', age: { $gte: 18 } });
    let query = Tour.find(JSON.parse(queryStr));

    // SUB: same EX: await MyModel.find({ name: 'john', age: { $gte: 18 } }).exec();

    //NOTE: 2. SORTING
    if (req.query.sort) {
      // get something in url after base url ?sort=price
      // sort by req.query.sort: price, tag, category....
      // query.sort can have multiple sort (EX: priority search price, tag...)
      // EX: localhost:3000/api/v1/tours?sort=price
      // EX: localhost:3000/api/v1/tours?sort=price,category
      // NOTE: /tours?sort=price is increase . /tours?sort=-price is decrease
      // But need to handle it
      const sortBy = req.query.sort.split(",").join(" ");

      query = query.sort(sortBy);
    } else {
      query = query.sort("createdAt");
    }

    // NOTE: FIELD LIMITING
    //EX: localhost:3000/api/v1/tours/?fields=name,duration,difficult,price
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      // console.log(fields);
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // NOTE: PAGINATION
    const page = req.query.page * 1 || 1; //if ?page in url is exist, get it, if not = 1
    const limit = req.query.limit * 1 || 5;

    // page 1: 1-5   page 2: 6-10
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error("This page does not exist");
    }

    //NOTE: EXCUTE QUERY
    const tours = await query.lean();
    // console.log("tours: ", tours);

    res.status(200).json({
      status: "success",
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "success",
      tour: tour,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      data: tour,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};
