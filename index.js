/*  
* Script de récupération d'une video Pluzz
* Author : MattD & nCombo
*/

// Modules
var request = require('request-promise'),
    JSONSelect = require("JSONSelect"),
    avconv = require("avconv"),
    ffmpeg = require("fluent-ffmpeg"),
    kuler  = require("kuler"),
    fs =require("fs");

// Variables
var id_emission,
    date_emission,
    titre_emission,
    sous_titre_emission,
    json_emission,
    filename_emission,
    regex_json,
    pattern = /\((.+?)\)/g,
    match,
    matches = [],
    avconv_params,
    m3u,
    m3uHD,
    command;

//Parametres avconv Video/Audio , process.env.HOME correspong à /home/user/
avconv_params = [
 "-y" , "-i" , "urlVideo" ,"-strict" , "experimental"  , "-vcodec" , "libx265" , "-acodec" , "mp3" , "destination"
];

var tmp_url = "http://webservices.francetelevisions.fr/tools/getInfosOeuvre/v2/?idDiffusion=129344372&catalogue=Pluzz&callback=webserviceCallback_129344372";

var options = {
  url: tmp_url,
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
  titre_emission = json_emission["code_programme"].replace( /_/g , '.');
  sous_titre_emission = json_emission["sous_titre"].replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').replace( / /g , '.');
  date_emission = json_emission["diffusion"]["date_debut"].split(" ")[0].replace( / |\//g , '.');
  filename_emission = titre_emission + '-' + date_emission + "-" + sous_titre_emission;
  avconv_params[avconv_params.length-1] = process.env.HOME + "/Downloads/" + filename_emission + ".mp4"

  // On va chercher le fichier m3u8 pour avconv ou ffmpeg qui construira la video a partir de ca
  m3u = JSONSelect.match(":has(:root > .format:val(\"m3u8-download\")) " , json_emission)[0].url;
  console.log(m3u);

  // Télécharge le m3u pour récuperer le lien HD 
  // (m3u est un fichier comprenant plusieurs résolutions)
  options = {
    url: m3u,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:19.0) Gecko/20100101 Firefox/19.0'
    }
  };

  request(options)
  .then(function(body){
    //récupére la derniere ligne -> resolution la plus élevée.
    m3uHD = body.split("\n");
    //Garde que les liens
    for (var i = 0; i < m3uHD.length ; i++) {
      if(m3uHD[i].indexOf("http://") < 0){
        console.log(m3uHD[i]);
        m3uHD.splice(i,1);
      }
    };
    //Selection dernier lien / + haute résolution
    m3uHD = m3uHD[m3uHD.length-1]
    console.log("m3uHD " , m3uHD);

    // Ajout du lien dans le tableau parametres
    avconv_params[2] = m3uHD;

    console.log("avconv par" , avconv_params);


    //Creation de la video dans /home/Download
    var stream = avconv(avconv_params);

    stream.on('progress', function(progress) {
      // Affiche le telechargement en cours en % a 2 chiffres prés aprés la virgule
      process.stdout.write(kuler(" ... Téléchargement " + (progress*100).toFixed(2) + "% \r" , "orange"));
    });

  })
  .catch(function(err){
    // m3u8HD n'est pas téléchargeable
    console.log("Aucune résolution n'est dispo: " ,err);
  })
})
.catch(function(err){
  //JSON n'est pas télécheargeable
  console.log("Impossible de récuperer les infos , erreur : " ,err);

  //Quite Node.js avec erreur code 1
  process.exit(1);
})
