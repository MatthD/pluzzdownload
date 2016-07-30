# pluzzdownload
Télécharger des videos FranceTv (Pluzz) & Canal+

[![DEMO](https://www.herokucdn.com/deploy/button.svg)](plluzzdownload.herokuapp.com)

Application web deployable sur un serveur ou en local.
Ecrite en Node.js avec socket.io elle permet de télécharger les videos des sites web  pluzz & canal+.

Attention vous êtes seul responsable de la gestion de ces videos. Il peut etre necessaire de la supprimer aprés 7 jours. 
Cf [copyright france-télévision](http://pluzz.francetv.fr/staticftv/catchup/mobile/cgu/mentions_legales_windows8.html)
[copyright Groupe Canal+](http://www.canalplus.fr/pid4366-c-condition-generales.html)

## Démo
Cliquez sur le bouton heroku ci-dessus,
Héroku n'étant pas hebergé en France l'application ne pourra pas télécharger toutes les videos.
Vous pouvez prendre les liens ["depuis l'étranger"](http://pluzz.francetv.fr/depuis-l-etranger)


## Prérequis:
- Node.js > 4.4
- Un navigateur moderne.
- Un Serveur / VPS si vous souhaitez déployer.

## Installation:
Télécharger le dépot.
Npm install

## Lancement:
node index.js
Rendez vous sur localhost:3000
