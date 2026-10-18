(function () {
  var film = document.getElementById('msc-film'); if (!film) return;
  var scenes = Array.prototype.slice.call(film.querySelectorAll('.scene'));
  var cap = film.querySelector('.film-cap'), bar = film.querySelector('.film-bar i');
  var toggle = film.querySelector('[data-toggle]'), big = film.querySelector('[data-play]');
  var chapters = Array.prototype.slice.call(film.querySelectorAll('[data-go]'));
  var voiceBtn = film.querySelector('[data-voice]');
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var DUR = 7000, MAXDUR = 30000, i = 0, elapsed = 0, t0 = 0, playing = false, ended = false, voiceOn = true;

  // ---- Narration source 1: recorded clips (assets/audio/scene-N.ext), used when film_audio is on.
  var base = film.getAttribute('data-audio'), ext = film.getAttribute('data-audio-ext') || 'mp3', clips = [];
  if (base) {
    clips = scenes.map(function (_, k) {
      var a = new Audio(); a.preload = 'metadata'; a.src = base + 'scene-' + (k + 1) + '.' + ext;
      a.addEventListener('error', function () { a.dataset.failed = '1'; });
      return a;
    });
  }
  function clip(n) { var c = clips[n]; return c && !c.dataset.failed ? c : null; }

  // ---- Narration source 2: the browser's own text-to-speech voice reading data-narration.
  var synth = ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) ? window.speechSynthesis : null;
  var voice = null, speaking = false, speechToken = 0;
  function pickVoice() {
    if (!synth) return;
    var vs = synth.getVoices().filter(function (v) { return /^en/i.test(v.lang); });
    var best = null, bestScore = -1;
    vs.forEach(function (v) {
      var s = 0, n = v.name;
      if (/natural|neural|online|premium|enhanced/i.test(n)) s += 4;
      if (/en[-_]GB/i.test(v.lang)) s += 2;
      if (/google|microsoft|samantha|serena|daniel|karen|moira|libby|sonia|ryan/i.test(n)) s += 1;
      if (/espeak|compact/i.test(n)) s -= 3;
      if (s > bestScore) { bestScore = s; best = v; }
    });
    voice = best;
  }
  if (synth) { pickVoice(); if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice); else synth.onvoiceschanged = pickVoice; }

  var hasNarration = clips.length || synth;
  if (voiceBtn && hasNarration) {
    voiceBtn.hidden = false;
    voiceBtn.addEventListener('click', function () {
      voiceOn = !voiceOn;
      voiceBtn.textContent = voiceOn ? 'Narration on' : 'Narration off';
      voiceBtn.setAttribute('aria-pressed', voiceOn ? 'true' : 'false');
      clips.forEach(function (c) { c.muted = !voiceOn; });
      if (!voiceOn) stopSpeech(); else if (playing) narrate(i);
    });
  }

  function stopSpeech() { speechToken++; speaking = false; if (synth) { try { synth.cancel(); } catch (e) {} } }
  function stopAudio() { clips.forEach(function (c) { try { c.pause(); c.currentTime = 0; } catch (e) {} }); stopSpeech(); }
  function narrate(n) {
    stopAudio();
    if (!playing || !voiceOn) return;
    var c = clip(n);
    if (c) { c.muted = false; var p = c.play(); if (p && p.catch) p.catch(function () {}); return; }
    if (!synth) return;
    var text = scenes[n].getAttribute('data-narration'); if (!text) return;
    var u = new SpeechSynthesisUtterance(text), token = ++speechToken;
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : 'en-GB'; u.rate = 0.95; u.pitch = 1;
    var started = false;
    u.onstart = function () { started = true; };
    u.onend = u.onerror = function () { if (token === speechToken) speaking = false; };
    speaking = true;
    synth.speak(u);
    // Some browsers have no usable voice and never fire any event: don't let the film wait for silence.
    setTimeout(function () { if (token === speechToken && !started && !synth.speaking) speaking = false; }, 2000);
  }
  // A scene lasts at least DUR, longer if its narration is still going (capped at MAXDUR).
  function sceneDone(e) {
    if (e < DUR) return false;
    if (e >= MAXDUR || !voiceOn) return true;
    var c = clip(i);
    if (c) return c.ended || c.paused || !isFinite(c.duration) || e >= c.duration * 1000 + 700;
    return !speaking;
  }

  function show(n, animate) {
    i = n;
    scenes.forEach(function (s, k) { s.classList.toggle('on', k === n); s.classList.remove('play'); });
    if (animate && !reduce) { void scenes[n].getBoundingClientRect(); scenes[n].classList.add('play'); }
    cap.textContent = scenes[n].getAttribute('data-caption');
    chapters.forEach(function (c, k) { if (k === n) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current'); });
    setBar(0);
    if (playing) narrate(n); else stopAudio();
  }
  function setBar(p) { bar.style.width = ((i + p) / scenes.length * 100) + '%'; }
  function frame(now) {
    if (!playing) return;
    var e = elapsed + (now - t0);
    setBar(Math.min(e / DUR, 1));
    if (sceneDone(e)) {
      if (i < scenes.length - 1) { elapsed = 0; t0 = now; show(i + 1, true); }
      else { playing = false; ended = true; elapsed = 0; stopAudio(); toggle.textContent = 'Replay'; setBar(1); return; }
    }
    requestAnimationFrame(frame);
  }
  function play() {
    film.classList.add('started'); film.classList.remove('paused');
    var resume = !ended && elapsed > 0;
    playing = true;
    if (ended) { ended = false; elapsed = 0; show(0, true); }
    else if (!resume) show(i, true);
    else {
      // Resume: recorded clips continue where they stopped; the browser voice restarts the scene's line.
      var c = clip(i);
      if (c && voiceOn) { var p = c.play(); if (p && p.catch) p.catch(function () {}); }
      else if (!c) narrate(i);
    }
    t0 = performance.now(); toggle.textContent = 'Pause';
    requestAnimationFrame(frame);
  }
  function pause() {
    if (!playing) return;
    playing = false; elapsed += performance.now() - t0;
    var c = clip(i); if (c) c.pause();
    stopSpeech();
    film.classList.add('paused'); toggle.textContent = 'Play';
  }
  big.addEventListener('click', play);
  toggle.addEventListener('click', function () { playing ? pause() : play(); });
  chapters.forEach(function (c, k) {
    c.addEventListener('click', function () {
      film.classList.add('started'); film.classList.remove('paused'); ended = false; elapsed = 0;
      show(k, true);
      if (playing) t0 = performance.now(); else toggle.textContent = 'Play';
    });
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });
  window.addEventListener('pagehide', stopAudio);
})();
