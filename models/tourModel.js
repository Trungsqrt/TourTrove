const mongoose = require("mongoose");
const slugify = require("slugify");
const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(() => {
  return this.duration / 7;
});
// EX: tour.durationWeeks

// NOTE: Giống trigger. Khi chuẩn bị save 1 document vào collection, sẽ gọi
// trigger previous an action
tourSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true }); // tạo 1 document slug chứa name slugify
  next();
});

tourSchema.pre("save", function(next) {
  // Find all users match with id
  const guidesPromise = this.guides.map(async (id) => await User.findById(id));

  // assign all user to guides
  this.guides = Promise.all(guidesPromise);

  next();
});

// QUERY MIDDLEWARE

// skip secret tours
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// populate field
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt -passwordResetToken -passwordResetExpires",
  });

  next();
});

// Aggregate hook, loại ra những document có secretTour là True
// EX: Thường dùng để loại ra isDeleted = true
tourSchema.pre("aggregate", function() {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

// NOTE: trigger after an action
// tourSchema.post("save", function(doc, next) {
//   console.log(doc);
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema, "tours");

module.exports = Tour;
