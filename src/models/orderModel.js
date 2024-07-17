const { request } = require('http');
const mongoose = require('mongoose');
const { types } = require('util');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    request: {
      type: mongoose.Schema.ObjectId,
      ref: 'Request',
      required: [true, 'Order must belong to a request'],
    },
    requestItems: [
      {
        title: String,
        price: Number,
        _id: false,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ['cash', 'card'],
      default: 'cash',
    },
    paymentMethodGateway: {
      type: String,
      enum: ['stripe', 'paymob'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name profileImg email phone',
  }).populate({ path: 'requestItems.packagePhoto', select: 'bookingDate ' });
  next();
});

module.exports = mongoose.model('Order', orderSchema);
