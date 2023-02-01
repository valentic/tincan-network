
.PHONY: help cleanup build setup update 

SHELL:=/bin/bash
VIRTENV=venv
PYTHON:=python3

help:
	@echo "Targets:"
	@echo "  setup      create production environment"
	@echo "  build      emply placeholder"
	@echo "  cleanup    remove files"

cleanup:
	rm -rf ${VIRTENV}

setup:
	${PYTHON} -m venv ${VIRTENV}; \
	. ${VIRTENV}/bin/activate; \
	pip install --upgrade pip;

