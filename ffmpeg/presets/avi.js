/*jshint node:true */
'use strict';

exports.load = function(ffmpeg) {
  ffmpeg
    .format('avi')
    .videoCodec('mpeg4')
    .videoBitrate("3999")
    .size('720x?')
    .audioBitrate('128k')
    .audioChannels(2)
    .audioCodec('libmp3lame')
    .outputOptions(['-vtag DIVX']);
};