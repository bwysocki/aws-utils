'use strict';

console.log('Loading function');

const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

function putObjectToS3(bucket, key, data){
    var s3 = new aws.S3();
        var params = {
            Bucket : bucket,
            Key : key,
            ACL: "public-read",
            //ContentType: 'text/html',
            Body : data
        }
        s3.putObject(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
        });
}

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
            var lastKey = key.replace('s3-build/build/', '')
            putObjectToS3('storeme-test-static', lastKey, data.Body)
            console.log('CONTENT TYPE:', data, lastKey);
            callback(null, data.ContentType);
        }
    });
};
