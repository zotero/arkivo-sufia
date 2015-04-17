arkivo-sufia
============
[![Build Status](https://travis-ci.org/inukshuk/arkivo-sufia.svg?branch=master)](https://travis-ci.org/inukshuk/arkivo-hydra)
[![Coverage Status](https://coveralls.io/repos/inukshuk/arkivo-sufia/badge.svg)](https://coveralls.io/r/inukshuk/arkivo-hydra)

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

Next POST your subscriptions to `http://localhost:8888/api/subscription`.
For example:

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

Alternatively, use the command line to add you subscriptions (and issue
a sync request if Arkivo is already running):

    $ $(npm bin)/arkivo /users/<zotero-user>/collections/<collection>/items \
      -K <zotero-api-key> \
      -P sufia:\"token\":\"<sufia-access-token>\"

    $ $(npm bin)/arkivo sync -d

