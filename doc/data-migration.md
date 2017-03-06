## Suggested methods for data migration


There are a couple of different suggested methods for performing a schema migration. The first one makes use of migration files letting SQL adapt the structure and the other is the developer manually changing the plugin schema and updating the data using scripts.

### SQL Version:

- Create a timestamped migration file. `3222432341990_change_job_title.sql`
- Add the desired migration
 ```sql
 ALTER TABLE organisations RENAME COLUMN job_title TO favourite_color;
 ```
- These migration files should be run after the plugin application is started if they have not already been run.
  - -> here we would need a migrations table on each plugin to track which migrations have been run (if there is a new migration file, we want it to be run and the filename stored in the migrations table)
- Change the mock data to represent the change to the schema.
- Fix tests in the plugin.
- Fix tests in the main application.
- Ensure env variables `plugin_name_reset` are set to true on Heroku (but would need to ensure the plugin doesn't drop the table.)
- Deploy new version of application with updated plugin version.

_____________________________

### JSON (manual) version:

We currently reset our data (e.g. tags) by redeploying our app with the following configs:
(a) setting the relevant env variable (e.g. RESET_TAGS) to true and
(b) specifying a .json file that we want to reset the data to.

The idea is that once the server starts with the above config, the following would happen:
- backup and retrieve backup from heroku-postgres with `row_to_json` command
- convert data retrieved to the .json format our app currently handles
- modify data to suit the new migration (e.g. is column is deleted, remove column from each row)
- update schema in relevant plugin
- update mockdata in ce100-mock-data plugin
- fix tests in relevant plugin
- fix tests in main app
- ensure env variables `reset_plugin-name` are set to true on Heroku
- import formatted data for our current system to read in in the relevant plugin
- Deploy new version of application with updated plugin version.
