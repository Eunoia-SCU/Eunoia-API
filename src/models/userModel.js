const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Service = require('./serviceModel');
const Package = require('./packageModel');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name!'],
      minlength: [3, 'Name Must be more than 3 letters'],
      maxlength: [255, 'Name Must be less than 255 letters'],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
      index: true,
      required: [true, 'Please enter your email!'],
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
      type: String,
      enum: ['user', 'manager', 'serviceProvider', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Passwords is too short. At least 8 characters.'],
      maxlength: [60, 'Passwords is too short. At least 8 characters.'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    location: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: { type: Boolean, default: false },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    hasService: {
      type: Boolean,
      default: false,
    },
    // child reference
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Service',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('Services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'owner',
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  // delete userObject.hasService;
  delete userObject.passwordResetVerified;

  return userObject;
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Delete user Service Profile with it's packages when user is removed
userSchema.pre('deleteOne', { document: true }, async function (next) {
  const user = this;
  const service = await Service.find({ owner: user._id });
  await Service.deleteMany({ owner: user._id });
  await Package.deleteMany({ service: service._id });
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
