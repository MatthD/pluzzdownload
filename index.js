/*  
* Script de récupération d'une video Pluzz
* Author : MattD & nCombo
*/

// Modules:
var request = require("request"),
    JSONSelect = require("JSONSelect"),
    avconv = require("avconv"),
    ffmpeg = require("ffmpeg");



// Variables utiles
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
    m3u;

var tmp_url = "http://webservices.francetelevisions.fr/tools/getInfosOeuvre/v2/?idDiffusion=129336112&catalogue=Pluzz&callback=webserviceCallback_129336112";

var options = {
  url: tmp_url,
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:19.0) Gecko/20100101 Firefox/19.0'
  }
};

request(options , function  (error, response, body) {
  id_emission = "129336112";
  //Retourne seulement entre {} sans ()
  while (match = pattern.exec(body)) {
    matches.push(match[1]);
  }
  // Set les infos JSON :
  json_emission = JSON.parse(matches);
  titre_emission = json_emission["code_programme"].replace( /_/g , '.');
  sous_titre_emission = json_emission["sous_titre"].replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').replace( / /g , '.');
  date_emission = json_emission["diffusion"]["date_debut"].split(" ")[0].replace( / |\//g , '.');
  filename_emission = titre_emission + '-' + date_emission + "-" + sous_titre_emission;
  
  // On va chercher le fichier m3u8 pour avconv ou ffmpeg qui construira la video a partir de ca
  m3u = JSONSelect.match(":has(:root > .format:val(\"m3u8-download\")) " , json_emission)[0].url;
  console.log(m3u);

  // Parametres avconv , process.env.HOME correspong à /home/user/
  avconv_params = [
   "-y" , "-i" , m3u , "-vcodec" , "copy" , process.env.HOME + "/Downloads/" + filename_emission + ".mkv"
  ];

  //Creation de la video dans /home/Download
  var stream = avconv(avconv_params);

  stream.on('message', function(data) {
    process.stdout.write(data);
  });
  
});
