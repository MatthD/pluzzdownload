/*
* Télécharge les videos de PLUZZ
*/

var ffmpeg = require("fluent-ffmpeg"),
    kuler  = require("kuler"),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs'),
    executable  = (process.platform === "win32") ? "ffmpeg.exe" : "ffmpeg",
    ffmpegpath = path.join(path.dirname(process.mainModule.filename), 'ffmpeg', process.platform, process.arch , executable),
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

  console.log("ffmpegpath : " , ffmpegpath);


  // create new ffmpeg processor instance using input stream
  // instead of file path (can be any ReadableStream)
  var proc = ffmpeg(info.m3uHD)
    // setup event handlers
    .on('end', function() {
      console.log('done processing input stream');
    })
    .on('progress' , function(){

    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
    })
    // save to file
    .save('tests.mp4');




};

module.exports = obj;