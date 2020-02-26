/********************************************GENERAL VARIABLES*****************************************************/

var express = require('express');
var fs = require('fs');

var app = express();

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});

const rules = {
  max_interests : 10,
  min_age_subscribe : 18,
  max_age_subscribe : 30
}

module.exports.rules = rules;
/*************************************************GENERAL API REST********************************************/
app.use(express.static('src'));
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * All'avvio dell'applicazione, si controlla se ci sono delle informazioni nel file di cache "session.json". 
 * Se si verificano errori, l'utente deve effettuare l'autenticazione, altrimenti può utilizzare l'applicazione, 
 * poiché già autenticato.
 */
app.get(['/'], (req, res) => {
  fs.readFile('session.json', (error, data)=>{
    try{
      if(error) throw new Error();
      else{
        data = JSON.parse(data);
        res.redirect("FindMeFriend.html");
      }
    }catch(err){
      fs.writeFile('session.json', "In questo file verranno memorizzati, in formato JSON, i dati della tua sessione.", () =>{res.redirect("Welcome.html");});
    }
  })
});  
  

/*****************************************************SESSION*************************************************/

app.get(['/api/getsession'], (req,res)=>{ 
  fs.readFile('session.json', (err, s) =>{res.end(s)});
});


/***************************************WELCOME***************************************************************/
var wbe = require('./src/js/WelcomeBE');

app.post(['/api/insertuser'], (req,res)=>{
  wbe.insertUser(req.body, res);
});

app.get(['/api/authentication/:email/:password'], (req, res)=>{
  wbe.authentication(req.params.email, req.params.password, res);
})

/****************************************HOME*****************************************************************/
var hbe = require('./src/js/HomeBE');

app.get(['/api/getrules'], (req, res) =>{ res.end(JSON.stringify(rules))});

app.get(['/api/search/:province/:word/:yearMin/:yearMax'], (req, res) =>{
  var province = req.params.province == 'null'? null : req.params.province;
  var word = req.params.word == 'null'? null : req.params.word;
  var min = req.params.min == 'null'? null : req.params.yearMin;
  var max = req.params.max == 'null'? null: req.params.yearMax;
  hbe.search(province, word, min, max, res);
})

app.get(['/api/getmissinginformations/:email'], (req, res) =>{
  hbe.getMissingInformations(req.params.email, res);
})


/****************************************PROFILE**************************************************************/
var pbe = require('./src/js/ProfileBE');

app.post(['/api/addinterest/:email'], (req, res)=>{
  pbe.addInterestUpdate(req.params.email, req.body, res);
})

app.delete(['/api/delete/interest/:name/:email'], (req, res) =>{
  pbe.deleteInterestUpdate(req.params.email, req.params.name, res);
})

app.delete(['/api/delete/profile/:email'], (req, res) =>{
  pbe.deleteProfileUpdate(req.params.email, res);
})

app.put(["/api/setinformation/:column/:value/:email"], (req, res) =>{
  pbe.setInformationUpdate( req.params.column, req.params.value, req.params.email, res);
})

app.put(["/api/setinterest/:column/:value/:name/:email"], (req, res) =>{
  pbe.setInterestUpdate(req.params.column, req.params.value, req.params.name, req.params.email, res);
})

app.put(['/api/setpassword/:old/:new/:email'], (req, res) =>{
  pbe.setPasswordUpdate(req.params.old, req.params.new, req.params.email, res);
})

/****************************************EMAIL***************************************************************/

app.post(['/api/sendemail'], (req, res) =>{ 
  require('./src/js/Email').sendEmail(req.body, res);
})