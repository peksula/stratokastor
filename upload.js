var Busboy  = require('busboy');

exports.process_form = function (req, res, next) {
    var busboy = new Busboy({ headers: req.headers });
    var uploaded_content = '';
    var fieldsArray = {}
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        file.on('data', function (data) {
            uploaded_content += data;
            console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        });
    
        file.on('end', function () {
            console.log('Busboy completed file streaming');
        });
    });

    // Listen for event when Busboy finds a non-file field.
    busboy.on('field', function (fieldname, val) {
        fieldsArray[fieldname] = val;
        console.log('Field [' + fieldname + ']: value: ' + val);
    });
    
    busboy.on('finish', function () {
        console.log('Busboy finished parsing the form');
        // TODO: enhance the below code to be a generic loop or something
        res.locals.title = fieldsArray.title;
        res.locals.comment = fieldsArray.comment;
        res.locals.uploaded_content = uploaded_content;
        next();
    });
    
    req.pipe(busboy);
  };