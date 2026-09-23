# World 1 PNG Library

Keep original PNGs here. Vite resolves and fingerprints them; do not move them into `public` or add absolute filesystem URLs. No supplied image has been edited or moved.

| Folder | Expected filenames | Purpose |
| --- | --- | --- |
| backgrounds | sky.png, far_mountains.png, distant_temple.png, forest_back.png, forest_front.png | Independent parallax planes |
| tiles | grass_top.png, dirt.png, stone.png, grass_edge_left.png, grass_edge_right.png, platform.png | Terrain art only, never collision masks |
| decorations | tree_01.png, bush_01.png, flower_01.png, rock_01.png, vine_01.png, ruins_01.png | Non-colliding scenery |
| hazards | spikes.png, falling_rock.png | Hazard visuals; collision is configured independently |
| props | crate.png, checkpoint.png, gate.png | Optional future prop artwork; these PNGs are not present yet |

The supplied grass strip has substantial transparent padding. Tree and spike files are individual cutouts. Use per-placement `crop: [sourceX, sourceY, sourceWidth, sourceHeight]` metadata to select visible source pixels without rewriting the PNG. Terrain supports per-part crops via `parts.fill`, `parts.top`, `parts.left`, `parts.right`. Calibrate source crops and display sizes before switching a level to asset mode.

Backgrounds other than sky should have real alpha transparency. Seamless horizontal exports are useful for a future repeating-tile renderer; the current renderer stretches each layer across its parallax travel range and does not assume these images tile seamlessly. Keep foreground vegetation short and away from combat silhouettes. Export production-size PNGs when art is final: many supplied files are 1-2 MB each. Only referenced assets are downloaded, and placeholder mode downloads none of this library.

No more images are necessary for this architecture pass. Optional next assets: crate, checkpoint flag and gate PNGs in `props/`, plus tightly trimmed terrain exports. Menu/reference images in `public/assets` remain unchanged and are not used as World 1 gameplay backgrounds.

See `docs/world1-environment.md` for configuration examples and implementation boundaries.
