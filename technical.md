# Technical Docs

## Data Structure in PostgreSQL
All of our data is managed by modules, which we have published as plugins. Below, we will list out the data and their types, contained per table, per plugin.

### List of Plugins:
* [tags-system](###tags-system)
* [pg-people](###pg-people)
* [pg-challenges](###pg-challenges)
* [pg-insights](###pg-insights)

### [tags-system](npmjs.com/package/tags-system)
#### tags
```js
id SERIAL PRIMARY KEY,
name VARCHAR(50) NOT NULL,
active BOOLEAN NOT NULL
```
#### categories
```js
id SERIAL PRIMARY KEY,
name VARCHAR(50) NOT NULL,
active BOOLEAN NOT NULL
```
#### tags_categories
```js
tags_id INTEGER REFERENCES tags (id),
categories_id INTEGER REFERENCES categories (id),
PRIMARY KEY (tags_id, categories_id)
```

### [pg-people](npmjs.com/package/pg-people)
#### organisations
```js
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
logo_url TEXT,
mission_statement VARCHAR(200),
active BOOLEAN NOT NULL
```
#### people

```js
id SERIAL PRIMARY KEY,
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('admin', 'primary', 'secondary')),
email VARCHAR(100) NOT NULL UNIQUE,
phone VARCHAR(100),
password VARCHAR(100),
org_id INTEGER REFERENCES organisations (id),
job_title VARCHAR(80),
last_login BIGINT,
active BOOLEAN NOT NULL,
account_activated BOOLEAN NOT NULL
```

#### tags_organisations
```js
tags_id INTEGER REFERENCES tags (id),
organisations_id INTEGER REFERENCES organisations (id)
```

### [pg-challenges](npmjs.com/package/pg-challenges)

#### challenges
```js
id SERIAL PRIMARY KEY,
title VARCHAR(50) NOT NULL,
description TEXT NOT NULL,
date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
org_id INTEGER REFERENCES organisations (id) NOT NULL,
creator_id INTEGER REFERENCES people (id) NOT NULL,
active BOOLEAN NOT NULL
```

#### tags_challenges
```js
tags_id INTEGER REFERENCES tags (id),
challenges_id INTEGER REFERENCES challenges (id)
```

### [pg-insights](npmjs.com/package/pg-insights)

#### insights
```js
id SERIAL PRIMARY KEY,
title VARCHAR(100) NOT NULL,
url TEXT,
type VARCHAR(30) NOT NULL
CHECK (type IN ('CASE STUDY', 'PAPER', 'PRESENTATION', 'REPORT', 'VIDEO', 'WORKSHOP SUMMARY')),
author VARCHAR(50),
org_id INTEGER REFERENCES organisations (id),
creator_id INTEGER REFERENCES people (id),
date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
active BOOLEAN NOT NULL,
resource BOOLEAN NOT NULL
```

#### tags_insights
```js
tags_id INTEGER REFERENCES tags (id),
insights_id INTEGER REFERENCES insights (id)
```

## Folder Structure
```js
doc/
  img/ // contains all imgs used in our README.md

public/
  assets/ // contains all icons
    *.svg
  css/
    main.css
  js/
    index.js

server/
  email-templates/
  handlers/
    auth/
    challenges/
    insights/
    orgs/
    people/
    shared/  
  models/ //contains all Joi-validation models
  routes/
    auth.js
    challenges.js
    generic.js
    insights.js
    orgs.js
    people.js
  auth.js
  config.js
  email.js
  good-console-options.js
  hapi-error-config.js
  routes.js
  s3.js
  server.js
  start.js

templates/
  layout/
  helpers/
  partials/
  views/
    browse/
    challenges/
    insights/
    organisations/
    people/

test/
  browse/
  challenges/
  helpers/
    setup/
  insights/
  organisations/
  people/
  server/
  unit/
  runner.js
```
