(function () {
  var film = document.getElementById('msc-film'); if (!film) return;
  var scenes = Array.prototype.slice.call(film.querySelectorAll('.scene'));
  var cap = film.querySelector('.film-cap'), bar = film.querySelector('.film-bar i');
  var toggle = film.querySelector('[data-toggle]'), big = film.querySelector('[data-play]');
  var chapters = Array.prototype.slice.call(film.querySelectorAll('[data-go]'));
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var DUR = 6200, i = 0, elapsed = 0, t0 = 0, playing = false, ended = false;

  // Optional voice-over: one clip per scene at <data-audio>scene-N.<ext>
  var voiceBtn = film.querySelector('[data-voice]'), base = film.getAttribute('data-audio');
  var ext = film.getAttribute('data-audio-ext') || 'mp3', clips = [], voiceOn = true;
  if (base) {
    clips = scenes.map(function (_, k) {
      var a = new Audio(); a.preload = 'metadata'; a.src = base + 'scene-' + (k + 1) + '.' + ext;
      a.addEventListener('error', function () { a.dataset.failed = '1'; });
      return a;
    });
    if (voiceBtn) {
      voiceBtn.hidden = false;
      voiceBtn.addEventListener('click', function () {
        voiceOn = !voiceOn;
        voiceBtn.textContent = voiceOn ? 'Voice on' : 'Voice off';
        voiceBtn.setAttribute('aria-pressed', voiceOn ? 'true' : 'false');
        clips.forEach(function (c) { c.muted = !voiceOn; });
      });
    }
  }
  function clip(n) { var c = clips[n]; return c && !c.dataset.failed ? c : null; }
  function sceneDur(n) {
    var c = clip(n);
    return c && isFinite(c.duration) && c.duration > 0 ? Math.max(DUR, c.duration * 1000 + 700) : DUR;
  }
  function stopAudio() { clips.forEach(function (c) { try { c.pause(); c.currentTime = 0; } catch (e) {} }); }
  function startAudio(n) {
    stopAudio(); var c = clip(n);
    if (c && playing) { c.muted = !voiceOn; var p = c.play(); if (p && p.catch) p.catch(function () {}); }
  }

  function show(n, animate) {
    i = n;
    scenes.forEach(function (s, k) { s.classList.toggle('on', k === n); s.classList.remove('play'); });
    if (animate && !reduce) { void scenes[n].getBoundingClientRect(); scenes[n].classList.add('play'); }
    cap.textContent = scenes[n].getAttribute('data-caption');
    chapters.forEach(function (c, k) { if (k === n) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current'); });
    setBar(0);
  }
  function setBar(p) { bar.style.width = ((i + p) / scenes.length * 100) + '%'; }
  var _show = show;
  show = function (n, animate) { _show(n, animate); if (playing) startAudio(n); else stopAudio(); };
  function frame(now) {
    if (!playing) return;
    var e = elapsed + (now - t0);
    var D = sceneDur(i);
    setBar(Math.min(e / D, 1));
    if (e >= D) {
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
    else { var c = clip(i); if (c) { c.muted = !voiceOn; var p = c.play(); if (p && p.catch) p.catch(function () {}); } }
    t0 = performance.now(); toggle.textContent = 'Pause';
    requestAnimationFrame(frame);
  }
  function pause() {
    if (!playing) return;
    playing = false; elapsed += performance.now() - t0;
    var c = clip(i); if (c) c.pause();
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
})();
