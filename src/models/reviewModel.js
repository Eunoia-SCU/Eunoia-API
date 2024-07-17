const mongoose = require('mongoose');
const Service = require('./serviceModel');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, 'min rating value is 1.0'],
      max: [5, 'max rating value is 5.0'],
      required: [true, 'reviews ratings required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
    service: {
      type: mongoose.Schema.ObjectId,
      ref: 'Service',
      required: [true, 'Review must belong to service'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name avatar' });
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  serviceId
) {
  const result = await this.aggregate([
    //statge 1 get all reviews in specific service
    {
      $match: { service: serviceId },
    },
    {
      // stage 2: grouping reviews based on serviceID and clac avgRatings,ratingsQuantity
      $group: {
        _id: 'service',
        avgRatings: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Service.findByIdAndUpdate(serviceId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.service);
});
reviewSchema.post('remove', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.service);
});

module.exports = mongoose.model('Review', reviewSchema);
