const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const redisClient = require('../utils/redis');
const Service = require('../models/serviceModel'); // Import the Service model

// const getCacheKey = (key) => `cache:${key}`;

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findOneAndDelete({ _id: id });

    if (document) {
      if (Model.modelName === 'Review') {
        const serviceId = document.service;

        // Recalculate average ratings and quantity for the service
        await Model.calcAverageRatingsAndQuantity(serviceId);
      }
      if (Model.modelName === 'Service') {
        req.user.hasService = false;
        req.user.save();
      }

      // Invalidate the cache
      // await redisClient.del(getCacheKey(`getOne:${Model.modelName}:${id}`));
      // await redisClient.del(getCacheKey(`getAll:${Model.modelName}`));

      res.status(200).json({ item: `${document._id} : successfully deleted` });
    } else {
      return next(new AppError(`No Document for this id ${id}`, 404));
    }
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new AppError(`No document for this id ${req.params.id}`, 404)
      );
    }
    // Trigger "save" event when update document
    document.save();

    // // Invalidate the cache
    // await redisClient.del(
    //   getCacheKey(`getOne:${Model.modelName}:${req.params.id}`)
    // );
    // await redisClient.del(getCacheKey(`getAll:${Model.modelName}`));

    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const newDoc = await Model.create(req.body);

    // Invalidate the cache
    // await redisClient.del(getCacheKey(`getAll:${Model.modelName}`));

    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populationOpts = '') =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // 1) Build Query
    let query = Model.findById(id);
    if (populationOpts) {
      query = query.populate(populationOpts);
    }

    // 2) Execute Query
    const document = await query;

    if (!document) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    // Initialize similar services array
    let similar = [];

    // 3) Find Similar Services
    if (Model.modelName === 'Service') {
      const minRating = document.ratingsAverage - 0.5;
      const maxRating = 5;

      // Find services with the same location
      const services = await Service.find({
        _id: { $ne: id }, // Exclude the current document
        businessCategory: document.businessCategory,
        location: document.location, // Match based on location
        // ratingsAverage: {
        //   $gte: minRating,
        //   $lte: maxRating,
        // },
      });

      // Sort services by ratings quantity
      similar = services
        .sort((a, b) => b.ratingsAverage - a.ratingsAverage)
        .slice(0, 10); // Limit to the top 10 similar services

      console.log('Similar services:', similar);
    } else {
      console.log('Model is not Service');
    }

    // // Add similar services array to the document object
    // document.similar = similar;
    // document = await document.save();
    // Prepare response with similar services inside the document
    res.status(200).json({
      status: 'success',
      data: {
        document: {
          ...document.toObject(),
          similar,
        },
      },
    });
  });
exports.getAll = (Model, modelName = '') =>
  catchAsync(async (req, res) => {
    // const cacheKey = getCacheKey(
    //   `getAll:${Model.modelName}:${JSON.stringify(req.query)}:${modelName}`
    // );
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   return res.status(200).json(JSON.parse(cachedData));
    // }
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .location(modelName)
      .limitFields()
      .sort()
      .category();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    const response = {
      results: documents.length,
      paginationResult,
      data: documents,
    };

    // await redisClient.set(cacheKey, JSON.stringify(response));

    res.status(200).json(response);
  });
