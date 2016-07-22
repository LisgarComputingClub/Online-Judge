## Lisgar Collegiate Institute Online Judge [![Build Status](https://travis-ci.org/LisgarComputingClub/Online-Judge.svg?branch=master)](https://travis-ci.org/LisgarComputingClub/Online-Judge)

This is a project started by the 2015-2016 Lisgar Computing Club (LCC) heads. The aim of this project is to create an online judge specific to the LCC, to be used for computer science classes, as well as in preparation for contests such as the CCC and the ECOO.

## How to install

On Ubuntu, run the following console command:
```shell
sudo apt-get install git && git clone https://github.com/LisgarComputingClub/Online-Judge-Install.git; cd Online-Judge-Install; bash install.sh && cd ../Online-Judge
```


The install script code can be found [here](https://github.com/LisgarComputingClub/Online-Judge-Install).

## Command Line Arguments
- Server update check delay
    - Sets the time in milliseconds in between server update checks.
    - Example: ```node main serverUpdateDelay=3600000```
    - Sets the server update check delay to 1 hour (3600000 milliseconds)
- Language update delay
    - Sets the time in milliseconds in between language update checks.
    - Example: ```node main updateLanguageDelay=3600000```
    - Sets the language update delay to 1 hour (3600000 milliseconds)
    
### How it Works

The server is written in Node.js, with Express for the web server, TingoDB for the database, Bootstrap for the front end, EJS as the view engine, Passport for authentication, Socket.io for communication inbetween the server and browser, and Hackerrank to run code. Users will be able to login, solve and create problems.
