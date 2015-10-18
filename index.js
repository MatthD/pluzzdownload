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
    bodyParser = require('body-parser'),
    app = express(),
    server = require('http').Server(app),
    obj = {},
    io = require('socket.io')(server),
    message ,
    temp_folder = process.env.HOME + "/tmp/"; // repertoire temporaire


// Ecoute sur le port 3000
server.listen(3000 , function(){
    console.log(kuler('L\'application ecoute le port 3000 ' , "green"));
});


// L'app doit utiliser Le moteur de template Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// Permet a express de lire JSONS
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 

// Indique que le dossier public est accessible
app.use("/public", express.static(__dirname + '/public'));


// Ecoute si quelqu'un arrive sur la page d'accueil en mode GET (normal)
app.get('/', function (req, res) {
  res.render("index.html");
});


// Ecoute si quelqu'un envoie quelque chose en mode POST
app.post('/', function (req, res) {

  // Si le lien PLUZZ n'est pas envoyé OU s'il n'a pas le bon format
  if(!(req.body.lienPluzz && req.body.lienPluzz.indexOf("http://pluzz.francetv.fr/videos/") > -1)){
    obj.error = "Ceci n'est pas une URL valide , elle doit etre du type 'http://pluzz.francetv.fr ' "
    console.error(kuler("Une mauvaise url à été transmise" , "red"));
    res.render("index.html" , obj);
    return;
  }
  // Si tout es bon on lance les fonctions getID,getInfo,getVideo
  lauchTraitement(req.body.lienPluzz, res , io);
});

io.on('connection', function (socket) {
  console.log("une connexion");
  socket.emit("update" , "test");
  socket.emit("update" , "test2");
});


var lauchTraitement = function(url,res,io){

  // Force url à être String
  url = url.toString();


  // Recupération de l'ID
  getId.get(url , res , io, function(id){

    io.sockets.emit('update', { toast : "Identifiant de vidéo récupéré ... " });
    console.log("ID vidéo : " , kuler(id , "orange"));

    // Recupération de des Infos (titre , date , url m3U8 ...)
    getInfo.get(id, res, io, function(info){
      info.destination = temp_folder;
      console.log("Informations vidéo : " , kuler(info , "cyan"));

      // Téléchargement de la video
      getVideo.get(info , res, io , function(){
        console.log(kuler("Video téléchargée avec succés ! " , "green"));
      });

    });

  });

};

