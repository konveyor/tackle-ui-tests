Tool for seeding data for UI tests.

Imported entities:

    Applications, Dependencies, Assessments, Reviews, Tag Types, Tags, Job Functions, Stakeholder Groups, Stakeholders, Business Services


Steps for import (tackle-config.yml file points to destination cluster, existing data will be removed)

    tackle clean-all
    tackle import


Use tackle-config.yml.example file as a template to set your Tackle endpoints and credentials and save it as tackle-config.yml.

Run the tackle tool: ./tackle
Supported actions

    import creates objects in the cluster from local JSON files and buckets data
    clean deletes objects uploaded to the cluster from local JSON files
    clean-all deletes ALL data 


usage: tackle [-h] [-c [CONFIG]] [-d [DATA_DIR]] [-v] [-s] [-w] [-i] [-n] [-b] [action ...]


positional arguments:
  action                One or more Tackle commands that should be executed, options: import clean clean-all

options:
  -h, --help            show this help message and exit
  -c [CONFIG], --config [CONFIG]
                        A config file path (tackle-config.yml by default).
  -d [DATA_DIR], --data-dir [DATA_DIR]
                        Local Tackle data directory path (tackle-data by default).
  -v, --verbose         Print verbose output (including all API requests).
  -s, --skip-destination-check
                        Skip connection and data check of Tackle 2 destination.
  -w, --disable-ssl-warnings
                        Do not display warnings during ssl check for api requests.
  -i, --ignore-import-errors
                        Skip to next item if an item fails load.
  -n, --no-auth         Skip Keycloak token creation, use empty Auth token in Tackle API calls.
  -b, --skip-buckets    Skip Tackle 2 Buckets content export.

