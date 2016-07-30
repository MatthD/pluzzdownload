/*
* GET HTML by url & search id
*/

var scrap = require('scrap'),
    kuler = require("kuler"),
    obj   = {};

obj.get = function(url,socket,res,callback) {
  var id,
      type,
      message,
      proxy,
      options;

  if(process.env.http_proxy){
    proxy = process.env.HTTP_PROXY;
    options = {
      url : url ,
      proxy : proxy
    }
  }
  else{
    options = {
      url : url
    }
  }
  // Recherche du noeuf contenant l'attribut par jQuery , puis récupére la valeur de l'attribut
  scrap(options, function(err, $) {
    if(err){
      console.error("Cannot scrap website");
      socket.emit('update',{error : "cannot scrap website"});
      res.send("<script>window.close()</script>");
      return;
    }
    if(url.indexOf("pluzz.francetv.fr/videos/") > -1){  
      id = $("div[data-diffusion]").first().attr("data-diffusion");
      type = "pluzz";
      socket.emit("update", {type : "pluzz"});
      socket.emit('update', { toast : "Video Pluzz détectée" });
    }
    else if(url.indexOf("canalplus.fr/") > -1){
      id = $("a[data-vid]").first().attr("data-vid");
      type = "canal";
      socket.emit("update", {type : "canal"});
      socket.emit('update', { toast : "Video Canal+ détectée" });
    }
    // Si on ne trouve pas l'ID de la video
    if (!id) {
      obj.error = "Identifiant de video introuvable , verifiez le lien svp"
      console.error(kuler("L'identifant de l'url " + url + " n'a pas été trouvé " , "red"));
      socket.emit("update", obj);
      res.send("<script>window.close()</script>");
      return;
    }
    message = "Identifiant de vidéo récupéré ... ";
    socket.emit('update', { toast : message });
    callback(id,type);
  });
}; 

module.exports = obj;