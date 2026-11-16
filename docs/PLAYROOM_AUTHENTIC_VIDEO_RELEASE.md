# Playroom authentic-gameplay video — release checklist

Status: **staged website integration only**. This feature branch does not contain an MP4 and must not be represented as a published video.

## Intended asset
- Public page: https://mindago.my/#see-inside
- HTML source: `/assets/videos/mindago-playroom-activities-only-50s.mp4`
- Intended output: 1680 × 720 landscape H.264 MP4, approximately 50 seconds, real in-app screen recording only.
- Content: Picture Puzzle, Mathematics Counting, English Rhyme Play, Color & Paint — Car.
- No third-party imagery, no AI-generated replacements, no non-Playroom closing shots.
- Keep music and spoken instruction intelligible; check the cuts and volume at each activity transition.

## Important editorial gate
The existing 50-second Canva montage is **a review cut** drawn from the original recording. Its Mathematics section does **not** incorporate the separately approved 18-second replacement Mathematics Counting clip. Before treating this as the final customer-facing video, assemble and review the final four-activity montage using the user's preferred 18-second Mathematics footage. Do not silently publish the earlier Counting version.

## Publishing gate
1. In Canva, export the user-approved final montage using **Share → Download → MP4 Video**.
2. Watch the complete exported file at normal speed, with sound, on desktop and phone landscape. Confirm all four activities, no external footage, a valid first frame, and a clean ending.
3. Check the MP4 file size. Cloudflare Pages currently limits an individual static file to **25 MiB**. If under that size, place the MP4 at `assets/videos/mindago-playroom-activities-only-50s.mp4` in the website deployment. For larger files, host with Cloudflare R2/public custom domain and update both the video source and availability check appropriately (including CORS for cross-origin HEAD requests), or make an approved compressed export. Do not commit oversized media to GitHub.
4. The new video section uses `hidden` and only becomes visible after a same-origin HEAD request confirms the MP4 URL responds successfully with a video content type. Until the MP4 is present, the existing screenshot gallery remains unchanged.
5. QA at mobile portrait/landscape, tablet and desktop widths: responsive layout, no crop, poster, play/pause, seek, audio, captions if supplied later, keyboard controls, reduced-motion compatibility, navigation, and checkout link.
6. Inspect the live URL with a clean browser cache; verify `200` and `video/mp4` at the media URL, and verify the site reveals the video. If the asset is missing or fails, verify that the feature is hidden and the gallery still works.
7. Obtain explicit final review approval **before merging or deploying**. The feature branch alone is not a live release.

## Related Canva assets
- Four individual activity videos and montage folder: https://www.canva.com/folder/FAHbGARr2EY
- Mathematics replacement: `MindAgo Playroom - Mathematics Counting (18s)`, 18 seconds
- Original recording/master: preserved

No change to the Founding 50 purchase flow, prices, account permissions or customer entitlements is part of this branch.
