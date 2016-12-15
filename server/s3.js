var AWS = require('aws-sdk');
var crypto = require('crypto');
var path = require('path');
var config = require('./config.js');

AWS.config.region = process.env.S3_REGION;

function upload (payload, callback) {
  var file = payload.logo;
  var filename = payload.file_name;
  if (!file || !filename) {
    return callback(null, null);
  }
  var filenameHex =
  filename.split('.')[0] +
  crypto.randomBytes(8).toString('hex') +
  path.extname(filename);
  var bucket = process.env.S3_BUCKET;
  console.log(bucket);
  var s3Bucket = new AWS.S3({params: {Bucket: bucket}});
  var params = {Bucket: bucket, Key: filenameHex, Body: file};
  s3Bucket.upload(params, function (err, data) {
    console.log(err, data);
    callback(null, data);
  });
}

module.exports = {
  upload
};
