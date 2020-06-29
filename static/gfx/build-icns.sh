mkdir MyIcon.iconset
cp icon_1024x1024.png MyIcon.iconset/icon_512x512@2x.png
sips -z 512 512   MyIcon.iconset/icon_512x512@2x.png --out MyIcon.iconset/icon_512x512.png
sips -z 512 512   MyIcon.iconset/icon_512x512.png --out MyIcon.iconset/icon_256x256@2x.png
sips -z 256 256   MyIcon.iconset/icon_512x512.png --out MyIcon.iconset/icon_128x128@2x.png
sips -z 256 256   MyIcon.iconset/icon_512x512.png --out MyIcon.iconset/icon_256x256.png
sips -z 128 128   MyIcon.iconset/icon_256x256.png --out MyIcon.iconset/icon_128x128.png
sips -z 64 64     MyIcon.iconset/icon_128x128.png --out MyIcon.iconset/icon_32x32@2x.png
sips -z 32 32     MyIcon.iconset/icon_32x32@2x.png --out MyIcon.iconset/icon_32x32.png
sips -z 32 32     MyIcon.iconset/icon_32x32.png --out MyIcon.iconset/icon_16x16@2x.png
sips -z 16 16     MyIcon.iconset/icon_32x32.png --out MyIcon.iconset/icon_16x16.png
iconutil -c icns MyIcon.iconset
mv -f MyIcon.icns icon.icns
mkdir -p ../build/icons
cp -f icon.icns ../build/icons/icon.icns
cp -f MyIcon.iconset/icon_256x256.png ../build/icons/256x256.png
rm -R MyIcon.iconset
