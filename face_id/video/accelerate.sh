ffmpeg -i wb2.mov -filter_complex "[0:v]setpts=0.7*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" output.mov

