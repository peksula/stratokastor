var Busboy  = require('busboy');
var parser = require('./formParser');

exports.process_form = function (req, res, next) {
    var busboy = new Busboy({ headers: req.headers });
    var uploaded_content = '';
    var fieldsArray = {}
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        file.on('data', function (data) {
            uploaded_content += data;
            // console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        });
    
        file.on('end', function () {
            // Empty
        });
    });

    // Listen for event when Busboy finds a non-file field.
    busboy.on('field', function (fieldname, val) {
        fieldsArray[fieldname] = val;
    });
    
    busboy.on('finish', function () {
        parser.formToResLocals(fieldsArray, res.locals);
        next();
    });
    
    req.pipe(busboy);
  };