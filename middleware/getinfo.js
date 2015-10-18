/*
* GET json & m3u8 video url
*/

var request = require('request-promise'),
    JSONSelect = require("JSONSelect"),
    obj = {};

obj.get = function(id,res,callback) {
  var json_url = "http://webservices.francetelevisions.fr/tools/getInfosOeuvre/v2/?idDiffusion=" + id + "&catalogue=Pluzz&callback=webserviceCallback_" + id,
      pattern = /\((.+?)\)/g,
      match,
      matches = [],
      json_info = {},
      options = {
        url: json_url,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:19.0) Gecko/20100101 Firefox/19.0'
        }
      };

  // Téléchargement du fichier JSON
  request(options)
  .then(function (body) {

    //Retourne seulement entre {} sans () , objet propre
    while (match = pattern.exec(body)) {
      matches.push(match[1]);
    }

    // Definit les infos depuis JSON :
    json_emission = JSON.parse(matches);
    json_info.titre_emission = json_emission["code_programme"].replace( /_/g , '.');
    json_info.sous_titre_emission = json_emission["sous_titre"].replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').replace( / /g , '.');
    json_info.date_emission = json_emission["diffusion"]["date_debut"].split(" ")[0].replace( / |\//g , '.');
    json_info.filename_emission = json_info.titre_emission + '-' + json_info.date_emission + "-" + json_info.sous_titre_emission ;
    
    // On va chercher le fichier m3u8 pour avconv ou ffmpeg qui construira la video a partir de ca
    json_info.m3u = JSONSelect.match(":has(:root > .format:val(\"m3u8-download\")) " , json_emission)[0].url;

    // Télécharge le m3u pour récuperer le lien HD 
    // (m3u est un fichier comprenant plusieurs résolutions)
    options = {
      url: json_info.m3u,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:19.0) Gecko/20100101 Firefox/19.0'
      }
    };

    request(options)
    .then(function(body){
      //récupére la derniere ligne -> resolution la plus élevée.
      json_info.m3uHD = body.split("\n");
      //Garde que les liens
      for (var i = 0; i < json_info.m3uHD.length ; i++) {
        if(json_info.m3uHD[i].indexOf("http://") < 0){
          json_info.m3uHD.splice(i,1);
        }
      };
      //Selection dernier lien / + haute résolution
      json_info.m3uHD = json_info.m3uHD[json_info.m3uHD.length-1]
      callback(json_info);
    })
    .catch(function(err){
      // m3u8HD n'est pas téléchargeable
      console.error(kuler("Aucune résolution n'est dispo: " + err , "red"));
    })
  })
  .catch(function(err){
    //JSON n'est pas télécheargeable
    console.error(kuler("Impossible de récuperer les infos , erreur : " + err , "red"));
  })

}; 

module.exports = obj;