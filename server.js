var express = require('express');
var uploader  = require('./server/uploader');
require( './server/db' );
var route = require( './server/routeModel' );


/**
 *  Define the application.
 */
var Kastor = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

    /**
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('Received %s - terminating application.', sig);
           process.exit(1);
        }
        console.log('Node server stopped.');
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries.
     */
    self.createRoutes = function() {
        self.app.get('/', function(req, res) {
            res.sendfile('./public/index.html');
        });
        self.app.post('/routes', self.file_uploader, self.database_save);
        self.app.get('/routes', self.database_get_list);
        self.app.get('/routes/:id', self.database_get_details);
        self.app.delete('/routes/:id', self.database_delete, self.database_get_list);
        self.app.put('/routes/:id', self.database_update, self.database_get_details);
    };
    
    self.file_uploader = function(req, res, next) {
        uploader.process_form(req, res, next);
    };
    
    self.database_save = function(req, res, next) {
        route.create({
            title: res.locals.title,
            comment: res.locals.comment,
            weather: res.locals.weather,
            original_data: res.locals.original_data
        }, function(err, _route) {
            if (err) {
                console.log('Error creating database entry %s', err);
                res.send(err);
            }
        });
        
        res.redirect('/');
    };

    self.database_delete = function(req, res, next) {
		route.remove({
			_id : req.params.id
		}, function(err, route) {
			if (err) {
                console.log('Error removing database entry %s', err);
				res.send(err);
            }
		});
        next();
	};

    self.database_update = function(req, res, next) {
        console.log('Updating %s.', req);
		route.findByIdAndUpdate(
            req.params.id,
            { title: req.params.title, comment: req.params.comment },
            function(err, route) {
			if (err) {
                console.log('Error removing database entry %s', err);
				res.send(err);
            }
		});
        next();
	};
     
    self.database_get_details = function(req, res, next) {
		route.findById(req.params.id, function(err, route) {
			if (err) {
                console.log('Error occurred when getting a detailed route from database %s', err);
				res.send(err);
            }
			res.json(route);
		});
	};
    
    self.database_get_list = function(req, res, next) {
		route.find({}, 'title', function(err, routes) {
			if (err) {
                console.log('Error occurred when getting list from database %s', err);
				res.send(err);
            }
			res.json(routes);
		});
	};
    

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.app = express();
        self.app.use(express.static('public'));
        self.createRoutes();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };
    
    /**
     *  Initializes the application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };
    
    /**
     *  Start the server.
     */
    self.start = function() {
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('Node server started on %s:%d', self.ipaddress, self.port);
        });
    };

};   /*  Application.  */

/**
 *  main():  Main code.
 */
var app = new Kastor();
app.initialize();
app.start();
