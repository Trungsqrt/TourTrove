//exports.createTour = catchAsync(async (req, res) => {});
// without catchAsync, createTour get a (return function)
// so, need a return (req,res,next){} instead of fn(req, res, next) - easy to read
module.exports = (fn) => {
  // return a function
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
