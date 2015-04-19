arkivo-sufia
============
[![Build Status](https://travis-ci.org/inukshuk/arkivo-sufia.svg?branch=master)](https://travis-ci.org/inukshuk/arkivo-sufia)
[![Coverage Status](https://coveralls.io/repos/inukshuk/arkivo-sufia/badge.svg)](https://coveralls.io/r/inukshuk/arkivo-sufia)

A Zotero/Arkivo plugin to connect to Project Hydra services

Quickstart
----------
Install `arkivo-sufia` and (optionally) `hiredis` with NPM:

    $ npm install arkivo-sufia hiredis

Add a minimal configuration file, e.g., `config/default.json`:

    {
      "arkivo": {
        "plugins": [ "arkivo-sufia" ]
      }
    }

You can also configure the plugin's default settings in your
config file:

    {
      "arkivo": {
        "plugins": [ "arkivo-sufia" ],

        "sufia": {
          "base": "http://localhost:3000",

          "create": "/api/items",
          "update": "/api/items/:id",
          "delete": "/api/items/:id",

          "mimetypes" [
            "application/pdf"
          ]
        }
      }
    }

For more configuration options, please consult Arkivo's
[documentation](https://github.com/inukshuk/arkivo#configuration).

Now you start your Arkivo service:

    $ $(npm bin)/arkivo up

To ensure that the Sufia plugin has been loaded, you can
check the output of:

    $ $(npm bin)/arkivo-plugins list

Subscriptions
-------------

### JSON API
You can create subscriptions using Arkivo's JSON API. For example,
consider the following POST to `http://localhost:8888/api/subscription`:

    {
      "url": "/users/<zotero-user>/collections/<collection>/items",
      "key": "<zotero-api-key>",
      "plugins": [
        {
          "name": "sufia",
          "options": {
            "token": "<sufia-access-token>"
          }
        }
      ]
    }

Note that you can additionaly pass a `base` URL for each subscription;
this allows you to pin individual subscriptions to Sufia hosts other
than the default one.

### Command line
Alternatively, use the command line to add you subscriptions (and issue
a sync request if Arkivo is already running):

    $ $(npm bin)/arkivo /users/<zotero-user>/collections/<collection>/items \
      -K <zotero-api-key> \
      -P sufia:\"token\":\"<sufia-access-token>\"

    $ $(npm bin)/arkivo sync -d

