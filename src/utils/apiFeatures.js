class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    //1) Filtering
    const queryStringObj = { ...this.queryString };
    const excludsFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "location",
      "keyword",
      "category",
    ];
    excludsFields.forEach((field) => delete queryStringObj[field]);
    // Apply filteration using [gte|| gt||lte||lt]
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};
      if (modelName === "Services") {
        query.$or = [
          { businessName: { $regex: this.queryString.keyword, $options: "i" } },
          { about: { $regex: this.queryString.keyword, $options: "i" } },
          { location: { $regex: this.queryString.keyword, $options: "i" } },
          // { phoneNumber: { $regex: this.queryString.keyword, $options: "i" } },
        ];
      } else {
        query = {
          businessName: { $regex: this.queryString.keyword, $options: "i" },
        };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }
  location(modelName) {
    if (this.queryString.location) {
      let query = {};
      query = {
        location: { $regex: this.queryString.location, $options: "i" },
      };

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  category() {
    if (this.queryString.category) {
      let query = {};
      query = {
        businessCategory: {
          $regex: this.queryString.category,
          $options: "i",
        },
      };

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  sort() {
    //2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    //3) Fields Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  paginate(countDocuments) {
    //5) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Pagination result
    const pagination = {};
    pagination.currntPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.prev = page - 1;
    }
    // Build query
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
