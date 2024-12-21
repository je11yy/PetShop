FROM postgres:15

COPY 01-init.sql /docker-entrypoint-initdb.d/
COPY 02-functions.sql /docker-entrypoint-initdb.d/
COPY 03-filling.sql /docker-entrypoint-initdb.d/