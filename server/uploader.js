var Busboy  = require('busboy');

exports.process_form = function (req, res, next) {
    var busboy = new Busboy({ headers: req.headers });
    var uploaded_content = '';
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        file.on('data', function (data) {
            uploaded_content += data;
        });
    
        file.on('end', function () {
            // Intentionally left empty
        });
    });

    // Listen for event when Busboy finds a non-file field.
    busboy.on('field', function (fieldname, val) {
        res.locals[fieldname] = val;
    });
    
    busboy.on('finish', function () {
        res.locals.original_data = uploaded_content; // the uploaded file is not part of form fields
        next();
    });
    
    req.pipe(busboy);
  };