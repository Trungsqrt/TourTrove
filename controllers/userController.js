const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const handler = require("./../utils/handler");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Update username and email
exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatepassword.",
        400
      )
    );
  }

  // Only allow to update name and email
  const filteredBody = filterObj(req.body, "name", "email");

  // Updating...
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // After update
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

// Deactive user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
  });
});

// Define these functions in different routes
exports.getUser = handler.getOne(User);
exports.updateUser = handler.updateOne(User); //not use to update password please
exports.deleteUser = handler.deleteOne(User);
exports.getAllUsers = handler.getAll(User);
// Not defined routes
exports.createUser = (req, res) => handler.notDefined(req, res);
