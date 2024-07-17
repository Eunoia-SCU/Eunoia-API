const mongoose = require('mongoose');

const requestSchema = mongoose.Schema(
  {
    Notes: {
      type: String,
      // minlength: [10, 'Notes is too Short'],
      // maxlength: [5000, 'Notes is too long'],
    },
    status: {
      type: String,
      enum: ['Accepted', 'Declined', 'Pending', 'Paid', 'Cash-Payment'],
      default: 'Pending',
    },
    bookingDate: {
      type: String,
      default: Date.now,
    },
    totalPriceAfterDiscount: {
      type: Number,
    },
    reference_id: {
      type: String,
    },
    options: [
      {
        title: String,
        price: Number,
        _id: false,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Package',
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
requestSchema.pre(/^find/, function (next) {
  this.populate({ path: 'package', select: 'packageName' });
  next();
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
