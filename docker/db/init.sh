#/bin/sh

createdb -U postgres mastodon
createdb -U postgres misskey
pg_restore -U postgres -d mastodon /docker-entrypoint-initdb.d/dumps/mastodon.dump
pg_restore -U postgres -d misskey /docker-entrypoint-initdb.d/dumps/misskey.dump
touch /var/lib/postgresql/data/db_initialized
