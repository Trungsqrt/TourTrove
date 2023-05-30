const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create Compound Indexes 1 user can create only 1 review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// Create static aggregate for avarage raing calculation
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour", //group by id
        totalRating: { $sum: 1 }, //number of rating
        avgRating: { $avg: "$rating" }, //average of rating
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].totalRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 4.5,
      ratingsAverage: 0,
    });
  }
};

//NOTE:  Applied to create a new document
reviewSchema.post("save", function() {
  // refers to the constructor function of the current model
  // allows to call the static method calcAverageRatings
  this.constructor.calcAverageRatings(this.tour);
});

//NOTE: Applied to Update or Delete a document
//1.
// Retrieve the document before it is altered or deleted.
// Applied for findByIdAndUpdate/Delete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); //save the document in this.r
  next();
});

//2.
reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
