-- Delete tables
DROP TABLE IF EXISTS tags_challenges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS organisations CASCADE;
DROP TABLE IF EXISTS people CASCADE;

-- Create table DUMMY ORG TABLE
CREATE TABLE IF NOT EXISTS organisations (
  id SERIAL PRIMARY KEY
);

-- Create table DUMMY PEOPLE TABLE
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY
);

-- Create table
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  date BIGINT NOT NULL,
  org_id INTEGER REFERENCES organisations (id) NOT NULL,
  creator_id INTEGER REFERENCES people (id) NOT NULL,
  active BOOLEAN NOT NULL
);

-- Create table
CREATE TABLE IF NOT EXISTS tags_challenges (
  tag_id INTEGER REFERENCES tags (id),
  challenge_id INTEGER REFERENCES challenges (id)
);
