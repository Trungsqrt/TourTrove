const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const handler = require("../utils/handler");

// Don't call until apply this on tourRoutes
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "failed",
      message: "Missing name or price",
    });
  }
  next();
};

// called
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,-price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = handler.getAll(Tour);

// multiple populate
// exports.getTour = handler.getOne(Tour, [{ path: "reviews" }, { path: "guides" }]);

// single populate
exports.getTour = handler.getOne(Tour, { path: "reviews" });

exports.createTour = handler.createOne(Tour);

exports.updateTour = handler.updateOne(Tour);

exports.deleteTour = handler.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  // NOTE: Aggregate = groupby sql
  // operation 1 -> operation 2 -> operation n -> output
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: { $toUpper: "$difficulty" }, //NOTE: group by difficult
        numTours: { $sum: 1 }, //sum of all documents
        numRatings: { $sum: "$ratingsQuantity" }, // sum of ratingsQuantity
        avgRating: { $avg: "$ratingsAverage" }, //average of raingAverage
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" }, //min price
        maxPrice: { $max: "$price" }, //max price
      },
    },
    {
      $sort: { avgPrice: 1 }, //sort by avgPrice, asc
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2023, 2022, 2021,...

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" }, //get month and group by month
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      // add month field
      $addFields: { month: "$_id" },
    },
    {
      // hide _id field
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});
