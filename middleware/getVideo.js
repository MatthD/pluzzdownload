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
    presets = path.join(path.dirname(process.mainModule.filename), 'ffmpeg', 'presets'),
    obj = {},
    time = 1, // set it to 1 to not devided by 0
    timeDone = 0,
    extension,
    vcodec,
    proxy;

// FFMPEG import binaries
ffmpeg.setFfmpegPath(ffmpegpath);
ffmpeg.setFfprobePath(ffprobPath);

obj.get = function(info,format,res,socket,callback){
  //console.log("format : ", format);
  switch(format){
    case "mp4":
      extension = "mp4";
      break;
    case "mkv":
      extension = "mkv";
      break;
    default:
      extension = format;
      break;
  }
  // Creation du repertoire info.destination s'il il n'existe pas
  mkdirp(info.destination, function (err) {
    if (err) {
      obj.error = "Problème lors de la création du repertoire : ";
      socket.emit("update",obj);
      console.error(kuler("Problème lors de la création du repertoire : " + err , "red"))
    }
  });
  /*--------------*/
  /*    FFMPEG    */
  /*--------------*/
  ffmpeg.ffprobe(info.m3uHD, function(err, metadata) {
    time = metadata.format.duration;
    // Envoi du fichier
    res.attachment(info.filename_emission + "." + extension);
    proc();
  });

  var proc = function(){
    ffmpeg(info.m3uHD , { presets: presets })
    .on('progress' , function(progress){
      var t = progress.timemark.split(':');
      timeDone = (+t[0]) * 60 * 60 + (+t[1]) * 60 + (+t[2]);
      progress = progress.percent ? (progress.percent).toFixed(2) + "%" : ((timeDone/time)*100).toFixed(2) + "%";
      socket.emit('update', { progress: progress });
    })
    .on('end', function() {
      socket.emit('update', { toast: "Vidéo Récupérée & Convertie" });
      socket.emit('update', { progress: "100%" });
    })
    .on('error', function(err,err2,err3) {
      obj.error = 'Une erreur s\'est produite pendant la conversion: ' + err;
      console.error(obj.error + err2 + err3);
      socket.emit('update',obj)
    })
    .preset(format)
    .pipe(res)
    };
}

module.exports = obj;