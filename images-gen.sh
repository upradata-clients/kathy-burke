#!/bin/bash

file=$1
stem="${file%%.*}"
ext="${file##*.}"
size=$2
# for size in 480 640 800 960 256 512; do
#     convert $file -resize "$size"x "$stem"-"$size".png
# done

convert $file -resize "$size"x "$stem"-"$size"."$ext"
