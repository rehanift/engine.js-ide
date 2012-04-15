SHELL := /bin/bash
RUN_LOCAL_SPEC = `npm bin`/mocha
RUN_WEBDRIVER_SPEC = $(RUN_LOCAL_SPEC) --timeout 0

all: test

test: end-to-end-test

end-to-end-test: 
	 $(RUN_WEBDRIVER_SPEC) spec/end-to-end/walking-skeleton.js
