/*jshint node:true */
'use strict';

exports.load = function(ffmpeg) {
  ffmpeg
  	.format('mp4')
  	.videoBitrate('10000')
  	.outputOptions(["-c copy","-map 0","-flags -global_header","-movflags frag_keyframe","-bsf:a aac_adtstoasc"])
};