/*  
* Script de récupération d'une video Pluzz
* Author : MattD & nCombo
*/

// Modules:
var request = require("request");

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
    matches = [];

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
  console.log(filename_emission);
  
});
