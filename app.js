const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Apply all helmet middlewares for security
app.use(helmet());

// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests
const limiter = rateLimit({
  max: 100,
  // 1hrs = 60m * 60s *1000ms
  windowMs: 3600000,
  message: "Too many requests, please try again in an hour!",
});

// apply con /api url
app.use("/api", limiter);
// Use json middleware to handle convert json request to object in javasciprt
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// 3) ROUTES
app.use("/api/v1/tours", tourRouter);

app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //Here
  // NOTE: appError don't have next(), so stop here if 404
});
// If not 404 use errorController
//NOTE: Actually: module.exports = (err, req, res, next) => {}
app.use(globalErrorHandler); //The next() above is call this middleware

module.exports = app;
