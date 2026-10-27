/* Edits library. One source of truth: the site, the brief and the skill reference all read this. */
window.EDITS = {
  build: "b1",

  /* ---------- colour ---------- */
  pal: {
    graphite: { name: "Graphite", line: "Product dark, one cobalt accent", use: "SaaS launches, screen tours, AI products", bg: "#0A0A0B", fg: "#F2F1EC", muted: "#3A3A41", accent: "#3D7BFF", accent2: "#0E1E46", surface: "#141417", surface2: "#1B1B1F", edge: "#2B2B31", onAccent: "#FFFFFF" },
    swiss: { name: "Swiss", line: "Off white, black, signal red", use: "Data, kinetic type, posters", bg: "#EFEDE6", fg: "#111111", muted: "#BDB9AE", accent: "#E5361B", accent2: "#8C1B0B", surface: "#FFFFFF", surface2: "#F6F4EE", edge: "#D6D2C7", onAccent: "#FFFFFF", light: true },
    cream: { name: "Editorial cream", line: "Warm paper, ink, terracotta", use: "Explainers, essays, founder films", bg: "#F3EEE3", fg: "#1B1814", muted: "#D2C8B5", accent: "#B4502B", accent2: "#6E2C14", surface: "#FBF8F1", surface2: "#F6F1E6", edge: "#DCD3C2", onAccent: "#FFFFFF", light: true },
    scd: { name: "Black, cream, red", line: "Sanjay Chauhan Designs brand", use: "Personal brand, talking heads, idents", bg: "#0B0B0B", fg: "#FFFDE2", muted: "#3A3934", accent: "#FF0101", accent2: "#5A0000", surface: "#141413", surface2: "#1C1C1A", edge: "#2E2D29", onAccent: "#FFFDE2" },
    acid: { name: "Acid", line: "Near black with acid lime", use: "Hook cuts, Gen Z, sports", bg: "#0C0C0C", fg: "#F4F4F0", muted: "#2E2E2E", accent: "#D4FF3A", accent2: "#3D4A0A", surface: "#151515", surface2: "#1D1D1D", edge: "#2C2C2C", onAccent: "#0C0C0C" },
    chrome: { name: "Chrome", line: "Silver, ink, electric blue", use: "Y2K, tech hardware, 3D", bg: "#D9DDE3", fg: "#0E1116", muted: "#A9B0BA", accent: "#2D5BFF", accent2: "#0A1A5C", surface: "#EEF1F5", surface2: "#E3E7EC", edge: "#BEC5CF", onAccent: "#FFFFFF", light: true },
    teal: { name: "Teal and orange", line: "The cinema grade", use: "Vlogs, travel, recaps, trailers", bg: "#0E2228", fg: "#F6EBDD", muted: "#2B4A52", accent: "#F08A3C", accent2: "#1E5560", surface: "#132C33", surface2: "#18363E", edge: "#25454D", onAccent: "#0E2228" },
    riso: { name: "Risograph", line: "Paper with fluoro pink and blue", use: "Posters, music, playful brands", bg: "#F4EFE1", fg: "#1E1E1E", muted: "#D8CFBA", accent: "#FF48B0", accent2: "#0078BF", surface: "#FBF7EC", surface2: "#F7F1E2", edge: "#DCD3BE", onAccent: "#1E1E1E", light: true },
    night: { name: "Night signal", line: "Ink black, one hot red", use: "Title sequences, beat edits, trailers", bg: "#07070A", fg: "#EDEDF2", muted: "#24242C", accent: "#FF2E4D", accent2: "#4A0A15", surface: "#101015", surface2: "#16161C", edge: "#26262F", onAccent: "#FFFFFF" },
    pastel: { name: "Soft studio", line: "Lilac paper, ink, peach", use: "3D loops, wellness, consumer apps", bg: "#F1ECF7", fg: "#1F1D2B", muted: "#D8D0E6", accent: "#7C5CFF", accent2: "#FFB4A2", surface: "#FFFFFF", surface2: "#F8F5FC", edge: "#DDD5EA", onAccent: "#FFFFFF", light: true },
    kodak: { name: "Warm film", line: "Brown black, gold, rust", use: "Vlogs, memory, food, weddings", bg: "#1F1712", fg: "#F5E6CF", muted: "#4A3A2E", accent: "#E9A23B", accent2: "#C0502E", surface: "#2A1F18", surface2: "#33261D", edge: "#46362A", onAccent: "#1F1712" },
    blueprint: { name: "Blueprint", line: "Cyan ink on navy, one yellow", use: "Engineering, how it works, diagrams", bg: "#0D2F55", fg: "#E9F1FF", muted: "#2B5687", accent: "#FFD23F", accent2: "#7A5B00", surface: "#12396A", surface2: "#16427A", edge: "#2F5D92", onAccent: "#0D2F55" },
    brut: { name: "Brutalist", line: "White, black, safety orange", use: "Fashion, manifestos, streetwear", bg: "#FFFFFF", fg: "#000000", muted: "#CFCFCF", accent: "#FF4F00", accent2: "#7A2600", surface: "#F4F4F4", surface2: "#EAEAEA", edge: "#D9D9D9", onAccent: "#000000", light: true },
    news: { name: "Newsprint", line: "Paper, ink, marker yellow", use: "Documentary, Vox style, history", bg: "#EFE6D4", fg: "#151412", muted: "#CFC2A8", accent: "#E9B10E", accent2: "#7A5A00", surface: "#F7F0E1", surface2: "#F2E9D7", edge: "#D6C8AC", onAccent: "#151412", light: true }
  },

  /* ---------- type ---------- */
  fonts: {
    geist: { name: "Geist", line: "Geist with Geist Mono for numbers", by: "Vercel", lic: "OFL, Google Fonts", d: "'Geist', sans-serif", b: "'Geist', sans-serif", dw: 600, use: "Product, SaaS, AI tools" },
    inter: { name: "Inter Tight", line: "Swiss neo grotesk, set tight", by: "Rasmus Andersson", lic: "OFL, Google Fonts", d: "'Inter Tight', sans-serif", b: "'Inter', sans-serif", dw: 700, use: "Data, interfaces, corporate" },
    instrument: { name: "Instrument Serif", line: "Condensed display serif with Instrument Sans", by: "Instrument", lic: "OFL, Google Fonts", d: "'Instrument Serif', serif", b: "'Instrument Sans', sans-serif", dw: 400, use: "Editorial, vlogs, title cards" },
    anton: { name: "Anton", line: "Condensed impact for captions and hooks", by: "Vernon Adams", lic: "OFL, Google Fonts", d: "'Anton', sans-serif", b: "'Inter', sans-serif", dw: 400, use: "Hook cuts, talking heads, sport" },
    archivo: { name: "Archivo Expanded", line: "Width axis 62 to 125, set wide", by: "Omnibus Type", lic: "OFL, Google Fonts", d: "'Archivo', sans-serif", b: "'Archivo', sans-serif", dw: 800, dv: "'wdth' 125", use: "Kinetic type, tech, motorsport" },
    anybody: { name: "Anybody", line: "Width 50 to 150, made to stretch", by: "Tyler Finck", lic: "OFL, Google Fonts", d: "'Anybody', sans-serif", b: "'Inter', sans-serif", dw: 800, dv: "'wdth' 112", use: "Beat edits, kinetic type, posters" },
    fraunces: { name: "Fraunces", line: "Soft old style display with Manrope", by: "Undercase Type", lic: "OFL, Google Fonts", d: "'Fraunces', serif", b: "'Manrope', sans-serif", dw: 600, dv: "'opsz' 144, 'SOFT' 50", use: "Explainers, food, warm brands" },
    bricolage: { name: "Bricolage Grotesque", line: "Characterful grotesk, optical sizes", by: "Mathieu Triay", lic: "OFL, Google Fonts", d: "'Bricolage Grotesque', sans-serif", b: "'Bricolage Grotesque', sans-serif", dw: 700, dv: "'opsz' 96", use: "Consumer apps, loops, playful" },
    space: { name: "Space Grotesk", line: "Techy grotesk with Space Mono", by: "Florian Karsten", lic: "OFL, Google Fonts", d: "'Space Grotesk', sans-serif", b: "'Space Grotesk', sans-serif", dw: 600, use: "Dev tools, crypto, hardware" },
    unbounded: { name: "Unbounded", line: "Wide geometric display with Onest", by: "NaN", lic: "OFL, Google Fonts", d: "'Unbounded', sans-serif", b: "'Onest', sans-serif", dw: 700, use: "Events, recaps, Gen Z" },
    shoulders: { name: "Big Shoulders", line: "Tall condensed display with Newsreader", by: "Patric King", lic: "OFL, Google Fonts", d: "'Big Shoulders Display', sans-serif", b: "'Newsreader', serif", dw: 800, use: "Documentary, labels, sport" },
    syne: { name: "Syne", line: "Gets wider as it gets bolder", by: "Bonjour Monde", lic: "OFL, Google Fonts", d: "'Syne', sans-serif", b: "'Inter', sans-serif", dw: 800, use: "Fashion, art, culture" }
  },

  /* ---------- motion feel ---------- */
  feels: {
    butter: { name: "Butter", line: "Lands fast, settles long", nums: [["Entry", "12 to 14 f, power4.out"], ["Exit", "9 to 10 f, power3.in, ends at speed"], ["Siblings", "1 to 3 f apart, uneven"], ["Words", "4 to 6 f apart"], ["Overshoot", "none; one popOver 1.08 per beat at most"]], when: "The default for almost everything. 60 to 72% of the travel happens in the first 4 frames, then a long soft tail.", code: "gsap.from(el, { y: 60, duration: 0.45, ease: 'power4.out' })" },
    snap: { name: "Snap", line: "Hard, quick, confident", nums: [["Entry", "6 to 8 f, expo.out"], ["Exit", "4 f, power3.in"], ["Words", "2 to 4 f apart"], ["Cuts", "every 0.3 to 1.5 s"]], when: "Hooks, talking heads, sport and anything judged by the swipe.", code: "gsap.from(el, { y: 40, duration: 0.24, ease: 'expo.out' })" },
    spring: { name: "Spring", line: "Physical bounce, once per film", nums: [["Damping", "0.55 playful, 0.72 to 0.85 premium"], ["UI spring", "k 320, d 30"], ["Containers", "k 170, d 26"], ["Rule", "one visible spring per film; never bounce.out or elastic"]], when: "Playful explainers and consumer apps. Use it once, on the thing that matters.", code: "spring(t) = 1 - e^(-z w t) (cos(wd t) + z w / wd sin(wd t))" },
    whip: { name: "Whip", line: "Fast in, fast out, blur at peak", nums: [["Length", "median 8 f"], ["Peak speed", "about 13% of frame per frame"], ["Blur", "10 px text, 18 to 20 px full frame"], ["Ease", "power4.in into the cut, power4.out after"]], when: "Location jumps, vlogs, music edits. The cut hides inside the blur.", code: "exit: x -115% power4.in + blur; entry: x 115% to 0 power4.out" },
    slam: { name: "Slam", line: "Arrives oversize, lands hard", nums: [["Scale", "1.5 to 3.5x down to 1"], ["Time", "3 to 5 f, power4.out"], ["Shake", "2 to 3 f, 4 to 10 px"], ["Spacing", "one word per beat"]], when: "Kinetic type on a beat, idents, hook words. Landed words are dead still.", code: "gsap.fromTo(word, { scale: 3.5 }, { scale: 1, duration: 0.15, ease: 'power4.out' })" },
    drift: { name: "Drift", line: "Slow, cinematic, unhurried", nums: [["Entry", "1 to 1.5 s, sine.inOut"], ["Camera", "100 to 106% over a shot"], ["Words", "8 to 12 f apart, voice led"]], when: "Title sequences, luxury, documentary, 3D products.", code: "gsap.from(el, { y: 30, duration: 1.2, ease: 'sine.inOut' })" },
    twos: { name: "On twos", line: "Hand made cadence at 12 fps", nums: [["Cadence", "hold each pose 2 f at 24 fps"], ["Code", "t = floor(t * 12) / 12"], ["Jitter", "0.5 to 2 px per pose, seeded"]], when: "Vox style, collage, paper, stop motion. Everything steps, nothing glides.", code: "const tq = Math.floor(t * 12) / 12; render(tq)" }
  },

  /* ---------- camera ---------- */
  cams: {
    push: { name: "Push in", line: "100 to 106% across the shot", nums: [["Scale", "1.00 to 1.06"], ["Ease", "easy ease, sine.inOut"], ["Reading holds", "3 to 5% push on report and CTA frames"]], when: "The default camera. Quietly says look closer." },
    pull: { name: "Pull back", line: "Reveal the whole board", nums: [["Scale", "1.16 to 1.00"], ["Ease", "power3.out"]], when: "Payoffs. When the count hits zero, pull back so we see everything clear." },
    pan: { name: "Pan", line: "Easy ease side to side", nums: [["Travel", "about 7% of frame"], ["Ease", "sine.inOut, slow start and stop"], ["Direction", "one current per film, default left"]], when: "Following a cursor or a line of objects." },
    orbit: { name: "Orbit", line: "Around the subject with parallax", nums: [["Rotation", "plus or minus 9 degrees"], ["Layers", "3 planes, near moves 1.5 to 2x far"]], when: "3D products, hero objects, title cards with depth." },
    dolly: { name: "Dolly zoom", line: "Subject holds, world stretches", nums: [["Foreground", "1.00 to 1.08"], ["Background", "1.16 to 1.02"]], when: "One unsettling moment per film. A realisation." },
    hand: { name: "Handheld", line: "Seeded noise, a human operator", nums: [["Position", "about 0.4% of frame"], ["Roll", "about 0.35 degrees"], ["Rule", "seeded, never Math.random"]], when: "Vlogs, fashion, documentary, anything that should feel shot." },
    crane: { name: "Crane", line: "Rises or drops through the frame", nums: [["Travel", "about 9% of frame height"], ["Ease", "sine.inOut"]], when: "Openers and endings. Up means elevation." },
    punch: { name: "Punch in", line: "A cut to a tighter crop", nums: [["Scale", "100% to 112 to 130%"], ["Hold", "at least 1.5 s"], ["Rule", "instant on the cut, never tweened"]], when: "Talking heads, on emphasis and topic changes only." },
    rack: { name: "Rack focus", line: "Focus moves from type to ground", nums: [["Blur", "10 px text, up to 18 px frame"], ["Ease", "power2.in and out"], ["Breathing", "lens scale about 1.06"]], when: "Moving the eye between two planes without a cut." },
    locked: { name: "Locked off", line: "No camera, the subject moves", nums: [["Rule", "life comes from the next element"]], when: "Loops, data, minimal edits, symmetrical frames." }
  },

  /* ---------- transitions ---------- */
  trans: {
    cut: { name: "Hard cut", line: "The default, 96% of pro cuts", nums: [["Length", "0 f"], ["Rule", "A accelerates into it, B's first frame already moving"]], when: "Always first. Strongest on action at peak speed." },
    curve: { name: "Cut the curve", line: "12% travel, mirrored power4", nums: [["Travel", "about 12% of frame (230 px at 1920)"], ["Total", "about 0.6 s"], ["Ease", "power4.in out, power4.out in"], ["Blur", "10 px text, 18 to 20 px frame"]], when: "The house default seam between scenes. Velocity matches across the cut." },
    zoom: { name: "Zoom through", line: "Push past A, B arrives from depth", nums: [["Exit", "1 to 1.2 in 0.2 s, power3.in"], ["Entry", "0.75 to 1 in 0.5 s, expo.out"], ["Split", "30% exit, 70% entry"], ["Rule", "if A grows, B also grows"]], when: "Going deeper into an idea. Never two texts visible at once." },
    izoom: { name: "Inverse zoom", line: "A recedes, B arrives in front", nums: [["Exit", "1 to 0.8"], ["Entry", "1.25 to 1"], ["Total", "about 0.7 s"]], when: "Arrival beats only. Stepping back to see more." },
    whip: { name: "Whip pan", line: "The cut hides in the blur", nums: [["Length", "8 f median, 7 to 15 f"], ["Cut", "5 f into a 10 f move"], ["Sound", "airy whoosh from 3 to 4 f before peak"]], when: "Location and topic jumps with energy." },
    smash: { name: "Smash cut", line: "Loud to quiet, or quiet to loud", nums: [["Length", "0 f, often after 2 to 6 f of silence"], ["Sound", "instant state change, no tail"]], when: "Comedy, reveals, contrast hooks." },
    push: { name: "Push", line: "B shoves A out of frame", nums: [["Length", "8 to 15 f full frame"], ["Ease", "halves of one power4.inOut"]], when: "Lists, galleries, carousel reels." },
    mask: { name: "Mask wipe", line: "A hard angled edge reveals B", nums: [["Sweep", "5 f accelerating for text, 10 to 16 f frame"], ["Angle", "about 12 degrees"]], when: "Clean chapter changes. Line replacements in type." },
    morph: { name: "Flood and contract", line: "The object becomes the next scene", nums: [["Flood", "clears the farthest corner x 1.05 in 0.3 to 0.35 s"], ["Then", "contracts into the next object"]], when: "When a button, logo or dot should become the next world." },
    rack: { name: "Rack cut", line: "Blur out, cut at peak, resolve", nums: [["Peak blur", "8 to 12 px, max 18"], ["Ease", "power2.in and out"], ["Rate", "at most once per 8 s"]], when: "Soft scene changes, memories, product details." },
    flash: { name: "Flash frame", line: "1 to 2 frames of white", nums: [["Length", "1 to 2 f at 30, 2 to 4 at 60"], ["Safety", "3 flashes per second at most"], ["Rule", "never stacked with a negative"]], when: "Beats, camera flash looks, impact." },
    neg: { name: "Negative", line: "B lands inverted for 2 frames", nums: [["Length", "1 to 3 f"], ["Rule", "only on a hit, never with a flash"]], when: "Fashion, beat edits, DZ style hits." },
    bars: { name: "Shutter bars", line: "Five bars wipe across and away", nums: [["Stagger", "1 to 2 f per bar"], ["Length", "8 to 15 f in, same out"]], when: "Chapter breaks. Use sparingly." },
    sweep: { name: "Light sweep", line: "A hard band of light crosses the cut", nums: [["Length", "12 to 30 f"], ["Blend", "screen, linear band, enters from an edge"], ["Rule", "never sits centred"]], when: "Warm films, memories, travel. The swap hides at full cover." },
    ramp: { name: "Speed ramp", line: "Accelerate out, decelerate in", nums: [["Ramp", "4 to 10 f between speeds"], ["Range", "100% to 300 to 800% and back"]], when: "Payoffs in action, sport, travel." },
    match: { name: "Match cut", line: "The shape survives the cut", nums: [["Position", "within 2% of frame"], ["Also", "same scale, colour and velocity"]], when: "Graphic matches: a dot becomes a sun, a button becomes a logo." }
  },

  /* ---------- text motion ---------- */
  texts: {
    mask: { name: "Line rise", line: "Each line rises out of its mask", nums: [["Travel", "yPercent 100 to 0"], ["Time", "10 to 12 f, power4.out"], ["Lines", "4 f apart"]], when: "The cleanest title move there is." },
    words: { name: "Word by word", line: "Words land on speech rhythm", nums: [["Hook", "2 to 4 f apart"], ["Headline", "4 to 6 f"], ["Voice led", "8 to 12 f"]], when: "Headlines and spoken lines." },
    chars: { name: "Letter cascade", line: "Letters 1 f apart, uneven", nums: [["Stagger", "1 f, gaps like 3,2,2,2"], ["Whole wave", "under 0.6 s"]], when: "Short words and names. Never paragraphs." },
    slam: { name: "Slam", line: "One word per beat, from oversize", nums: [["Scale", "1.5 to 3.5x to 1 in 3 to 5 f"], ["Shake", "2 to 3 f"]], when: "Beat edits and hooks." },
    scramble: { name: "Decode", line: "Glyphs cycle, then lock in order", nums: [["Lock", "left to right, 0.02 s per letter"], ["Rule", "seeded glyphs, fixed widths"]], when: "Tech, security, reveals of a name." },
    type: { name: "Typing", line: "Only inside a real input", nums: [["Speed", "21 to 30 characters per second"], ["Rhythm", "irregular, pause on spaces"], ["Caret", "blinks 0.53 s on, 0.53 s off"]], when: "Prompts and search bars. Never for headlines." },
    weight: { name: "Weight wave", line: "Each letter grows from thin to bold", nums: [["Axis", "wght 120 to 820"], ["Stagger", "0.03 s per letter"]], when: "Variable fonts, loops, brand moments." },
    stretch: { name: "Stretch", line: "Letters widen into place", nums: [["Axis", "wdth 50 to 112"], ["Time", "0.8 s, power4.out"]], when: "Anybody or Archivo. Sport, music, posters." },
    track: { name: "Tracking close", line: "Wide letter spacing pulls tight", nums: [["Spacing", "0.55 em to -0.035 em"], ["Time", "1.4 s, expo.out"]], when: "Title sequences and luxury." },
    karaoke: { name: "Caption hit", line: "Spoken word lights up", nums: [["Page", "1 to 3 words"], ["Lead", "word shows 0 to 2 f before it is said"], ["Pop", "scale 0.8 to 1 in 4 to 6 f"]], when: "Talking heads only. One caption system, one accent." }
  },

  /* ---------- texture and blending ---------- */
  tex: {
    grain: { name: "Film grain", line: "Overlay blend, new every frame", nums: [["Blend", "overlay or soft light"], ["Amount", "3 to 8%"], ["Rate", "24 fps, seeded"]], when: "Almost always. Kills banding, adds a shot feel." },
    paper: { name: "Paper fibre", line: "Multiply blend on light grounds", nums: [["Blend", "multiply"], ["Amount", "10 to 20%"]], when: "Documentary, explainers, editorial." },
    halftone: { name: "Halftone", line: "Dot screen at 45 degrees", nums: [["Screen", "60 to 120 lines across the frame"], ["Blend", "multiply or soft light"]], when: "Print, Vox, posters, archival." },
    scan: { name: "Scanlines", line: "CRT lines with a light flicker", nums: [["Pitch", "2 to 4 px at 1080"], ["Blend", "multiply"]], when: "Retro tech, screens inside screens." },
    dust: { name: "Dust and hairs", line: "Specks that change on twos", nums: [["Rate", "12 fps"], ["Blend", "screen"]], when: "Archival, film, title sequences." },
    vignette: { name: "Edge vignette", line: "Darkens the edges only", nums: [["Amount", "8 to 12%"], ["Rule", "off on white or negative frames, never a centre glow"]], when: "Dark films and 3D. Depth without a glow." },
    sweep: { name: "Light sweep", line: "A warm band crosses now and then", nums: [["Blend", "screen"], ["Shape", "linear band from an edge"]], when: "Warm films. Never a radial blob." },
    chroma: { name: "Colour fringe", line: "RGB split at cuts only", nums: [["Offset", "1 to 3 px at 1080"], ["When", "the 2 to 4 frames around a cut"]], when: "Energy at cuts. Never on held frames." },
    burst: { name: "Blur burst", line: "A 3 frame blur insert", nums: [["Length", "2 to 4 f"], ["Blur", "12 to 16 px"]], when: "Beat edits and fashion. Reads as a lens snap." },
    neg: { name: "Negative hit", line: "2 inverted frames on each new shot", nums: [["Length", "1 to 3 f"], ["Rule", "never with a flash on the same frame"]], when: "Fashion and beat edits." }
  },

  /* ---------- sound ---------- */
  sounds: {
    bed: { name: "Music bed and SFX", line: "A low bed, one sound per moment", nums: [["Music", "-20 LUFS"], ["Master", "-18 LUFS, true peak under -1 dBTP"], ["SFX", "3 to 4 dB over the bed in band"], ["Rule", "never the same sound on consecutive cuts"]] },
    beat: { name: "Cut to the beat", line: "The track is the clock", nums: [["Grid", "frames per beat = fps x 60 / BPM"], ["Cut", "on the beat or 1 f early"], ["Phrase", "change pattern every 4 or 8 bars"], ["Before the drop", "clear 0.2 to 0.5 s"]] },
    voice: { name: "Voice led", line: "The screen obeys the voice", nums: [["Pace", "2.5 to 3 words per second"], ["Duck", "music down 9 dB, 80 ms in, 300 ms out"], ["Rule", "never print the narration"]] },
    sfx: { name: "SFX only", line: "No music, every action sounds", nums: [["Clicks", "-6 to -10 dB, one dry layer"], ["Typing", "a texture, never a tick per letter"]] },
    silent: { name: "Silent loop", line: "For GIFs, sites and covers", nums: [["Loop", "last frame equals first"], ["Check", "0 px difference at the seam"]] }
  },

  ratios: {
    "16:9": { name: "16:9", px: "1920 x 1080", use: "YouTube, site hero, keynote, X" },
    "9:16": { name: "9:16", px: "1080 x 1920", use: "Reels, TikTok, Shorts" },
    "1:1": { name: "1:1", px: "1080 x 1080", use: "Feed, LinkedIn, X" },
    "4:5": { name: "4:5", px: "1080 x 1350", use: "Instagram and LinkedIn feed" },
    "21:9": { name: "21:9", px: "2520 x 1080", use: "Cinematic title cards" }
  },

  kinds: { type: "Type card", photo: "Footage", ui: "Product UI", bars: "Chart", object: "3D object", portrait: "Talking head", logo: "Logo build", collage: "Collage", doc: "Paper doc", grid: "Montage" },

  /* ---------- edit formats (each is a full recipe) ---------- */
  edits: {
    launch: {
      name: "Launch film", line: "Software doing one thing well", len: 30, fps: 60, ratios: ["16:9", "4:5", "9:16"],
      feel: "butter", cam: "push", trans: ["curve", "zoom", "cut"], text: "mask", font: "geist", pal: "graphite", tex: ["grain"], sound: "bed", world: "2d",
      pace: "12 to 15 compositions per 30 s, beats 1.4 to 3.5 s, no still stretch over 0.6 s, end card 1.5 to 2 s",
      scenes: [
        { name: "Hook", dur: 4, kind: "type", line: "200 tasks. Before lunch." },
        { name: "Problem", dur: 6, kind: "type", v: 1, line: "Copy. Paste. Repeat." },
        { name: "Product", dur: 8, kind: "ui", line: "Hand it to your agents.", prompt: "Hand off today's busywork" },
        { name: "Payoff", dur: 6, kind: "bars", line: "Hours back every week.", value: 4.5, suffix: "h" },
        { name: "Logo and CTA", dur: 6, kind: "logo", line: "Relay", sub: "Live today" }
      ],
      refs: [["Sanji Chien, SaaS launch videos with Claude", "https://higgsfield.ai/@sanjii/blogs/how-to-make-saas-launch-videos-with-claude-motion-skill-prompts", "Brief, 5 scene storyboard, fix and polish prompts"], ["Linear", "https://linear.app", "Dark UI, slow camera over interface, one accent"], ["Figma Config 2024 identity", "https://www.itsnicethat.com/features/figma-config-2024-identity-graphic-design-spotlight-090724", "Identity and motion designed in parallel"], ["echris6 motion video kit", "https://github.com/echris6/motion-video-kit", "28 launch films measured frame by frame"]],
      skills: ["launch-video", "motionmaxxing", "business-motion-film", "oversized-cursor", "cut-the-curve", "motion-doctrine"]
    },
    hook: {
      name: "Hook cut", line: "Won in the first second", len: 20, fps: 30, ratios: ["9:16"],
      feel: "snap", cam: "punch", trans: ["smash", "whip", "cut"], text: "slam", font: "anton", pal: "acid", tex: ["grain"], sound: "beat", world: "2d",
      pace: "frame 0 is finished, first change by frame 15 to 30, a pattern interrupt every 2 to 4 s",
      scenes: [
        { name: "Payoff first", dur: 1.6, kind: "photo", img: "dunk", line: "Nine seconds." },
        { name: "Setup", dur: 3.4, kind: "portrait", img: "bridge", line: "Here is how I cut every reel I post" },
        { name: "Turn", dur: 3, kind: "type", v: 1, line: "Cut on the snare." },
        { name: "Proof", dur: 4, kind: "grid", imgs: ["court", "dunk", "crowd", "flash"], line: "" },
        { name: "Loop", dur: 2, kind: "type", line: "Watch it again." }
      ],
      refs: [["Alex Hormozi", "https://www.youtube.com/@AlexHormozi", "Cuts every 1 to 3 s, Anton captions, one highlight colour"], ["Ali Abdaal", "https://www.youtube.com/@aliabdaal", "2 to 5 s shots, greyscale grade, yellow only accent"], ["MrBeast production guide", "https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/", "The first minute proves the thumbnail"]],
      skills: ["motionmaxxing", "reel-export", "cinematic-caption", "sound-effects"]
    },
    vlog: {
      name: "Vlog edit", line: "A day, a trip, a story", len: 60, fps: 24, ratios: ["16:9", "9:16"],
      feel: "butter", cam: "hand", trans: ["whip", "ramp", "cut"], text: "mask", font: "instrument", pal: "kodak", tex: ["grain", "sweep"], sound: "bed", world: "2d",
      pace: "cold open 10 to 20 s, B roll every 10 to 20 s, montage plates 4 to 12 f",
      scenes: [
        { name: "Cold open", dur: 3, kind: "photo", img: "dusk", line: "Day 214" },
        { name: "Title", dur: 2.5, kind: "type", line: "Tokyo, alone." },
        { name: "Montage", dur: 3, kind: "grid", imgs: ["street", "lanterns", "tokyo", "neon", "court", "window"], line: "" },
        { name: "Story", dur: 4, kind: "photo", img: "street", line: "The 4 a.m. ramen run" },
        { name: "Outro", dur: 2.5, kind: "type", v: 2, line: "See you tomorrow." }
      ],
      refs: [["Casey Neistat", "https://www.youtube.com/@casey", "Cut-offs, sped montage, whips between places"], ["Peter McKinnon", "https://www.youtube.com/@PeterMcKinnon", "In-camera transitions, cinematic B roll intro"], ["Sam Kolder", "https://www.instagram.com/samkolder/", "Speed ramps, luma transitions, masking"], ["Emma Chamberlain", "https://tubefilter.com/2019/06/10/emma-chamberlain-30-hours-editing-each-vlog/", "Zooms, on screen text, comic pauses"]],
      skills: ["hyperframes", "media-use", "sound-effects", "reel-export"]
    },
    talk: {
      name: "Talking head", line: "A person, tightened and lit", len: 45, fps: 30, ratios: ["9:16", "4:5"],
      feel: "snap", cam: "punch", trans: ["cut", "smash"], text: "karaoke", font: "anton", pal: "scd", tex: ["grain"], sound: "voice", world: "2d",
      pace: "jump cuts remove pauses over 6 to 10 f, punch-ins 112 to 130% on emphasis, B roll 1.5 to 3 s on the noun",
      scenes: [
        { name: "Hook line", dur: 3, kind: "portrait", img: "bridge", line: "Most edits fail in the first second" },
        { name: "B roll", dur: 2, kind: "photo", img: "neon", line: "" },
        { name: "Point", dur: 3.5, kind: "portrait", img: "hood", line: "Show the payoff before you explain it" },
        { name: "Key line", dur: 2, kind: "type", v: 1, line: "Payoff first." }
      ],
      refs: [["The Diary of a CEO Clips", "https://www.youtube.com/@TheDiaryOfACEO", "A separate clips channel built for retention"], ["Raj Shamani, Figuring Out", "https://www.youtube.com/@rajshamani", "Episodes shaped like a film"], ["Ali Abdaal", "https://www.youtube.com/@aliabdaal", "Captions beside the speaker, not over him"]],
      skills: ["cinematic-caption", "captions-overlay", "hyperframes-media", "reel-export"]
    },
    beat: {
      name: "Beat edit", line: "The music is the clock", len: 15, locked: true, bpm: 128, fps: 30, ratios: ["9:16"],
      feel: "snap", cam: "punch", trans: ["flash", "cut", "whip"], text: "slam", font: "anybody", pal: "night", tex: ["grain", "burst"], sound: "beat", world: "2d",
      pace: "cut on a grid unit, strobe plates 4 f, words 3 to 4 f apart held 0.9 s, max 3 flashes per second",
      scenes: [
        { name: "Count in", dur: 0.9375, kind: "photo", img: "crowd", line: "" },
        { name: "Hit", dur: 0.9375, kind: "type", v: 1, line: "Louder." },
        { name: "Plate", dur: 0.9375, kind: "photo", img: "dunk", line: "" },
        { name: "Plate", dur: 0.9375, kind: "photo", img: "friends", line: "" },
        { name: "Drop", dur: 1.875, kind: "collage", imgs: ["flash", "neon", "crowd", "friends"], line: "Every beat." },
        { name: "Plate", dur: 0.9375, kind: "photo", img: "neon", line: "" },
        { name: "Plate", dur: 0.9375, kind: "photo", img: "court", line: "" },
        { name: "Hit", dur: 1.875, kind: "type", v: 2, line: "Harder." },
        { name: "Run", dur: 1.875, kind: "grid", imgs: ["crowd", "dunk", "friends", "neon"], line: "" },
        { name: "Out", dur: 3.75, kind: "type", line: "Again." }
      ],
      refs: [["CapCut velocity edits", "https://www.capcut.com/explore/capcut-velocity-edit", "Montage, Hero, Bullet, Flash In curves"], ["Pentagram for MTV", "https://www.pentagram.com/work/mtv-world-creative-studio", "Logos as waveforms on the beat"], ["HyperFrames motion reel", "https://github.com/Sunwood-ai-labs/hyperframes-motion-reel-skill", "Every cut written on a beat"]],
      skills: ["hyperframes-motion-reel", "sound-effects", "motionmaxxing"]
    },
    kinetic: {
      name: "Kinetic type", line: "Words are the picture", len: 20, fps: 60, ratios: ["16:9", "1:1", "9:16"],
      feel: "slam", cam: "locked", trans: ["mask", "cut", "curve"], text: "slam", font: "archivo", pal: "swiss", tex: ["grain"], sound: "beat", world: "2d",
      pace: "music only: words 3 to 4 f apart, held 0.9 s; voice led: 8 to 12 f",
      scenes: [
        { name: "Line 1", dur: 2.2, kind: "type", line: "Make it move." },
        { name: "Line 2", dur: 2.2, kind: "type", v: 1, line: "Make it land." },
        { name: "Line 3", dur: 2.2, kind: "type", v: 2, line: "Then hold still." },
        { name: "Sign off", dur: 2.4, kind: "type", line: "Edits." }
      ],
      refs: [["Saul Bass, Anatomy of a Murder", "https://www.artofthetitle.com/title/anatomy-of-a-murder", "Cut paper and type as story"], ["Studio Dumbar, Cities in Motion", "https://studiodumbar.com/work/cities-in-motion", "Variable type driven by code"], ["Animography", "https://animography.net", "Animated typefaces"], ["DixonBaxi, The CW", "https://www.itsnicethat.com/news/dixonbaxi-the-cw-graphic-design-240124", "A logo that becomes the stage"]],
      skills: ["motionmaxxing", "cut-the-curve", "hyperframes-registry"]
    },
    explainer: {
      name: "2D explainer", line: "One idea, drawn clearly", len: 60, fps: 30, ratios: ["16:9", "9:16"],
      feel: "butter", cam: "pan", trans: ["morph", "curve", "push"], text: "words", font: "fraunces", pal: "cream", tex: ["paper", "grain"], sound: "voice", world: "2d",
      pace: "one idea per scene, 3 to 8 s each, every element arrives on its spoken noun",
      scenes: [
        { name: "Question", dur: 3, kind: "type", line: "Why do some edits feel expensive?" },
        { name: "Idea", dur: 3.5, kind: "type", v: 2, line: "They land fast and settle slow." },
        { name: "Proof", dur: 4, kind: "bars", line: "60 to 72% of the move in 4 frames.", value: 72, suffix: "%" , vals: [.18, .42, .72, .86, .94, 1]},
        { name: "Takeaway", dur: 3, kind: "type", v: 1, line: "Decelerate in." }
      ],
      refs: [["Kurzgesagt in 1,200 hours", "https://also.kottke.org/20/02/how-to-make-a-kurzgesagt-video-in-just-1200-hours", "One world, music written to picture"], ["Giant Ant", "https://www.giantant.ca", "Warm character work with ideas"], ["Ordinary Folk", "https://ordinaryfolk.co", "Shape language with a reason"], ["Buck", "https://buck.co", "Craft across 2D and 3D"]],
      skills: ["category-explainer-video-script-v2", "us-native-script", "hyperframes", "text-to-lottie"]
    },
    product3d: {
      name: "3D product", line: "One object, lit like a studio", len: 15, fps: 60, ratios: ["16:9", "1:1"],
      feel: "drift", cam: "orbit", trans: ["rack", "zoom"], text: "track", font: "geist", pal: "pastel", tex: ["grain"], sound: "bed", world: "3d",
      pace: "a 30 to 60 degree arc in 3 to 5 s, never a constant spin, silence before the first full frame",
      scenes: [
        { name: "Reveal", dur: 3.5, kind: "object", line: "Made to be held." },
        { name: "Detail", dur: 3, kind: "object", line: "4.2 mm thin." },
        { name: "Name", dur: 3, kind: "logo", line: "Slab", sub: "Available now" }
      ],
      refs: [["ManvsMachine", "https://mvsm.com", "Nike Air Max: scanned product, C4D, Houdini"], ["Apple HIG, motion", "https://developer.apple.com/design/human-interface-guidelines/motion", "Motion that supports, never carries alone"], ["Andrew Kramer", "https://www.videocopilot.net", "One continuous camera through titles"]],
      skills: ["three", "threejs-materials", "threejs-lighting", "business-motion-film", "title-sequence-3d"]
    },
    ident: {
      name: "Logo ident", line: "Two to five seconds of brand", len: 5, fps: 60, ratios: ["16:9", "1:1", "9:16"],
      feel: "butter", cam: "push", trans: ["cut"], text: "mask", font: "geist", pal: "scd", tex: ["grain"], sound: "sfx", world: "2d",
      pace: "mark assembles in about 7 f, wordmark from 3.5x, hold 0.6 to 1.4 s after the last element",
      scenes: [
        { name: "Build", dur: 3.2, kind: "logo", line: "Sanjay", sub: "Design and build" },
        { name: "Hold", dur: 1.6, kind: "type", v: 1, line: "Let's make it." }
      ],
      refs: [["Netflix ta-dum", "https://slashfilm.com/netflixs-signature-launch-sound-was-almost-the-bleating-of-a-goat", "A sound that works without the picture"], ["DixonBaxi for Hulu", "https://www.designweek.co.uk/issues/5-11-april-2021/dixonbaxi-hulu-rebrand/", "The vessel comes from the wordmark"], ["Pentagram, EDP", "https://pentagram.com/work/edp/story", "A dot on a path draws the mark"]],
      skills: ["motionmaxxing", "sound-effects", "hyperframes"]
    },
    titles: {
      name: "Title sequence", line: "A slow camera through names", len: 12, fps: 24, ratios: ["21:9", "16:9"],
      feel: "drift", cam: "crane", trans: ["rack", "sweep"], text: "track", font: "instrument", pal: "night", tex: ["grain", "dust", "vignette"], sound: "bed", world: "3d",
      pace: "one slow dolly forward and slightly up, title in the last third, no shake or spin",
      scenes: [
        { name: "Open", dur: 3, kind: "photo", img: "neon", bw: true, line: "A film by Sanjay" },
        { name: "Alley", dur: 3, kind: "photo", img: "lanterns", line: "" },
        { name: "Title", dur: 3.5, kind: "type", v: 0, line: "Night Shift" }
      ],
      refs: [["Kyle Cooper, Se7en", "https://imaginaryforces.com/project/se7en", "Hand made, scratched, from the killer's hand"], ["Saul Bass, Anatomy of a Murder", "https://www.artofthetitle.com/title/anatomy-of-a-murder", "A climate for the story"], ["Art of the Title", "https://www.artofthetitle.com", "The archive of title design"]],
      skills: ["title-sequence-3d", "three", "threejs-postprocessing"]
    },
    data: {
      name: "Data story", line: "One number that changes minds", len: 20, fps: 60, ratios: ["16:9", "4:5"],
      feel: "butter", cam: "push", trans: ["curve", "izoom"], text: "words", font: "inter", pal: "swiss", tex: [], sound: "bed", world: "2d",
      pace: "axes first, then data, then the annotation on the spoken number; reading hold 1.5 to 3 s with a 3 to 5% push",
      scenes: [
        { name: "Claim", dur: 3, kind: "type", line: "Edits got faster." },
        { name: "Chart", dur: 4, kind: "bars", line: "Cuts per minute, 2016 to 2026", value: 3.2, suffix: "x" },
        { name: "Point", dur: 3, kind: "type", v: 2, line: "Hold still anyway." }
      ],
      refs: [["Bloomberg, What's Really Warming the World", "https://datastori.es/behind-the-scenes-of-whats-really-warming-the-world-with-the-bloomberg-team-ds59/", "One factor at a time"], ["The Pudding", "https://pudding.cool", "Few words, motion that is the insight"], ["Hans Rosling, 200 Countries", "https://www.brainpickings.org/2010/12/03/hans-rosling-bbc/", "A chart narrated like sport"]],
      skills: ["animated-chart", "milestone-reveal", "hyperframes"]
    },
    doc: {
      name: "Documentary", line: "Paper, maps, evidence", len: 45, fps: 24, ratios: ["16:9", "9:16"],
      feel: "twos", cam: "push", trans: ["cut", "mask"], text: "mask", font: "shoulders", pal: "news", tex: ["paper", "grain"], sound: "voice", world: "2d",
      pace: "8 to 14 one sentence shots, first surprise inside 5 s, every fact sourced on screen",
      scenes: [
        { name: "Place", dur: 3.5, kind: "doc", img: "tokyo", line: "Shinjuku, 1964" },
        { name: "Evidence", dur: 3.5, kind: "doc", img: "lanterns", line: "One street, 41 bars" },
        { name: "Turn", dur: 2.5, kind: "type", v: 1, line: "Then the trains came." }
      ],
      refs: [["Vox", "https://www.youtube.com/@Vox", "Visual evidence, numbers, shape annotations"], ["Johnny Harris", "https://www.youtube.com/@johnnyharris", "GEOlayers maps, Mapbox styles"], ["Dhruv Rathee", "https://www.youtube.com/@dhruvrathee", "Hindi English narration with maps and clippings"]],
      skills: ["vox-explainer", "hyperframes", "us-native-script"]
    },
    fashion: {
      name: "Fashion reel", line: "Flash, cut, negative, repeat", len: 15, fps: 30, ratios: ["9:16", "4:5"],
      feel: "snap", cam: "hand", trans: ["flash", "neg", "cut"], text: "slam", font: "syne", pal: "brut", tex: ["grain", "burst"], sound: "beat", world: "2d",
      pace: "plates 4 to 10 f, hero frames 0.5 to 1.5 s, random cut lengths from a seed, max 3 flashes per second",
      scenes: [
        { name: "Open", dur: 2, kind: "collage", imgs: ["window", "bridge", "flash", "grass"], line: "Wear it loud." },
        { name: "Hero", dur: 1.6, kind: "photo", img: "window", line: "" },
        { name: "Wall", dur: 2, kind: "collage", imgs: ["grass", "flash", "bridge", "window"], line: "" },
        { name: "Name", dur: 1.6, kind: "type", v: 1, line: "Drop 04" }
      ],
      refs: [["brat, Charli XCX", "https://www.posterhouse.org/blog/the-rise-and-fall-of-brat/", "Lowercase, stretched, 500 greens tested"], ["Spotify Wrapped 2025", "https://rive.app/blog/spotify-used-rive-for-spotify-wrapped-2025", "Visual mixtape, built in Rive"], ["Jacquemus FOOH", "https://fooh.com/library/jacquemus-driving-bags-rolling-in-paris", "One impossible object on a real street"]],
      skills: ["hyperframes", "motionmaxxing", "sound-effects"]
    },
    tour: {
      name: "Screen tour", line: "How a real tool works", len: 90, fps: 30, ratios: ["16:9"],
      feel: "butter", cam: "push", trans: ["curve", "zoom"], text: "mask", font: "inter", pal: "graphite", tex: [], sound: "voice", world: "2d",
      pace: "real screens 1:1, the camera frames one interaction at a time, the cursor only where it truly clicks",
      scenes: [
        { name: "Where", dur: 3, kind: "type", line: "Find the prompt bar." },
        { name: "Do", dur: 7, kind: "ui", line: "Type the task, press Run.", prompt: "Summarise this week's tickets" },
        { name: "Result", dur: 4, kind: "bars", line: "Tickets closed this week", value: 38, suffix: "" }
      ],
      refs: [["Mobbin", "https://mobbin.com", "Real screens to rebuild 1:1"], ["Screen Studio", "https://screen.studio", "Auto zoom on clicks, smooth cursor"]],
      skills: ["zero-video", "launch-video", "oversized-cursor", "us-native-script"]
    },
    recap: {
      name: "Event recap", line: "Faces, light, noise, a beat", len: 30, fps: 30, ratios: ["9:16", "16:9"],
      feel: "snap", cam: "hand", trans: ["whip", "flash", "cut"], text: "mask", font: "unbounded", pal: "teal", tex: ["grain", "sweep"], sound: "beat", world: "2d",
      pace: "montage 4 to 12 f plates on the beat, one hero face per 4 bars, the name in the last 15%",
      scenes: [
        { name: "Doors", dur: 2.5, kind: "grid", imgs: ["crowd", "friends", "neon", "flash", "court", "dunk"], line: "" },
        { name: "Crowd", dur: 2, kind: "photo", img: "crowd", line: "Night one" },
        { name: "Faces", dur: 2, kind: "photo", img: "friends", line: "" },
        { name: "Name", dur: 2.5, kind: "type", v: 1, line: "See you next year." }
      ],
      refs: [["Casey Neistat", "https://www.youtube.com/@casey", "Montage compressed on the beat"], ["Sam Kolder", "https://www.instagram.com/samkolder/", "Ramps and whips that keep moving"]],
      skills: ["sound-effects", "hyperframes-motion-reel", "reel-export"]
    },
    loop: {
      name: "Loop", line: "Seamless, for sites and covers", len: 8, fps: 30, ratios: ["1:1", "4:5"],
      feel: "butter", cam: "locked", trans: ["cut"], text: "weight", font: "bricolage", pal: "pastel", tex: ["grain"], sound: "silent", world: "2d",
      pace: "move 0 to 2.2 s, hold to 6.6 s, return by 8 s; frame 0 equals frame 240",
      scenes: [
        { name: "Move", dur: 4, kind: "type", line: "Made to loop." },
        { name: "Return", dur: 4, kind: "object", line: "" }
      ],
      refs: [["Charlie Hills motion skills", "https://github.com/charlie947/motion-graphics-skills", "Loop covers, seam measured at 0 px"]],
      skills: ["loop-cover", "motion-effects", "milestone-reveal"]
    }
  },

  /* ---------- the crew ---------- */
  pipeline: [
    { n: "00", stage: "Intake", role: "Producer", does: "Reads the brief, turns every adjective into a number, locks the spec. Asks only what blocks the film, in one batch of three questions at most.", out: "BRIEF.md, SPEC.md", skills: ["brand-intake", "motion-brief-writer"] },
    { n: "01", stage: "Research", role: "Researcher", does: "Splits each reference into moves and look. Pulls frames every 0.5 s. Gathers the real things: UI, logos, data with sources, licensed footage and photos.", out: "RESEARCH.md, FACTS.md, refs/", skills: ["reference-to-motion", "hyperframes-registry", "claude-video-vision"] },
    { n: "02", stage: "Script", role: "Writer", does: "One sentence spine split across beats. Voice in the native US manager register at 2.5 to 3 words a second. On screen words are never the narration.", out: "SCRIPT.md", skills: ["us-native-script", "category-explainer-video-script-v2", "coach-copy"] },
    { n: "03", stage: "Storyboard", role: "Director", does: "The source of truth: every scene with frames, what is on screen, motion, camera, the seam out and the sound cue. One hero per frame, one current per film.", out: "STORYBOARD.md, ledger.json", skills: ["motionmaxxing", "motion-doctrine", "business-motion-film"] },
    { n: "04", stage: "Look", role: "Designer", does: "MOTION.md tokens: three type sizes, colour roles, ease tokens, grids and safe zones for every ratio. Then 3 to 4 stills at the hero moments.", out: "MOTION.md, stills/", skills: ["brand-intake", "figma", "sanjay-motion-tools styles"] },
    { n: "A", stage: "Gate A", role: "Sanjay", does: "Storyboard and stills on one live link. Nothing animates before a yes, unless the brief says go straight to render.", out: "Approved stills", skills: [], gate: true },
    { n: "05", stage: "Animate", role: "Animator", does: "Builds each scene in HyperFrames as seek safe HTML and GSAP. Real UI rebuilt as vectors. three.js for 3D. Searches the registry before hand building anything.", out: "film/index.html, scenes/", skills: ["hyperframes", "motionmaxxing", "gsap", "three", "oversized-cursor"] },
    { n: "06", stage: "Edit", role: "Editor", does: "Seams, pacing and the beat grid. Two to three transition kinds, repeated. Cuts on words or on the grid, never both. No still stretch over 0.6 s.", out: "Master timeline, seam gate pass", skills: ["motion-doctrine", "cut-the-curve", "seam-craft"] },
    { n: "07", stage: "Sound", role: "Sound designer", does: "Cue list, one sound per moment, never the same on consecutive cuts. Music bed -20 LUFS, master -18, ducked under voice. His track, never ripped.", out: "mix.wav, SOUND.md, CREDITS", skills: ["sound-effects", "sanjay-motion-tools sound kit"] },
    { n: "08", stage: "Finish", role: "Colourist", does: "Grade, grain and texture with real blend modes. Flash safety check. Recomposes every ratio from the timeline, never crops. H.264, yuv420p, bt709.", out: "renders/, cover still", skills: ["media-use", "reel-export", "hyperframes-cli"] },
    { n: "09", stage: "QA", role: "Critic", does: "Never the builder. Contact sheet, cut strip and phone sheet at 2x. Scans copy for dashes and banned words, checks fades, glows, spills, holds, fonts at frame 0 and loudness on the MP4.", out: "REVIEW.md", skills: ["motionmaxxing look and lint", "hyperframes check", "business-motion-film gauntlet"] },
    { n: "B", stage: "Gate B", role: "Sanjay", does: "One live https link, byte verified: an interactive player plus the MP4s. Notes come back through the Notes tab, one line each.", out: "Live link", skills: [], gate: true },
    { n: "10", stage: "Library", role: "Librarian", does: "New reusable moves become numbered components (MG001 and up) with their numbers. Every version stays on disk.", out: "library entry", skills: ["sanjay-motion-tools library"] }
  ],

  laws: [
    ["Storyboard first", "The storyboard is the source of truth. No scene is reordered, added or dropped without asking. Without it, Claude guesses and everything moves at once."],
    ["Every adjective becomes a number", "Fast is 6 to 8 frames. A slow push is 100 to 106%. Reading time is 0.2 s a word with a 0.45 s floor."],
    ["Land soft, leave fast", "Entries put most of their travel in the first 4 frames, then a long tail. Exits accelerate, end at full speed and run about 25% shorter."],
    ["Move as a family", "Related things sit under one parent and move 1 to 3 frames apart. The next move starts before the last one settles."],
    ["Never idle, never wobble", "Something changes on almost every frame, but landed type is dead still. Life comes from the next element, the real UI or a camera with intent."],
    ["Cut on motion", "A cut works when A accelerates into it and B's first frame is already moving. Two or three transition kinds per film, repeated."],
    ["The screen obeys the voice", "Whatever is spoken is the brightest thing on screen, on the word. The voice carries the words; narration is never printed."],
    ["Real things stay real", "Real UI rebuilt as vectors so the camera can zoom, real logos, real data with its source, real footage. Nothing invented."],
    ["One hero, one accent, three sizes", "One thing to look at per frame, one accent colour, three type sizes, tracking -0.035 em at 30 px and up."],
    ["Stills before motion, a critic before shipping", "Approve 3 to 4 stills first. The builder never judges its own film."]
  ],

  bans: [
    "Radial or centre glow, inner glow, bloom haze, lens flares, neon glow",
    "Opacity fade entrances and exits, crossfades between scenes",
    "Eyebrow tags, body tags and filler micro text",
    "Em dashes and en dashes in any copy",
    "Underlines for emphasis",
    "Glitch as a transition (hover only)",
    "bounce.out and elastic eases",
    "The same sound on consecutive cuts, a whoosh on every cut",
    "Captions that print the narration",
    "Circle iris as the default wipe",
    "Glass panels and UI floating on a gradient void with drop shadows",
    "Stat slides, \"Meet X\", \"seamless\", \"Not just X. It's Y.\"",
    "Synthesised music, time stretched voice takes",
    "More than 3 flashes in any second"
  ],

  numbers: [
    ["Median move", "10 f at 30 fps (0.33 s)", "motionmaxxing, 4,288 moves"],
    ["Entry, translate or scale", "12 f, power4.out", "motionmaxxing"],
    ["Exit", "9 to 10 f, power3.in, ends at speed", "motionmaxxing"],
    ["Sibling stagger", "1 to 3 f, uneven", "motionmaxxing"],
    ["Word cadence", "2 to 4 f hook, 4 to 6 headline, 8 to 12 voice led", "motionmaxxing"],
    ["Reading hold", "0.2 s a word, floor 0.45 s", "motionmaxxing"],
    ["End hold", "0.6 to 1.4 s, final shot under 25% of the film", "motionmaxxing G3"],
    ["Overshoot", "on under 9% of moves; popOver 1.08 at t 0.72", "motionmaxxing"],
    ["Seam travel", "about 12% of frame, mirrored power4", "cut-the-curve"],
    ["Seam blur", "10 px text, 18 to 20 px full frame", "cut-the-curve"],
    ["Zoom through", "1 to 1.2 in 0.2 s, then 0.75 to 1 in 0.5 s", "cut-the-curve"],
    ["Stillness before the climax", "0.3 to 0.75 s", "motion-doctrine"],
    ["Premium spring damping", "0.7 to 0.85", "hyperframes, howseen"],
    ["Cursor", "about 5% of frame inside a mock; click 0.84 in 0.1 s, back in 0.22 s", "oversized-cursor"],
    ["Typing", "21 to 30 characters per second", "motionmaxxing"],
    ["30 s launch", "12 to 15 compositions, beats 1.4 to 3.5 s", "echris6, 28 films"],
    ["Hook", "frame 0 finished, first change by frame 15 to 30", "echris6, short form research"],
    ["Punch in", "112 to 130%, hold 1.5 s", "talking head research"],
    ["Beat grid", "frames per beat = fps x 60 / BPM", "hyperframes"],
    ["Flash safety", "3 flashes per second at most", "WCAG 2.3.1"],
    ["Music and master", "-20 LUFS music, -18 master, true peak under -1 dBTP", "sanjay-motion-tools sound kit"],
    ["Duck under voice", "9 dB, 80 ms in, 300 ms out", "motionmaxxing"],
    ["9:16 safe band", "text between y 360 and 1420, right 120 px clear", "reel-export"],
    ["Title safe", "80% box for text, 90% for action", "hyperframes"],
    ["Film lettering", "-0.035 em at 30 px and up, -0.02 em below", "house rule"]
  ],

  /* ---------- revision notes ---------- */
  notes: [
    { g: "Canvas", items: [
      "Lock the canvas to the master size and position everything from the centre, not the edges.",
      "Keep every headline and logo inside the title safe box for every ratio.",
      "Nothing spills its container. Check every label, button and bezel at 2x.",
      "Recompose this ratio from the timeline. Do not crop the master."
    ] },
    { g: "Timing", items: [
      "Make the count last about one second. Long enough to read, quick enough not to drag.",
      "Hold the key frame 1.5 s before the next move.",
      "Words land 4 to 6 frames apart here, not all at once.",
      "Cut 2 frames earlier so the cut lands on the beat.",
      "Clear the sound for 0.3 s before the biggest move.",
      "End hold is too long. Bring it to 0.6 to 1.4 s with one thing still alive."
    ] },
    { g: "Motion", items: [
      "Bring the cards in one by one, a few frames apart, and let each land before its check appears.",
      "Entries land faster: power4.out, most of the travel in the first 4 frames.",
      "Exits leave faster than they came in and end at full speed.",
      "This fades in. Replace it with a rise out of a mask or a scale from its origin.",
      "Related elements move as one family, 1 to 3 frames apart.",
      "Landed type is wobbling. Make it dead still and move the camera instead."
    ] },
    { g: "Camera", items: [
      "Slow the pan down and give it an easy ease so it starts and stops softly.",
      "When the counter hits zero, pull the camera back so we see the whole board.",
      "Push in 100 to 106% across this shot.",
      "Zoom into the button on the click, about 130%, then ease back out."
    ] },
    { g: "Type", items: [
      "Load the font before frame 0. No fallback frames.",
      "Tighten tracking to -0.035 em on everything 30 px and up.",
      "Three type sizes only. Merge the extra size into the nearest one.",
      "This line is printed narration. Cut it and let the voice carry it."
    ] },
    { g: "Look", items: [
      "Remove the glow. Depth comes from the edge vignette, grain and light.",
      "Add grain at 5% so the gradients stop banding.",
      "One accent colour. Take the second accent out.",
      "Swap the screenshot for rebuilt vector UI so the zoom stays sharp."
    ] },
    { g: "Polish", items: [
      "Make the cursor hesitate between tabs for about a second, like a real person losing track.",
      "Give each card a small pulse when it starts working.",
      "Cascade the checkmarks down the list instead of showing them together.",
      "Give the counter a hit on its last value: scale 1.04 and back in 6 frames."
    ] },
    { g: "Sound", items: [
      "Music is too loud. Bed at -20 LUFS, master -18.",
      "Two cuts in a row use the same sound. Give each moment its own.",
      "Land the click on the press frame, not after it.",
      "Duck the music 9 dB under the voice."
    ] }
  ]
};
