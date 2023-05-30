const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

console.clear();

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

// NoSQl injection attack against
app.use(mongoSanitize());

// XSS attack against
app.use(xssClean());

// Preventing param pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// 3) ROUTES
app.use("/api/v1/tours", tourRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //Here
  // NOTE: appError don't have next(), so stop here if 404
});
// If not 404 use errorController
//NOTE: Actually: module.exports = (err, req, res, next) => {}
app.use(globalErrorHandler); //The next() above is call this middleware

module.exports = app;
