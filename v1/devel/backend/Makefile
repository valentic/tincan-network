
.PHONY: help cleanup build setup update 

SHELL:=/bin/bash
VIRTENV=.venv

help:
	@echo "Targets:"
	@echo "  setup      create development environment"
	@echo "  update     update development environment"
	@echo "  build      create Python wheel"
	@echo "  cleanup    remove build files"

cleanup:
	rm -rf dist build src/*.egg-info src/instance ${VIRTENV}
	find src -type f -name '*.pyc' -delete
	find src -type f -name '*.bak' -delete
	find src -name __pycache__ -type d -exec rm -r {} +
	rm src/server/static
	rm src/server/templates

build:	
	uv build
	uv pip compile pyproject.toml -o dist/requirements.txt

setup:
	uv sync 
	ln -sf ../../../frontend/build/static src/server/static
	ln -sf ../../../frontend/build src/server/templates

update:
	uv sync 


