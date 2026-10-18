# Narration script for the MSc animation

Until you add recordings, the site reads these lines aloud with the visitor's
browser voice (the text lives in _includes/msc-film.html as data-narration).
Your own recordings, once added, replace the browser voice automatically.

Record one short clip per scene. Speak slowly, about 2.5 words per second.
Each scene lasts at least 6 seconds and stretches to fit your clip.

Save the clips as scene-1.mp3 to scene-8.mp3 (or .m4a), upload them to
assets/audio/, then set `film_audio: true` in _config.yml
(and `film_audio_ext: m4a` if your files are .m4a).

**Scene 1. Marine sediment**
My MSc project began on the seabed. I screened more than thirty-five bacterial isolates from marine sediment, and two of them, Bacillus altitudinis and Bacillus hwajinpoensis, became the focus of this work.

**Scene 2. Culture with and without chitin**
Marine bacteria constantly meet chitin, the polymer in crustacean shells. So I grew each isolate twice: once in standard medium, and once with chitin added.

**Scene 3. Cell-free supernatant**
After growth, I centrifuged the cultures to pellet the cells. What remains, the cell-free supernatant, carries whatever the bacteria secreted.

**Scene 4. Antifungal test**
I tested those supernatants against the yeast Candida albicans by agar diffusion. Only the cultures grown with chitin produced a clear zone, under the conditions I tested.

**Scene 5. Chitinase assay**
To ask whether the bacteria were breaking chitin down, I used a colorimetric assay for chitinase activity, read on a spectrophotometer.

**Scene 6. Cell viability**
A preliminary MTT assay on VERO cells gave a first look at how the supernatants affect mammalian cells.

**Scene 7. Genome mining**
In parallel, I mined both genomes with antiSMASH to predict biosynthetic gene clusters, and used PCR to target sequences linked to non-ribosomal peptide synthetases.

**Scene 8. Result**
So the result is a condition-dependent antifungal activity, not a new compound. Which molecule is responsible, how it works, and which pathway makes it are the questions I want to answer next.
