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
    format,
    dlink,
    temp_folder = process.env.HOME + "/tmp/"; // repertoire temporaire


// Ecoute sur le port 3000
server.listen(3000 , function(){
    console.log(kuler('L\'application écoute le port 3000 ' , "green"));
})


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
  if(!(req.body.dlink && req.body.dlink.indexOf("http://pluzz.francetv.fr/videos/") > -1)){
    obj.error = "Ceci n'est pas une URL valide , elle doit être du type 'http://pluzz.francetv.fr ' "
    console.error(kuler("Une mauvaise url a été transmise" , "red"));
    res.render("index.html" , obj);
    return;
  }
  res.render("index.html" , function(){
    io.sockets.emit('update', { progress: "start" });
  });
  dlink = req.body.dlink;
  format = req.body.format;
  format = (format && (format === "mp4" ||  format === "avi")) ? format : "mp4";
  
  // Si tout es bon on lance les fonctions getID,getInfo,getVideo
  lauchTraitement(dlink, format, res, io);
});

io.on('connection', function (socket) {
  console.log("une connexion");
  socket.emit("update" , "Vous êtes connecté par socket.io");
});


var lauchTraitement = function(url,format,res,io){

  // Force url à String
  url = url.toString();


  // Recupération de l'ID
  getId.get(url , res , io, function(id){

    console.log("ID vidéo : " , kuler(id , "orange"));

    // Recupération de des Infos (titre , date , url m3U8 ...)
    getInfo.get(id, res, io, function(info){
      info.destination = temp_folder;
      console.log("Informations vidéo : " , kuler(info , "cyan"));

      // Téléchargement de la video
      getVideo.get(info , format, res, io , function(){
        console.log(kuler("Vidéo téléchargée avec succès ! " , "green"));
      });

    });

  });

};

