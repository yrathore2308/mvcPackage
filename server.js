const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require('http')
const request = require('request');
const fs = require('fs');
const app = express();
const aesEncrypt = require('./app/models/AESEncryption');
var xmlpoke = require('xmlpoke');

var jenkins = require('jenkins')({ baseUrl: 'http://automation:automation@2016@actlabinnovationjenkinsdev.digitalcloudplatform.com', crumbIssuer: false });


var corsOptions = {
  origin: "http://localhost:4200"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
const { response } = require("express");
db.sequelize.sync();
// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
var username = 'automation';
var password = 'automation@2016';
var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});

//get call for sonar
app.get("/testCall", (req, res) => {
  const requestOptions = {
    url: 'http://actlabinnovationsonardev.digitalcloudplatform.com/api/rules/show?key=squid:ruleJ',
    method: 'POST',
    json: {},
    Authorization: auth
  };
  request(requestOptions, (err, response, body) => {
    if (err) {
      console.log(err);
    } else if (response.statusCode === 200) {
      console.log(body);
    } else {
      console.log(response.statusCode);
    }
    res.json(body)

  });
});
app.get("/buildjob", (req, res) => {
  jenkins.crumbIssuer='4270b62015312072613f7fb2b99b5ef735f897e51849ac73c711a5fd6dd633de'
  jenkins.job.build('exampleCreate', function (err, data) {
    if (err) throw err;
    else {
      res.send("succeess");
    }
    console.log('queue item number', data);
  });
});
//https://www.npmjs.com/package/jenkins#job-create
app.get("/jenkinsplugin", (req, res) => {
  //   jenkins.info(function (err, data) {
  //     if (err) throw err;

  //     console.log('info', data);
  //   });
  //   console.log('creating.............');

  fs.readFile('try.xml', 'utf8', function (err, data) {
    jenkins.job.create('exampleCreate', data, function (err, data1) {
      if (err) throw err;
      else {
        res.send("succeess");
      }
    });
  });

});

app.get("/encrypt/:text", (req, res) => {
 res.send( aesEncrypt.encrypt(req.params.text));
 
});

const { exec } = require("child_process");
exec("dir", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
app.get("/decrypt/:text", (req, res) => {

  res.send( aesEncrypt.decrypt(req.params.text));
  
 });

 
app.get("/craeteJob", (req, res) => {
  
 var old_file = fs.readFileSync('./try.xml');
 fs.writeFile('./temp.xml', old_file, (err) => {
  if (err) console.log(err);
  console.log("Successfully Written to File.");
  xmlpoke('temp.xml', function(xml) {
  xml.add('project/builders/hudson.tasks.Shell/command',xml.XmlString('java'));
    xml.add('project/builders/hudson.tasks.Shell/command',xml.XmlString('javavbb'));

    });

    fs.readFile('temp.xml', 'utf8', function (err, data) {
    jenkins.job.create('jobNodejCode', data, function (err,data1) {
        if (err) throw err;
        else{
        res.send("succeess");
        }
      });
    });
  });
});
require("./app/routes/turorial.routes")(app);
require("./app/routes/terraform.routes")(app);
require("./app/routes/cloudInfo.routes")(app);
require("./app/routes/jenkinsInfo.routes")(app);

//  require("./app/routes/account.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
