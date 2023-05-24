const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("connection successful");
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

const importDataTours = async () => {
  try {
    await Tour.create(tours);
    console.log("***tours created***");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const importDataUsers = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    console.log("***users created***");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const importDataReviews = async () => {
  try {
    await Review.create(users, { validateBeforeSave: false });
    console.log("***reviews created***");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteDataTours = async () => {
  try {
    await Tour.deleteMany();
    console.log("***tours deleted***");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteDataUsers = async () => {
  try {
    await User.deleteMany();
    console.log("***users deleted***");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteDataReviews = async () => {
  try {
    await Review.deleteMany();
    console.log("***reviews deleted***");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const importDataAll = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    await Tour.create(tours);
    await Review.create(reviews);
    console.log("***All documents imported***");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteDataAll = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log("***All documents deleted***");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--import-tours") {
  // tours
  importDataTours();
} else if (process.argv[2] === "--delete-tours") {
  deleteDataTours();
  // users
} else if (process.argv[2] === "--import-users") {
  importDataUsers();
} else if (process.argv[2] === "--delete-users") {
  deleteDataUsers();
  // reviews
} else if (process.argv[2] === "--import-reviews") {
  importDataReviews();
} else if (process.argv[2] === "--delete-reviews") {
  deleteDataReviews();
  // all
} else if (process.argv[2] === "--import-all") {
  importDataAll();
} else if (process.argv[2] === "--delete-all") {
  deleteDataAll();
}
