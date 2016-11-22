# ce100-app

[![Build Status](https://travis-ci.org/emfoundation/ce100-app.svg?branch=master)](https://travis-ci.org/emfoundation/ce100-app)
[![codecov](https://codecov.io/gh/emfoundation/ce100-app/branch/master/graph/badge.svg)](https://codecov.io/gh/emfoundation/ce100-app)
[![dependencies Status](https://david-dm.org/emfoundation/ce100-app/status.svg)](https://david-dm.org/emfoundation/ce100-app)
[![devDependencies Status](https://david-dm.org/emfoundation/ce100-app/dev-status.svg)](https://david-dm.org/emfoundation/ce100-app?type=dev)


A networking, knowledge sharing and collaboration platform for the Circular Economy 100 network, an Ellen MacArthur Foundation programme.

## _Why_?

To connect the members of the CE100!

## _Who_?

see: https://www.ellenmacarthurfoundation.org/ce100

## _What_?

A micro-social network focussed on connecting people in the Circular Economy.


## _How?_ (Implementation Notes)

This project uses the following technologies:

+ Node.js - https://nodejs.org/
+ Hapi.js - if you are new to Hapi or need a refresher, see: https://github.com/dwyl/learn-hapi
+ Redis - if you haven't used Redis before see: https://github.com/dwyl/learn-redis

### Running the Project Locally

Clone the GitHub Repository

```
git clone https://github.com/emfoundation/ce100-app.git
```
Ensure you have the required `.env` file, then run:

```sh
npm i
npm run generate-tags
npm start
```

Then, to populate the database with some mockdata, run:
```sh
npm run pgMockData
```

### Required Environment Variables

If you are unsure what an Environment Variable is, see: https://github.com/dwyl/learn-environment-variables

create a file in the root of the project called `.env`

```sh
JWT_SECRET=
TEMPLATE_DIRECTORY=./server/email-templates
SENDER_EMAIL_ADDRESS=
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```
_remember_ to add the appropriate _values_ to these keys.

> Note: if you are a team member ask Marie for the `.env` Google Doc!

### Running the Tests

To run the tests locally you will need to have a running Redis instance.
Then simply open a terminal window and type and run the following command:

```js
npm test
```

#### Executing a _Single_ Test

If you are attempting to _debug_ or _extend_ a single test,
you can _run_ a single test _file_ by executing it as node script. e.g:

```
node test/auth/auth.test.js
```

#### Adding/Updating Tags (Admin)

Please refer to the [wiki](https://github.com/emfoundation/ce100-app/wiki/Add-Update-Tags) for information on how to do this.

#### HTTP/HTTPS (Admin)

Once the domain's HTTP/TCP protocol has been decided on, it might make sense to change ```isSecure: false``` on [line5 of server/auth.js](https://github.com/emfoundation/ce100-app/blob/master/server/auth.js#L5)

## Questions?

> If you have any questions, please raise an issue: https://github.com/emfoundation/ce100-app/issues

## Features

### Browse types of tag and tags
- ```/orgs/tags```
- ```/challenges/tags```

Display all the tags by categories (or type of tags):
![list-tags](doc/img/list-tags.png)

Clicking on a category will display the list of tags linked to this category:
![list-tags-2](doc/img/list-tags-2.png)

Each tags is a link to the filter organisations or challenges pages

### Filter organisation and challenges by selected tag
- ```/orgs```
- ```/challenges```
- ```/orgs?tag=id_of_the_tag```
- ```/challenges?tag=id_of_the_tag```

Selecting one of the tags from the browse tag view will filter the organisations or challenges depending on the type of the page the user is on. The list of organisation (or challenges) are all the item where the tag selected is also linked on:
![filter-orgs](doc/img/filter-orgs.png)

If no organisations or challenges are linked to the selected tag the view will inform the user that no items have been found:
![filter-orgs](doc/img/filter-no-result.png)

>>>>>>> master
