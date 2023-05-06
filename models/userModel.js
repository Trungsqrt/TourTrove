const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: "{VALUE} is not a valid email",
    },
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  // Only works on CREATE and UPDATE!!!
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function(next) {
  // Only run this function if password was actually modified
  // The case change Email or something... Don't need to re-hash password => next();
  if (!this.isModified("password")) return next();

  // Hash the password with saltRound = 10
  const passwordHashed = await bcrypt.hash(this.password, 10);

  this.password = passwordHashed;
  this.passwordConfirm = undefined;
  next();
});

// Trigger for update password
userSchema.pre("save", function(next) {
  // Skip it if this is a new user creation process or not a password change
  if (!this.isModified("password") || this.isNew) return next();

  // passwordChangedAt value is updated slower than the process of saving the User object
  this.passwordChangedAt = Date.now() - 2000;
  next();
});

// userSchema.pre(/^find/, function(next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      // change format time (ms -> s), 10 is Decimal
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // token created at 1h, password changed at 3h. So token is invalid
    // or token created at 30/4, password changed at 1/5. So token is invalid
    return JWTTimestamp < changedTimestamp;
  }

  // if password hasn't been changed
  return false;
};

// NOTE: resetToken
userSchema.methods.createPasswordResetToken = function() {
  // generate a random data, and convert to hex
  const resetToken = crypto.randomBytes(32).toString("hex");

  // hash the resetToken with sha256 to hexadecimal and assign to passwordResetToken
  // send resetToken to user -> hash it and compare with passwordResetToken
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // at this time + 10mins (10m * 60s * 1000ms)
  this.passwordResetExpires = Date.now() + 600000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
