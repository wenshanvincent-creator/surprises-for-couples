# Original browser-test fixture

`original-colors.webm` is a one-second, 64 × 64 VP8 test pattern generated for this repository, with no external footage or audio. It is covered by the repository's MIT license. FFmpeg is a generation tool and is not included in the product or required to run tests.

To regenerate with an installed FFmpeg executable:

```sh
ffmpeg -f lavfi -i testsrc=size=64x64:rate=10 -t 1 -c:v libvpx -pix_fmt yuv420p -an original-colors.webm
```

The tests also generate a small PCM WAV sine tone and provide a one-pixel PNG in source. Before export, the video must load decoded frames and advance its playback time in the editor. The same bytes must play after museum extraction while offline.
