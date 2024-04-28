class APIFeatures {
  constructor(query, queryString) {
    // Mongoose query
    this.query = query;
    // Query object created from the query params in the URL
    this.queryString = queryString;
  }

  filter() {
    // Copy the query object to not manipulate it directly
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // Keep only fields related to filtering
    excludedFields.forEach((field) => delete queryObj[field]);
    // Stringify the queryObj to be able to find the operators easily
    let queryStr = JSON.stringify(queryObj);

    // Query with operator which is different than equal
    // How to write the operator in MongoDB
    // { difficulty: 'easy', duration: { $gte: 5 } }
    // How do we get the query object from the URL
    // { duration: { gte: '5' } }
    // Add $ to operators
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Search for documents in the collection which match the query object
    this.query = this.query.find(JSON.parse(queryStr));

    // Return the entire object to make it chainable
    return this;
  }

  sort() {
    // Use "sort=-price" to sort in descending order
    // Sort by multiple criterias
    // In mongoose the query would be written in this way
    // sort('price ratingsAverage')
    // But in browser it will be price,ratingsAverage with ,
    if (this.queryString.sort) {
      const sortingCriterias = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortingCriterias);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // Field limiting, aka "projecting"
  limitFields() {
    // How to include fields
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // How to exclude fields
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // page=2&limit=10
    // 1-10 is page 1, 11-20 is page 2
    // skip requires to pass the number of results to be skipped before
    // starting to return results
    // We skip 10 results to start from page 2 (because page 1 = 1-10)
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
