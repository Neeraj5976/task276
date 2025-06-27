#!/bin/bash
docker build -t dashboard_campaign .
docker container prune -f
docker run --rm -p 5173:5173 dashboard_campaign
