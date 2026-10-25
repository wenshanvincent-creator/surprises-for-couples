# Original media fixture

`original-rose.webm` is an original 1-second, 64×64, 10 fps solid rose-color VP8 video. It contains no third-party footage or audio. It is covered by this repository's MIT license.

Regenerate with an FFmpeg build that supports PNG input and libvpx:

```sh
node tests/data/fixtures/generate-video.mjs /absolute/path/to/ffmpeg
```

The generator creates its own RGB PNG in code, encodes the video, and removes the intermediate PNG. FFmpeg is only needed to regenerate the committed fixture, not to run the tests or application.

Use this fixture for browser media checks instead of assuming canvas capture will produce a decodable video. On the verified local Chrome headless setup, MediaRecorder produced a 110-byte header without video frames; even the online source Blob failed to decode.
