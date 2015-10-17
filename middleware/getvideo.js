/*
* Télécharge les video de PLUZZ
*/

var avconv = require("avconv"),
    kuler  = require("kuler"),
    obj = {};


obj.get = function(info,callback){
  //Parametres avconv Video/Audio , process.env.HOME correspong à /home/user/
  var avconv_params = [
   "-y" , "-i" , info.m3uHD ,"-strict" , "experimental"  , "-vcodec" , "libx264" , "-acodec" , "mp3" , info.destination + info.filename_emission + ".mp4"
  ];

  //Creation de la video dans /home/Download
  var stream = avconv(avconv_params);

  stream.on('progress', function(progress) {
    // Affiche le telechargement en cours en % a 2 chiffres prés aprés la virgule
    process.stdout.write(kuler(" ... Téléchargement " + (progress*100).toFixed(2) + "% \r" , "orange"));
  });
};

module.exports = obj;

