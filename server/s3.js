var AWS = require('aws-sdk');
var crypto = require('crypto');
var path = require('path');
var config = require('./config.js');

AWS.config.region = config.s3.region;

function upload (payload, callback) {
  var file = payload.logo;
  var filename = payload.file_name;
  if (!file || !filename) {
    // if no file is given, we can callback and our handler will deal with it.
    return callback(null, null);
  }
  var filenameHex = filename.split('.')[0] +
  crypto.randomBytes(8).toString('hex') + path.extname(filename);
  var bucket = config.s3.bucket;
  var s3Bucket = new AWS.S3({ params: { Bucket: bucket } });
  var params = {
    Bucket: bucket,
    Key: filenameHex,
    Body: file
  };

  s3Bucket.upload(params, callback)
}

module.exports = {
  upload: upload
};
