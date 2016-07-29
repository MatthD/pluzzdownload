/*
* GET HTML by url & search id
*/

var scrap = require('scrap'),
    kuler = require("kuler"),
    obj   = {};

obj.get = function(url,socket,callback) {
  var id,
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
  console.log(options);
  // Recherche du noeuf contenant l'attribut par jQuery , puis récupére la valeur de l'attribut
  scrap(options, function(err, $) {
    id = $("div[data-diffusion]").first().attr("data-diffusion");
    // Si on ne trouve pas l'ID de la video
    if (!id) {
      obj.error = "Identifiant de video introuvable , verifiez le lien svp"
      console.error(kuler("L'identifant de l'url " + url + " n'a pas été trouvé " , "red"));
      socket.emit("update", obj);
      return;
    }
    message = "Identifiant de vidéo récupéré ... ";
    socket.emit('update', { toast : message });
    callback(id);
  });
}; 

module.exports = obj;