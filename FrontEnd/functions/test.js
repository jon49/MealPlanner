exports.handler = (event, context, callback) => {
    callback(null, {
        statusCode: 200,
        body: "\nYes!\n"// JSON.stringify(JSON.parse(event.body)),
    });
};

