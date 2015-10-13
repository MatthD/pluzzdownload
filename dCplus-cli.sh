#!/bin/bash
##############################################################################################
#
# Version Du Script : v0.1.3
# Nom du Script : dCplus-cli.sh
# Auteur : melixgaro
# Dernière Modification le 14/07/2014
# RECUPERATION des video de canal+
#
#
# AVCONV (sudo apt-get install --no-install-recommends libav-tools)
#
#
# 03/07/2014 (1.2)   : Réduction de la sortie verbeuse de ffmpeg/avconv pour une meilleure intégration dans dPluzz. [gaara]
# 14/07/2014 (1.3)   : Ajout de l'option pour choisir mp3 (-m) au lieu de AAC [gaara]
#
#
##############################################################################################

kill_jobs()
{
    pkill -TERM -P "$BASHPID"
}

trap kill_jobs EXIT

usage()
{
    cat << EOF
usage: $(basename $0) [OPTIONS] URL

OPTIONS:
-f        utilise ffmpeg au lieu de avconv
-m        convertir l'audio en MP3
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
#ID=$(wget -q -U "${UserAgent}" "${URL}" -O - | grep -E "videoId=.*CanalPlayerEmbarque" | sed 's+.*videoId=.\([0-9]*\).*+\1+g')
ID=${URL//*vid=}
if [[ ${ID} == http* ]]
then
    FID=$(wget -q -U "${UserAgent}" "${URL}" -O - | grep -oP '(?<=vid=).*?(?=onclick)' | cut -c1-7)
    set -- $FID
    ID=$1
    if [[ ${ID} == "" ]]
    then
        echo "UNE ERREUR EST SURVENUE"
        exit 1
    fi
fi
echo -e "$JAUNE"""ID:"""$NORMAL"$ID

#wget du json conteant les infos
echo -e "$ROSE""-->RECUPERATION DU JSON""$NORMAL"
JSON="$(wget -q -U "${UserAgent}" "http://service.canal-plus.com/video/rest/getVideos/cplus/${ID}?format=json" -O - | sed 's+\\/+/+g' | ascii2uni -q -a "U")"

#Recuperation des infos
echo -e "$ROSE""-->TRAITEMENT DU JSON""$NORMAL"
DATE="$(echo "${JSON}" | sed 's+.*DATE..\"\([^\"]*\)\".*+\1+g')"
PROG="$(echo "${JSON}" | sed 's+.*\"TITRE..\"\([^\"]*\)\".*+\1+g' | iconv -f utf8 -t ascii//TRANSLIT//IGNORE | sed -e 's/[^A-Za-z0-9._-]/_/g')"

M3U="$(echo "${JSON}" | sed 's+.*HLS..\"\([^\"]*\)\".*+\1+g')"
if [[ ${M3U} == "" ]]
then
    echo "TYPE DE VIDEO NON PRIS EN CHARGE"
    exit 1
fi

#Recuperation du master M3U et traitement
M3U2="$(wget -q -U "'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:19.0) Gecko/20100101 Firefox/19.0'" "${M3U}" -O - | grep -E ".*index_2.*")"

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
echo -e "$JAUNE""Votre Fichier Final Est :""$NORMAL"
echo -e "$VERT""${Directory}/${PROG}_${ID}.mkv\n""$NORMAL"
sleep 1
exit 0  
