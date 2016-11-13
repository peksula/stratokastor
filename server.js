require( './server/db' )
var express = require('express')
var bodyParser = require('body-parser')
var uploader  = require('./server/uploader')
var route = require( './server/routeModel' )
var dataAccess = require('./server/dataAccess')

var Kastor = function() {

    var self = this

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1')
            self.ipaddress = "127.0.0.1"
        }
    }

    /**
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('Received %s - terminating application.', sig)
           process.exit(1)
        }
        console.log('Node server stopped.')
    }


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator()
        });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() {
                self.terminator(element)
            })
        })
    }

    /**
     *  Create the routing table entries.
     */
    self.createRoutes = function() {
        self.app.get('/', function(req, res) {
            res.sendfile('./public/index.html')
        })
        self.app.post('/routes', self.upload_file, self.database_save_route)
        self.app.post('/routes/:id', self.database_update, self.database_get_list)
        self.app.get('/routes', self.database_get_list)
        self.app.get('/routes/:id', self.database_get_details)
        self.app.delete('/routes/:id', self.database_delete_route, self.database_get_list)
    }

    self.upload_file = function(req, res, next) {
        uploader.process_form(req, res, next)
    }

    self.database_update = function(req, res, next) {
        dataAccess.update_route(req, res, next, route)
    }

    self.database_get_details = function(req, res, next) {
        dataAccess.get_route(req, res, route)
    }

    self.database_save_route = function(req, res, next) {
        dataAccess.save_route(res, route)
    }

    self.database_delete_route = function(req, res, next) {
        dataAccess.delete_route(req, res, next, route)
    }

    self.database_get_list = function(req, res, next) {
        dataAccess.get_list_of_routes(res, route)
    }

    /**
     *  Initialize the server (express) and create the routes.
     */
    self.initializeServer = function() {
        self.app = express()
        self.app.use(express.static('public'))
        self.app.use(express.static('bower_components'))
        self.app.use(bodyParser.json())
        self.app.use(bodyParser.urlencoded({ extended: true }))
        
        self.createRoutes()
    }

    /**
     *  Initializes the application.
     */
    self.initialize = function() {
        self.setupVariables()
        self.setupTerminationHandlers()
        self.initializeServer()
    }

    /**
     *  Start the server.
     */
    self.start = function() {
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('Node server started on %s:%d', self.ipaddress, self.port)
        })
    }
}

var app = new Kastor()
app.initialize()
app.start()