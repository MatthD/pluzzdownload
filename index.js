var scrap = require('scrap'),
    exctDate = require('extract-dates');

var title,
    subtitle,
    date,
    filename;
 
scrap('http://pluzz.francetv.fr/videos/complement_denquete_,128997496.html', function(err, $) {
  var title = $('#diffusion-titre').text(),
      subtitle = $("h1 .diffusion-paragraphe.soustitre").text().replace(/[^\w\s]/gi, '').trim(),
      date = $("h1").text();
  date = date.replace(title , "").replace(subtitle, "");
  date = exctDate(date);
  date = date[0].day + "-" + date[0].month + "-" + date[0].year;
  filename = title.replace(/\s/g , "_") + "-" + date + "-" + subtitle.replace(/\s\s+/g , "_") + ".mp4"
  console.log("Filename" , filename);
});

