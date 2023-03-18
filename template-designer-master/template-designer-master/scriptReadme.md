# SE-Apps

## One Time Procedure

## Root directory Requirements

1. go to your root directory

   1. in project
      1. put "nats-server.exe" file from nats installed folder if not present in project root dir.
      2. go to index.js file in root dir,
         1. replace path of arango.conf file as per your arangodb installation path in below command.
            "arangod -c=F:/ArangoDB3-3.8.2/etc/arangodb3/arangod.conf --proc arangodb"

         2. replace backend as per your backend project directory name
            "npm --prefix backend run dev --proc backend"

         3. replace frontend as per your frontend project directory name
            "npm --prefix frontend run serve --proc frontend"
  
   2. In Terminal
      1. `npm init -y`
      2. `npm i chalk`
      (add "start" : "node index.js" in script of package.json file)
      3. `npm start`

