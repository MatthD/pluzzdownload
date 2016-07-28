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
    temp_folder = process.env.HOME + "/tmp/", // repertoire temporaire
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
  socket.emit("update" , "Vous êtes connecté par socket.io");
  // socket.on('disconnect', function() {
  //   delete clients[socket.handshake.sessionID];
  // });
  socket.on("url", function(info){
    if(!(info.link && info.link.indexOf("http://pluzz.francetv.fr/videos/") > -1)){
      obj.error = "Ceci n'est pas une URL valide , elle doit être du type 'http://pluzz.francetv.fr ' "
      //console.error(kuler("Une mauvaise url a été transmise" , "red"));
      socket.emit("update", obj)
      return;
    }
  })
});

// Ecoute si quelqu'un arrive sur la page d'accueil en mode GET (normal)
app.get('/', function (req, res) {
  res.render("index.html");
});

// Ecoute si quelqu'un envoie quelque chose en mode POST
// app.post('/', function (req, res) {

//   // Si le lien PLUZZ n'est pas envoyé OU s'il n'a pas le bon format
//   if(!(req.body.dlink && req.body.dlink.indexOf("http://pluzz.francetv.fr/videos/") > -1)){
//     obj.error = "Ceci n'est pas une URL valide , elle doit être du type 'http://pluzz.francetv.fr ' "
//     console.error(kuler("Une mauvaise url a été transmise" , "red"));
//     res.render("index.html" , obj);
//     return;
//   }
//   res.render("index.html" , function(){
//     io.sockets.emit('update', { progress: "start" });
//   });
//   dlink = req.body.dlink;
//   format = req.body.format;
//   format = (format && (format === "mp3" ||  format === "avi")) ? format : "avi";
  
//   // Si tout es bon on lance les fonctions getID,getInfo,getVideo
//   lauchTraitement(dlink, format, res, io);
// });

var lauchTraitement = function(url,format,res,io){

  // Force url à String
  url = url.toString();

  // Recupération de l'ID
  getId.get(url , res , io, function(id){

    console.log("ID vidéo : " , kuler(id , "orange"));

    // Recupération de des Infos (titre , date , url m3U8 ...)
    getInfo.get(id, res, io, function(info){
      info.destination = temp_folder;
      //console.log("Informations vidéo : " , kuler(info , "cyan"));

      // Téléchargement de la video
      getVideo.get(info , format, res, io , function(){
        console.log(kuler("Vidéo téléchargée avec succès ! " , "green"));
      });

    });

  });

};

