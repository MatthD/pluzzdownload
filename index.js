/*  
* Script de récupération d'une video Pluzz
* Author : MattD & nCombo
*/

// Modules
var express = require('express'), // Surveille les connexion a l'appli
    getId = require("./middleware/getid"), // Récup l'ID d'une URL
    getInfo = require("./middleware/getinfo"), // Recup du JSON
    getVideo = require("./middleware/getVideo"), // Télécharge la video
    nunjucks = require("nunjucks"),
    kuler    = require("kuler"),
    app = express();

// L'app doit utiliser Le moteur de template Nunjucks
app.engine('nunjucks', nunjucks.express);
app.set('view engine', 'nunjucks');

app.get('/', function (req, res) {
  res.render("index.html");
});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log(kuler('L\'application ecoute le port ' + port , "green"));
});

// getId.get("http://pluzz.francetv.fr/videos/c_dans_lair.html" , function(id){
//   console.log("id" , id);
//   getInfo.get(id, function(info){
//     info.destination = process.env.HOME + "/Downloads/"
//     console.log("info " , info);
//     getVideo.get(info , function(){
//       console.log("Video téléchargée avec succés ! ");
//     })
//   });
// });