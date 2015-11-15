/*jshint node:true */
'use strict';

exports.load = function(ffmpeg) {
  ffmpeg
    .format('mp3')
    .noVideo()
    .audioBitrate('128k')
    .audioChannels(2)
    .audioCodec('libmp3lame');
};