/*
* Télécharge les video de PLUZZ
*/

var avconv = require("avconv"),
    kuler  = require("kuler"),
    mkdirp = require('mkdirp'),
    obj = {},
    proxy;




obj.get = function(info,res,io,callback){
  //Parametres avconv Video/Audio , process.env.HOME correspong à /home/user/

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
      console.error(kuler("Probléme lors de la création du repertoire : " + err , "red"))
    }
  });

  //Creation de la video dans info.destination
  var stream = avconv(avconv_params);

  stream.on('progress', function(progress) {
    // Affiche le telechargement en cours en % a 2 chiffres prés aprés la virgule
    process.stdout.write(kuler(" ... Téléchargement " + (progress*100).toFixed(2) + "% \r" , "orange"));
    //Envoi le % de progression à a page html
    progress = (progress*100).toFixed(2) + "%";
    io.sockets.emit('update', { progress: progress });
  });

  stream.once('exit', function(exitCode, signal, metadata) {
    io.sockets.emit('update', { toast: "Video Récupérée & Convertie" });
    res.download(info.destination + info.filename_emission + ".mp4", function(){
      fs.unlink(info.destination + info.filename_emission + ".mp4");
    }); // name of archive
    process.stdout.write('\r');
    console.log("Video Téléchargée avec succés");
  });

};

module.exports = obj;

