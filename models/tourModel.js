const mongoose = require("mongoose");
const slugify = require("slugify");

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
      // select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(() => {
  return this.duration / 7;
});
// EX: Cách sử dụng:
// Tour.findOne({ name: 'Tour Name' }, (err, tour) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(tour.durationWeeks); // Truy cập vào trường ảo "durationWeeks"
//   }
// });

// NOTE: Giống trigger. Khi chuẩn bị save 1 document vào collection, sẽ gọi
// trigger previous an action
tourSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true }); // tạo 1 document slug chứa name slugify
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
