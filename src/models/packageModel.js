const mongoose = require('mongoose');
const optionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Option name is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price value is required'],
  },
});

const packageSchema = mongoose.Schema(
  {
    packageName: {
      type: String,
      required: [true, 'Please enter your Package name!'],
      minlength: [3, 'Name must be more than 3 letters'],
      maxlength: [255, 'Name must be less than 255 letters'],
    },
    description: String,
    price: {
      type: Number,
    },
    offer: {
      type: Number,
    },
    packagePhoto: String,
    customizePackage: [
      {
        name: String,
        options: [optionSchema],
      },
    ],
    service: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Service',
    },
  },

  {
    timestamps: true,
  }
);

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;
