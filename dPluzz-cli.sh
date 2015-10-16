#!/bin/bash
##############################################################################################
#
# Version Du Script : v1.3
# Nom du Script : dPluzz-cli.sh
# Auteur : Matthieugoua
# Dernière Modification le 14/07/2014
# RECUPERATION des video de pluzz
#
# -------------------------------------- HISTORIQUE ---------------------------------------
#
# 01/05/2014 (1.0)   : Écriture du script
# 01/05/2014 (1.0.1) : correction d'un bug dans le nettoyage du json
# 03/05/2014 (1.1)   : Réécriture par melixgaro. Sans dépendance pour les fainéants qui ne veulent pas s'embêter :D
# 21/05/2014 (1.1.1) : Ajout de l'option pour choisir le dossier de destination (-d), par défaut c'est le home [melixgaro]
# 21/05/2014 (1.1.2) : Ajout de l'option pour choisir ffmpeg (-f) au lieu de avconv [melixgaro]
# 03/07/2014 (1.1.3) : Réduction de la sortie verbeuse de ffmpeg/avconv pour une meilleure intégration dans dPluzz. [gaara]
# 14/07/2014 (1.2)   : Ajout de l'option pour choisir mp3 (-m) au lieu de AAC [gaara]
# 13/03/2015 (1.3)   : Sélection de la vidéo HD, si pas disponible SD [melixgaro]
#
#-------------------------------------- DEPENDANCES UTILES --------------------------------------------
#
# AVCONV (sudo apt-get install --no-install-recommends libav-tools)
#
##############################################################################################

kill_jobs()
{
    pkill -TERM -P "$BASHPID"
}

trap kill_jobs EXIT

BASEPATH=$(pwd)

usage()
{
    cat << EOF
usage: $(basename $0) [OPTIONS] URL

OPTIONS:
-f        utilise ffmpeg au lieu de avconv
-m        convertir laudio en MP3
-d DIR    dossier de destination
-u URL    adresse de la vidéo
-h        affiche cette aide
EOF
}

if [[ $# == 0 ]]
then
    usage
    exit 1
fi

IsFFMPEG="False"
IsMP3="False"
IsDebug="False"

while getopts "fmd:hvu:" opt; do
    case $opt in
	"f")
	    IsFFMPEG="True"
	    ;;
	"m")
	    IsMP3="True"
	    ;;
	"d")
	    Directory="${OPTARG%%/}"
	    ;;
	"h")
	    usage
	    exit 1
	    ;;
	"u")
	    URL="${OPTARG}"
	    ;;
	"v")
            IsDebug="True"
	    ;;
	"?")
	    echo "Invalid option: -$OPTARG"
	    usage
	    exit 1
	    ;;
    esac
done

shift $(($OPTIND-1))

if [[ -z "${URL}" ]]
then
    URL="${1}"
fi

if [[ "x${Directory}" == "x" ]] 
then
    Directory="${HOME}"
fi

#COULEUR
VERT="\\033[0;32m"
ROUGE="\\033[7;0;31m"
ROSE="\\033[0;35m"
BLEU="\\033[1;34m"
JAUNE="\\033[0;33m"
NORMAL="\\033[0;39m"

echo -e "$VERT""DEBUT DU TRAITEMENT""$NORMAL"
sleep 1
#Recuperation de l' ID de l' emission
UserAgent='Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:19.0) Gecko/20100101 Firefox/19.0'
ID=$(wget -q -O - -U "${UserAgent}" "${URL}" | grep -oE "data-diffusion=.[0-9]*." | head -1 | grep -oE "[0-9]*")
echo "ID " {$ID}
#wget du json conteant les infos
echo -e "$ROSE""-->RECUPERATION DU JSON""$NORMAL"
JSON="$(wget -q -U "${UserAgent}" "http://webservices.francetelevisions.fr/tools/getInfosOeuvre/v2/?idDiffusion=${ID}&catalogue=Pluzz&callback=webserviceCallback_${ID}" -O - | sed 's+\\/+/+g')"

