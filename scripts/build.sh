#!/usr/bin/env bash
bash set -e
PATH=$(yarn bin):$PATH

babel --source-maps -d lib src
flow-copy-source -v src lib