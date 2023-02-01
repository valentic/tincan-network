
.PHONY: help cleanup build setup

SHELL:=/bin/bash

help:
	@echo "Targets:"
	@echo "  setup      create development environment"
	@echo "  build      create "
	@echo "  cleanup    remove build files"

cleanup:
	rm -rf build node_modules
	find . -type f -name '*.bak' -delete;
	find . -type f -name '*.log' -delete;

build:	
	yarn build	

setup:
	yarn install	


