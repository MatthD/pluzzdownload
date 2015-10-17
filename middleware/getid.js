/*
* GET HTML by url & search id
*/

var scrap = require('scrap'),
    obj   = {};


obj.get = function(url,callback) {
  var id;
  console.log("url : " , url);
  // Recherche du noeuf contenant l'attribut par jQuery , puis récupére la valeur de l'attribut
  scrap(url, function(err, $) {
    id = $("div[data-diffusion]").first().attr("data-diffusion");
    callback(id);
  });
}; 

module.exports = obj;
 
