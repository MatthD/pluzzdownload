/*
* Télécharge les videos de PLUZZ
*/

var ffmpeg = require("fluent-ffmpeg"),
    kuler  = require("kuler"),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs'),
    ffmpegExe  = (process.platform === "win32") ? "ffmpeg.exe" : "ffmpeg",
    ffmpegpath = path.join(path.dirname(process.mainModule.filename), 'ffmpeg', process.platform, process.arch , ffmpegExe),
    ffprobExe  = (process.platform === "win32") ? "ffprobe.exe" : "ffprobe",
    ffprobPath = path.join(path.dirname(process.mainModule.filename), 'ffmpeg', process.platform, process.arch , ffprobExe),
    obj = {},
    extension,
    vcodec,
    proxy;

// FFMPEG import binaries
ffmpeg.setFfmpegPath(ffmpegpath);
ffmpeg.setFfprobePath(ffprobPath);

obj.get = function(info,format,res,io,callback){

  extension = (format === "matroska") ? "mkv" : format;

  console.log("Lien m3u8 " , info.m3uHD);

  // Creation du repertoire info.destination s'il il n'existe pas
  mkdirp(info.destination, function (err) {
    if (err) {
      console.error(kuler("Problème lors de la création du repertoire : " + err , "red"))
    }
  });

  /*--------------*/
  /*    FFMPEG    */
  /*--------------*/

  ffmpeg.ffprobe(info.m3uHD, function(err, metadata) {
    console.log(metadata.format.size);
    // Envoi du fichier
    res.attachment(info.filename_emission + "." + extension);
    proc();
  });

  var proc = function(){
    ffmpeg(info.m3uHD)
    .on('end', function() {
      console.log('done processing input stream');
    })
    .on('progress' , function(progress){
      process.stdout.write(kuler(" ... Téléchargement " + progress.percent + "% \r" , "orange"));
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err);
    })
    .format('matroska')
    .videoBitrate('2048k')
    .videoCodec('libx264')
    .size('720x?')
    .audioBitrate('128k')
    .audioChannels(2)
    .audioCodec('libmp3lame')
    .pipe(res);
    };
  }

module.exports = obj;