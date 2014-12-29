module.exports = process.env.BP_API ||
  (process.env.NODE_ENV === 'production' ?
    'http://api.bocoup.com/v1' : '/api'
  );
