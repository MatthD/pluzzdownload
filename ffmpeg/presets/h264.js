/*jshint node:true */
'use strict';

exports.load = function(ffmpeg) {
  ffmpeg
    .format('h264')
    .videoCodec('h264')
    .size('720x?')
    .audioBitrate('128k')
    .audioChannels(2)
    .audioCodec('libmp3lame')
    .outputOptions(['-vtag DIVX']);
};