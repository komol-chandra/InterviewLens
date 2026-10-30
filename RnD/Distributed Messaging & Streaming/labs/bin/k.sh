#!/usr/bin/env bash
# Kafka CLI inside the lab cluster. usage: bin/k.sh <broker> <tool> [args]   e.g. bin/k.sh k1 kafka-topics --bootstrap-server k1:9092 --list
b=$1; t=$2; shift 2
docker compose -p t9lab exec -T "$b" /opt/kafka/bin/"$t".sh "$@"
