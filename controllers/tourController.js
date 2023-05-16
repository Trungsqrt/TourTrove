const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

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

exports.getAllTours = catchAsync(async (req, res, next) => {
  //TOPIC: EXCUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .sort()
    .filter()
    .limitField()
    .paginate();

  const tours = await features.query.lean();

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: "guides",
    select: "-__v",
  });
  //EX: if id is not an objectID MongoDB, immediately catch by catchAsync
  // EX: if id is correctly format and not found -> catchAsync not catch
  if (!tour) {
    return next(new AppError("No tour with that id", 404));
  }

  res.status(200).json({
    status: "success",
    tour: tour,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(200).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError("No tour with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError("No tour with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: tour,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // match with all tours has ratingsAverage >= 4.5
    // {
    //   $match: { ratingsAverage: { $gte: 4.5 } },
    // },
    {
      $group: {
        _id: { $toUpper: "$difficulty" }, //NOTE: group by difficult
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
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
