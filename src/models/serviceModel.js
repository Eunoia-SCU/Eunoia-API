const mongoose = require('mongoose');
const ServiceSchema = mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Please enter your Service name!'],
      minlength: [3, 'Too Short Service name'],
      maxlength: [225, 'Too long Service name'],
    },
    about: {
      type: String,
      minlength: [10, 'About is too Short'],
      maxlength: [5000, 'About is too long'],
    },
    location: {
      type: String,
      minlength: [3, 'Location is too short'],
      maxlength: [1024, 'Location is too long'],
    },
    businessCategory: {
      type: String,
      enum: [
        'Venues',
        'Photographers',
        'Event Planners',
        'DJs',
        'Makeup Artists',
        'Food',
        'Hair Stylists',
        'Other',
      ],
      minlength: [3, 'Too long category name'],
      maxlength: [1024, 'Too long category name'],
    },
    phoneNumber: {
      type: String,
      unique: [
        true,
        'Phone Number already exist ,Please enter another number!',
      ],
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
    },
    imageCover: {
      type: String,
    },
    images: {
      type: [String],
    },
    startFrom: {
      type: String,
    },
    latitude: String,
    longitude: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Mongoose query middleware
// ServiceSchema.pre(/^find/, function (next) {
//   const Service = this;
//   Service.populate({ path: "owner", select: "name avatar -_id" });
//   next();
// });

ServiceSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'service',
  localField: '_id',
});

ServiceSchema.virtual('packages', {
  ref: 'Package',
  foreignField: 'service',
  localField: '_id',
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;