#Recuperation des infos
echo -e "$ROSE""-->TRAITEMENT DU JSON""$NORMAL"
DATE="$(echo "${JSON}" | sed 's+.*date_debut..\"\([^\"]*\)\".*+\1+g')"
PROG="$(echo "${JSON}" | sed 's+.*code_programme..\"\([^\"]*\)\".*+\1+g')"
M3U="$(echo "${JSON}" | sed 's+.*url..\"\([^\"]*m3u8\)\".*+\1+g')"
echo "M3U : " $M3U
#Recuperation du master M3U et traitement
M3U2="$(wget -q -U "'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:19.0) Gecko/20100101 Firefox/19.0'" "${M3U}" -O - | grep -E "^http.*.ts*" | tail -1)"
echo M3U2 $M3U2
#Ecriture du log en mode debug
if [[ "${IsDebug}" == "True" ]]
then
    mkdir -p ${HOME}/.cache/dPluzz/log/
    exec 3>&1 4>&2 1>${HOME}/.cache/dPluzz/log/debug.log 2>&1
    echo $M3U2
    exec 1>&3 2>&4
fi

#Téléchargement
if [[ "${IsFFMPEG}" == "False" ]]
then
    if [[ "${IsMP3}" == "False" ]]
      then
      echo -e "$BLEU""-->RECUPERATION DU FICHIER VIDEO AVEC VOS PARAMÈTRES:""$JAUNE"" AVCONV / AAC""$NORMAL"
      avconv -y -i "${M3U2}" -strict experimental -vcodec copy -acodec aac "${Directory}/${PROG}_${ID}.mkv" 2>&1 |
        { while read line
          do
            if $(echo "$line" | grep -q "avconv"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "FFmpeg"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Duration"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Output"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Stream #0:1 -> #0:1"); then
              break
            fi
          done;
          while read -d $'\x0D' line
         do
            if $(echo "$line" | grep -q "time="); then
              echo -en "\r$line"
            fi
         done; }
         sleep 1
    elif [[ "${IsMP3}" == "True" ]]
      then
      echo -e "$BLEU""-->RECUPERATION DU FICHIER VIDEO AVEC VOS PARAMÈTRES:""$JAUNE"" AVCONV / MP3""$NORMAL"
      avconv -y -i "${M3U2}" -vcodec copy -acodec libmp3lame -ar 44100 -ac 2 -ab 256k "${Directory}/${PROG}_${ID}.mkv" 2>&1 |
        { while read line
          do
            if $(echo "$line" | grep -q "avconv"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "FFmpeg"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Duration"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Output"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Stream #0:1 -> #0:1"); then
              break
            fi
          done;
          while read -d $'\x0D' line
         do
            if $(echo "$line" | grep -q "time="); then
              echo -en "\r$line"
            fi
         done; }
         sleep 1
    fi
else
    if [[ "${IsMP3}" == "False" ]]
      then
      echo -e "$BLEU""-->RECUPERATION DU FICHIER VIDEO AVEC VOS PARAMÈTRES:""$JAUNE"" FFMPEG / AAC""$NORMAL"
      ffmpeg -y -i "${M3U2}" -vcodec copy -acodec copy "${Directory}/${PROG}_${ID}.mkv" 2>&1 |
        { while read line
          do
            if $(echo "$line" | grep -q "FFmpeg"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Duration"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Output"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Stream #0:1 -> #0:1"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Stream #0.1 -> #0.1"); then
              break
            fi
        done;
        while read -d $'\x0D' line
       do
          if $(echo "$line" | grep -q "time="); then
            echo -en "\r$line"
          fi
       done; }
       sleep 1
    elif [[ "${IsMP3}" == "True" ]]
      then
      echo -e "$BLEU""-->RECUPERATION DU FICHIER VIDEO AVEC VOS PARAMÈTRES:""$JAUNE"" FFMPEG / MP3""$NORMAL"
      ffmpeg -y -i "${M3U2}" -vcodec copy -acodec libmp3lame -ar 44100 -ac 2 -ab 256k "${Directory}/${PROG}_${ID}.mkv" 2>&1 |
        { while read line
          do
            if $(echo "$line" | grep -q "FFmpeg"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Duration"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Output"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Stream #0:1 -> #0:1"); then
              echo "$line"
            fi
            if $(echo "$line" | grep -q "Stream #0.1 -> #0.1"); then
              break
            fi
          done;
          while read -d $'\x0D' line
         do
            if $(echo "$line" | grep -q "time="); then
              echo -en "\r$line"
            fi
         done; }
         sleep 1
    fi
fi
echo -e "$ROUGE""\nFIN DU TRAITEMENT""$NORMAL"
echo -e "$JAUNE""Votre Fichier Final Est: (Sauf s'il est renommé par le GUI!)""$NORMAL"
echo -e "$VERT""${Directory}/${PROG}_${ID}.mkv\n""$NORMAL"
sleep 1
exit 0  
