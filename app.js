var express = require("express");
var server = express.createServer();

server.configure(function(){
    server.use(express.logger());
    server.use(express.bodyParser());
    server.use(server.router);
    server.use(express.static(__dirname + '/public'));
    server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.post("/run", function(req, res){
    var code = req.body.code,
	context = req.body.context,
	locals_raw = req.body.locals;

    var locals = eval(locals_raw);

    console.log("locals raw", locals_raw);
    console.log("locals", locals);

    var task = client.createTask();
    task.setContext(context);
    task.setCode(code);
    task.setLocals({});

    task.on('eval', function(data){
	res.send(data.toString());
    });

    task.run();

});

var engine = require("engine.js").engine;
var client, task, intake, exhaust, cylinder, logging_gateway, stdout_client, logging_opts;

exports.start = function(cb){
    logging_gateway = engine.logging_gateway.create();
    stdout_client = engine.logging_stdout_client.create();
    logging_gateway.add_logger(stdout_client);

    logging_opts = {
	logging_gateway: logging_gateway
    };

    intake = engine.intake.create(logging_opts);
    exhaust = engine.exhaust.create(logging_opts);
    cylinder = engine.cylinder.create(logging_opts);
    client = engine.client.create();

    server.listen(3000, cb);
};

exports.stop = function(){
    intake.close();
    exhaust.close();
    cylinder.close();
    client.close();
};