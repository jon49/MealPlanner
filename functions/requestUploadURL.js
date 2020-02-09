exports.handler = (event, context, callback) => {
    var AWS = require("aws-sdk")
    var uuid = require("uuid/v4")
    var zlib = require('zlib')
    var fs = require('fs')
    var stream = require('stream')
    var Readable = stream.Readable

    var s = new Readable()
    s.push('I love Laura!')
    s.push(null)
    var gzip = zlib.createGzip()

    AWS.config.update({region: "us-east-2"})

    var s3 = new AWS.S3()
    // var params = JSON.parse(event.body)

    var id = uuid()
    console.log(`UUID: ${id}`)

    function uploadMe() {
        var passthrough = new stream.PassThrough()
        var s3Upload = s3.upload({
            Bucket: "mealplanner.jnyman.com",
            Key: `${uuid()}/${+new Date()}.json.gz`,
            ContentType: "application/json",
            ContentEncoding: "gzip",
            Body: passthrough
        }, (err, data) => {
            if (err) {
                console.log("Error:", err)
            } else {
                console.log(`Upload Success:`, data)
            }
        })
        return passthrough
    }

    s
    .pipe(gzip)
    .on('error', err => console.log(err))
    .pipe(uploadMe())
    .on('error', err => console.log(err))

    callback(null, {
        statusCode: 200,
        headers: {
            // "Access-Control-Allow-Origin": "http://localhost:3000"
        },
        body: "I love pizza!"
    })

}
