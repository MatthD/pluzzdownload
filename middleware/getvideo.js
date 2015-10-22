/*
* Télécharge les videos de PLUZZ
*/

var avconv = require("avconv"),
    kuler  = require("kuler"),
    mkdirp = require('mkdirp'),
    obj = {},
    proxy;




obj.get = function(info,res,io,callback){
  //Paramètres avconv Video/Audio , process.env.HOME correspond à /home/user/

    if(process.env.HTTP_PROXY){
      proxy = process.env.HTTP_PROXY;
      info.m3uHD = info.m3uHD + " socks=" +proxy ;
    }
    console.log("m3u " , info.m3uHD);

  var avconv_params = [
   "-y" , "-i"  , info.m3uHD ,"-strict" , "experimental"  , '-f' , 'matroska' , info.destination + info.filename_emission + ".mkv"
  ];

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
    //conversion en fonction du format de sortie choisi dans index.html
    switch(caconv_param){
      case "#formatMKV":
        res.download(info.destination + info.filename_emission + ".mkv", function(){
        fs.unlink(info.destination + info.filename_emission + ".mkv");
        });
        break;
      case "#formatMP5":
        res.download(info.destination + info.filename_emission + ".mp5", function(){
        fs.unlink(info.destination + info.filename_emission + ".mp5");
        });
        break;
      default "#formatMKV":
        res.download(info.destination + info.filename_emission + ".mp4", function(){
        fs.unlink(info.destination + info.filename_emission + ".mp4");
      });
    
    //res.download(info.destination + info.filename_emission + ".mp4", function(){
    //  fs.unlink(info.destination + info.filename_emission + ".mp4");
    }; // name of archive
    process.stdout.write('\r');
    console.log("Vidéo Téléchargée avec succès");
  });

};

module.exports = obj;

