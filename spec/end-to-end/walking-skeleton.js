var expect = require("expect.js");

var Helper = function(browser, wd){
    this.browser = browser;
    this.wd = wd;
};

Helper.prototype = {
    setContext: function(context){
	this.browser.findElement(this.wd.By.name('context')).sendKeys(context);
    },
    setCode: function(code){
	this.browser.findElement(this.wd.By.name('code')).sendKeys(code);
    },
    setLocals: function(locals){
	this.browser.findElement(this.wd.By.name('locals')).sendKeys(locals);	
    },
    getResults: function(){
	return this.browser.findElement(this.wd.By.name('results')).getAttribute("value");
    },
    runBundle: function(code, context, locals){
	this.setCode(code);
	this.setContext(context);
	this.setLocals(locals);

	this.browser.findElement(this.wd.By.name('results')).sendKeys("prerun");

	this.browser.findElement(this.wd.By.name('run-code')).click();
    }
};

describe("Engine.js IDE", function(){
    beforeEach(function(done){
	this.wd = require('../vendor/webdriver/webdriver');

	this.browser = new this.wd.Builder().
	    usingServer('http://127.0.0.1:4444/wd/hub').
	    withCapabilities({
		'browserName': 'firefox',
		'version': '',
		'platform': 'ANY',
		'javascriptEnabled': true
	    }).
	    build();

	this.helper = new Helper(this.browser, this.wd);

	this.app = require("../../app");
	this.app.start(done);
    });

    afterEach(function(){
	//console.log("quit");
	this.app.stop();
    });

    describe("As a user visiting the dashboard", function(){
	beforeEach(function(){
	    this.browser.get("http://localhost:3000/");
	});
	describe("When I submit valid code, context, and locals", function(){
	    beforeEach(function(){
		var code = "add(2,2)";
		var context = "(function(locals){ return { add:function(a,b){ return a+b; } } })";
		var locals = "{}";
		
		this.helper.runBundle(code, context, locals);
	    });

	    it("Then the evaluted code should appear in the results section", function(done){
		this.browser.sleep(1000);
		this.helper.getResults().then(function(text){
		    expect(text).to.be("4");
		    done();
		});
		this.browser.quit();
	    });
	});

	describe("When I submit code with a syntax error", function(){
	    beforeEach(function(){
		var code = "add(2,";
		var context = "(function(locals){ return { add:function(a,b){ return a+b; } } })";
		var locals = "{}";

		this.helper.runBundle(code, context, locals);
	    });

	    it("Then an error message should appear in the results section", function(done){
		this.browser.sleep(1000);
		this.helper.getResults().then(function(text){
		    expect(text).to.contain("SyntaxError");
		    done();
		});
		this.browser.quit();
	    });
	});

	describe("When I submit a context that is not a function value", function(){
	    beforeEach(function(){
		var code = "add(2,2)";
		var context = "function(locals){ return { add:function(a,b){ return a+b; } } }";
		var locals = "{}";

		this.helper.runBundle(code, context, locals);
	    });

	    it("Then an error message should appear in the results section", function(done){
		this.browser.sleep(1000);
		this.helper.getResults().then(function(text){
		    expect(text).to.contain("SandboxError");
		    done();
		});
		this.browser.quit();
	    });
	});
    });
});