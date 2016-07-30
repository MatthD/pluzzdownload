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
    /*session = require("express-session")({
      secret: "my-secret",
      resave: true,
      saveUninitialized: true
    }),*/
    //sharedsession = require("express-socket.io-session"),
    app = express(),
    server = require('http').Server(app),
    obj = {},
    io = require('socket.io')(server),
    clients = {},
    message ,
    format,
    dlink,
    id,
    temp_folder = "tmp/", // repertoire temporaire
    port = process.env.PORT || 3000;

// Ecoute sur le port 3000
server.listen(port , function(){
  console.log(kuler('L\'application écoute le port 3000 ' , "green"));
})

// L'app doit utiliser Le moteur de template Nunjucks
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

// Permet a express de lire JSON
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 
//app.use(session);

// Indique que le dossier public est accessible
app.use("/public", express.static(__dirname + '/public'));
//io.use(sharedsession(session));
// On save les clients
io.on('connection', function (socket) {
  console.log("SOCKET CONNECTED!");
  socket.emit("update" , "Vous êtes connecté par socket.io");
  socket.on("id",function(id){
    clients[id] = socket;
  })
  socket.on("disconnect", function (socket) {
    console.log("SOCKET DISCONNECTED!");
  });
  app.post('/', function (req, res) {
    // Si le lien PLUZZ n'est pas envoyé OU s'il n'a pas le bon format
    if(!(req.body.dlink && (req.body.dlink.indexOf("pluzz.francetv.fr/videos/") > -1 
      || req.body.dlink.indexOf("canalplus.fr/") > -1 ))){
      obj.error = "Ceci n'est pas une URL valide , elle doit être du type 'http://pluzz.francetv.fr ' "
      console.error(kuler("Une mauvaise url a été transmise" , "red"));
      socket.emit("update",obj);
      return;
    }
    dlink = req.body.dlink;
    id = clients[req.body.id] || socket;
    format = req.body.format;
    format = (format && (format === "mp3" ||  format === "avi" || format === "mp4" || format === "mkv") ) ? format : "avi";
    // Si tout es bon on lance les fonctions getID,getInfo,getVideo
    lauchTraitement(dlink, format, res, id);
  });
});

// Ecoute si quelqu'un arrive sur la page d'accueil en mode GET (normal)
app.get('/', function (req, res) {
  res.render("index.html");
});

var lauchTraitement = function(url,format,res,socket){
  // Force url à String
  url = url.toString();
  // Recupération de l'ID
  getId.get(url, socket, function(id,type){
    console.log("ID vidéo : " , kuler(id , "orange"));
    console.log("Type: " , kuler(type , "orange"));
    // Recupération des Infos (titre , date , url m3U8 ...)
    getInfo.get(id, type, socket, function(info){
      info.destination = temp_folder;
      // Téléchargement de la video
      getVideo.get(info, format, res, socket, function(){
        //console.log(kuler("Vidéo téléchargée avec succès ! " , "green"));
      });
    });
  });
};

