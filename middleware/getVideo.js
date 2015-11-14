/*
* Télécharge les videos de PLUZZ
*/

var ffmpeg = require("easy-ffmpeg"),
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

  /*--------------*/
  /*    FFMPEG    */
  /*--------------*/

  var command = ffmpeg(fs.createReadStream(info.m3uHD));
  command
  .format('mp4')
  .videoCodec('mpeg4')
  .output("test.mp4");
};

module.exports = obj;

