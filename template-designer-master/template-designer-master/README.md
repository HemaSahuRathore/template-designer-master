# Coverpage Application

This project contains the application to design cover page.

## Requirements

1. NPM - [Official Node.js Website](https://nodejs.org/)
2. ArangoDB - [Official ArangoDB Website](https://www.arangodb.com/download/)

## One Time Procedure

1. In Terminal
   1. ``npm install typescript -g``
   2. ``npm run install:all``
  
## Backend Application Requirements
  1.  Database setup :
    1. cd < arangodb installation path 
      Example: G:/ArangoDB3-3.8.2/user/bin
    2.  Start ArangoDb service by terminal command : go to usr/bin folder of arangoDb   and use terminal command  as 
    ``arangod --server.endpoint tcp://0.0.0.0:8529 \ --database.directory standalone &``
  2. in Project
    1. create .env file in backend directory as per .envSample file.
    2. ask project maintainer for .env credentials.
  3. in Project
    1. create .env file in backend directory as per .envSample file.
    2. ask project maintainer for .env credentials.
  4. In Terminal
    1. ``cd backend``
    2. ``npm install`` (one time procedure)
    3. ``npm run dev``

## Frontend Requirements
1. in Project
   1. create .env file in frontend directory refer .envSample file
   2. ask project maintainer for .env credentials
   3. You can configure frontend port in frontend/package.json file inside script tag.
    "scripts": {
       "serve": "vue-cli-service serve --port 4002 --open"
    }
2. In Terminal
   1. ``cd frontend``
   1. ``npm install`` (one time procedure)
   2. ``npm run serve``
  
## CkEditor 5 build configuration in frontend folder
1. after npm install, copy @ckeditor5-classic folder from frontend folder and put in frontend > node_modules.
2. you can modify ckeditor configuration accordingly.

## How to access
1. create application from project+team application and user should have access for cover page application. 
2. go to sidebar Quality > Coverpage.
3. Create new coverpage or go to existing one.
4. go to Design tab to design new, select page size.
5. go to Test tab to test designed current coverpage.

## build Commands
 Backend :
  1. In Terminal
    1. cd backend
    2. ``npm start``

 Frontend :
  1. In Terminal
    1. cd frontend
    2. ``npm run build``
