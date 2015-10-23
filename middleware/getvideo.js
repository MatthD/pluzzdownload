/*
* Télécharge les videos de PLUZZ
*/

var avconv = require("avconv"),
    kuler  = require("kuler"),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    obj = {},
    extension,
    vcodec,
    proxy;




obj.get = function(info,format,res,io,callback){
  //Paramètres avconv Video/Audio , process.env.HOME correspond à /home/user/
  if(process.env.HTTP_PROXY){
    proxy = process.env.HTTP_PROXY;
    info.m3uHD = info.m3uHD + " socks=" +proxy ;
  }

  extension = (format === "mp4") ? "mp4" : format;
  vcodec = (format === "mp4") ? "h264" : null;

  var avconv_params = [
   "-y" , "-i"  , info.m3uHD ,"-strict" , "experimental"  , '-f' , format  ,info.destination + info.filename_emission + "." + extension
  ];

  if(vcodec){
    avconv_params.splice(7,0 ,"-vcodec");
    avconv_params.splice(8,0 ,vcodec);
  }

  console.log("Lien m3u8 " , info.m3uHD , " avconv_params : " , avconv_params);

  // Creation du repertoire info.destination s'il il n'existe pas
  mkdirp(info.destination, function (err) {
    if (err) {
      console.error(kuler("Problème lors de la création du repertoire : " + err , "red"))
    }
  });

  //Création de la video dans info.destination
  var stream = avconv(avconv_params);

  stream.on('progress', function(progress) {
    // Affiche le téléchargement en cours en % à 2 chiffres près après la virgule
    process.stdout.write(kuler(" ... Téléchargement " + (progress*100).toFixed(2) + "% \r" , "orange"));
    //Envoi le % de progression à la page html
    progress = (progress*100).toFixed(2) + "%";
    io.sockets.emit('update', { progress: progress });
  });

  stream.once('exit', function(exitCode, signal, metadata) {
    io.sockets.emit('update', { toast: "Vidéo Récupérée & Convertie" });
    io.sockets.emit('update', { progress: "100%" });
    //conversion en fonction du format de sortie choisi dans index.html
    res.download(info.destination + info.filename_emission + "." + extension, function(){
      fs.unlink(info.destination + info.filename_emission + "." + extension);
      
      process.stdout.write('\r');
      console.log("Vidéo Téléchargée avec succès");
    });

  });

};

module.exports = obj;

