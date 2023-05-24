const APIFeatures = require("./apiFeatures");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const document = await query;

    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: document,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // to Filter
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //TOPIC: EXCUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .sort()
      .filter()
      .limitField()
      .paginate();

    const documents = await features.query.lean();

    res.status(200).json({
      status: "success",
      result: documents.length,
      data: documents,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);

    res.status(200).json({
      status: "success",
      data: newDocument,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: document,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: document,
    });
  });

exports.notDefined = (req, res) =>
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
