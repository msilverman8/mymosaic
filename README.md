# mymosaic
mosaic-ify an image!

# set - up notes

## python
This project uses pipenv to manage dependencies. go ahead and install pipenv on your machine if you don't have it and then run pipenv install in the same directory as the pipfile.

###### pycharm
for project interpreter add new pipenv environment
for setting up the run configs
  create new python configuration and enter the following
    script path: browse to the manage.py file
    parameters: runserver
      *parameter note*
      default is runserver localhost:8000 but if you want to change it just put those changes in parameters
      e.g. > runserver 0.0.0.0:8080

###### .env
this project uses dotenv to keep passwords separate from repository code
take a look at the .env.example file and create your own .env file and place it in the same directory

###### database
this project uses postgres, download postgres and follow set up instructions
make sure to create a db admin user and add those credentials to the .env file
follow django instructions to load existing db.json file or create you own and update DATABASE_NAME value in your .env file
database structure is not finalized and may change in the future

###### django
go ahead and create a django superuser to access the django admin page

## JavaScript
these instructions are only necessary if planning to edit js files.
This project uses gulp to compile all separate js files into one / gather vendor js from node_modules
if editing the js files, download node and npm, install dependencies, and take a look at the gulp file to find the scripts to run. 
