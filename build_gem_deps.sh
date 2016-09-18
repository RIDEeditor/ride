#!/bin/bash

cd ./rails_db/
bundle install
gem build rails_db.gemspec
cd ../railroady/
bundle install
gem build railroady.gemspec
