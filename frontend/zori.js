/* ZORI — original vector mascot with six expressive moods. */
(() => {
  'use strict';
  const moods = ['happy','curious','surprised','thinking','worried','excited','wave','detective','sleepy','love','confused','proud'];
  const face = {
    happy: ['<ellipse cx="49" cy="68" rx="13" ry="18" fill="#071225"/><ellipse cx="91" cy="68" rx="13" ry="18" fill="#071225"/><circle cx="53" cy="61" r="4.5" fill="#fff"/><circle cx="95" cy="61" r="4.5" fill="#fff"/>','<path d="M54 91 Q70 111 86 91 Q70 99 54 91" fill="#091226"/>'],
    curious: ['<ellipse cx="49" cy="68" rx="15" ry="20" fill="#071225"/><ellipse cx="91" cy="68" rx="15" ry="20" fill="#071225"/><circle cx="55" cy="62" r="5" fill="#fff"/><circle cx="97" cy="62" r="5" fill="#fff"/>','<path d="M63 96 Q70 91 77 96 Q70 106 63 96" fill="#091226"/>'],
    surprised: ['<ellipse cx="49" cy="68" rx="16" ry="22" fill="#071225"/><ellipse cx="91" cy="68" rx="16" ry="22" fill="#071225"/><circle cx="55" cy="60" r="5" fill="#fff"/><circle cx="97" cy="60" r="5" fill="#fff"/>','<ellipse cx="70" cy="99" rx="7" ry="10" fill="#091226"/>'],
    thinking: ['<ellipse cx="49" cy="69" rx="13" ry="17" fill="#071225"/><ellipse cx="91" cy="69" rx="13" ry="17" fill="#071225"/><circle cx="57" cy="63" r="4.5" fill="#fff"/><circle cx="99" cy="63" r="4.5" fill="#fff"/>','<path d="M58 99 Q70 94 82 99" fill="none" stroke="#091226" stroke-width="4" stroke-linecap="round"/>'],
    worried: ['<ellipse cx="49" cy="70" rx="12" ry="16" fill="#071225"/><ellipse cx="91" cy="70" rx="12" ry="16" fill="#071225"/><circle cx="54" cy="65" r="4" fill="#fff"/><circle cx="96" cy="65" r="4" fill="#fff"/><path d="M36 48 Q47 41 57 48 M83 48 Q94 41 104 48" fill="none" stroke="#17669b" stroke-width="4" stroke-linecap="round"/>','<path d="M58 105 Q70 94 82 105" fill="none" stroke="#091226" stroke-width="4" stroke-linecap="round"/>'],
    excited: ['<path d="M36 69 Q49 49 62 69" fill="none" stroke="#071225" stroke-width="7" stroke-linecap="round"/><path d="M78 69 Q91 49 104 69" fill="none" stroke="#071225" stroke-width="7" stroke-linecap="round"/>','<path d="M53 91 Q70 119 87 91 Q70 106 53 91" fill="#091226"/>']
  };
  Object.assign(face, {
    wave: face.excited, proud: face.happy, detective: face.thinking,
    sleepy: ['<path d="M37 70 Q49 79 61 70 M79 70 Q91 79 103 70" fill="none" stroke="#091226" stroke-width="7" stroke-linecap="round"/>','<path d="M61 101 Q70 106 79 101" fill="none" stroke="#091226" stroke-width="4" stroke-linecap="round"/>'],
    love: ['<path d="M48 79 C21 62 32 46 48 56 C64 46 76 62 48 79 M93 79 C66 62 77 46 93 56 C109 46 121 62 93 79" fill="#f64ea9"/>','<path d="M55 92 Q70 112 85 92" fill="none" stroke="#091226" stroke-width="5" stroke-linecap="round"/>'],
    confused: ['<ellipse cx="49" cy="68" rx="12" ry="16" fill="#071225"/><ellipse cx="91" cy="68" rx="15" ry="12" fill="#071225"/><circle cx="54" cy="62" r="4" fill="white"/><circle cx="96" cy="65" r="4" fill="white"/>','<path d="M56 100 Q64 93 72 100 T85 100" fill="none" stroke="#091226" stroke-width="4"/>']
  });
  function makeSvg(mood) {
    const f = face[mood] || face.happy;
    return '<svg viewBox="0 0 160 190" role="img" aria-label="ZORI: '+mood+'" xmlns="http://www.w3.org/2000/svg">'+
      '<defs><linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c8f5ff"/><stop offset=".42" stop-color="#66d8ff"/><stop offset="1" stop-color="#2487d9"/></linearGradient><linearGradient id="suit" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#258bdc"/><stop offset="1" stop-color="#153e9d"/></linearGradient><radialGradient id="shine"><stop stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>'+
      '<ellipse cx="80" cy="177" rx="39" ry="7" fill="#35caff" opacity=".2"/>'+
      '<path d="M52 42 Q7 10 9 48 Q12 73 39 66Z" fill="#77e6e0" stroke="#4cbff4" stroke-width="2"/><path d="M108 40 Q149 9 153 37 Q159 65 120 68Z" fill="#ad86ff" stroke="#4cbff4" stroke-width="2"/>'+
      '<path d="M69 23 Q54 1 69 8 Q80 12 80 24" fill="none" stroke="#65e9e4" stroke-width="7" stroke-linecap="round"/><circle cx="69" cy="8" r="5" fill="#a4faff"/><path d="M112 38 Q139 18 144 29" fill="none" stroke="#b595ff" stroke-width="5" stroke-linecap="round"/>'+
      '<g class="zori-arm-left"><path d="M52 130 Q26 127 20 102" fill="none" stroke="#54caff" stroke-width="13" stroke-linecap="round"/><circle cx="19" cy="98" r="9" fill="#8deaff"/></g><g class="zori-arm-right"><path d="M108 130 Q133 137 142 111" fill="none" stroke="#54caff" stroke-width="13" stroke-linecap="round"/><circle cx="143" cy="107" r="9" fill="#8deaff"/></g>'+
      '<path d="M47 126 Q80 108 113 126 L122 178 L38 178Z" fill="url(#suit)" stroke="#69d9ff" stroke-width="2"/><path d="M56 120 Q80 139 104 120 L98 112 Q80 126 62 112Z" fill="#ff9bd4"/><circle cx="80" cy="151" r="10" fill="#b6f6ff" stroke="#8b8cff" stroke-width="3"/><path d="M74 151h12 M80 145v12" stroke="#4776ca" stroke-width="2"/>'+
      '<path d="M50 164 L39 181 L58 181 L66 168 M110 164 L121 181 L102 181 L94 168" fill="#152d76" stroke="#5bd7ff" stroke-width="2"/>'+
      '<path d="M112 157 Q151 156 146 179 Q134 170 125 180" fill="none" stroke="#7af0e9" stroke-width="8" stroke-linecap="round"/><path d="M144 177 L154 168 L157 183Z" fill="#b493ff"/><ellipse cx="80" cy="72" rx="54" ry="52" fill="url(#skin)" stroke="#8ce8ff" stroke-width="2"/><ellipse cx="63" cy="49" rx="37" ry="26" fill="url(#shine)"/><path d="M80 29 L88 39 L80 49 L72 39Z" fill="#d9fff9" stroke="#5589f6" stroke-width="2"/><path d="M80 33 L84 39 L80 45 L76 39Z" fill="#49c9db"/>'+
      '<g class="zori-eyes">'+f[0]+'</g><ellipse cx="35" cy="88" rx="8" ry="4" fill="#ff9bc9" opacity=".55"/><ellipse cx="125" cy="88" rx="8" ry="4" fill="#ff9bc9" opacity=".55"/>'+f[1]+'</svg>';
  }
  function setEmotion(mood) {
    const next = moods.includes(mood) ? mood : 'happy';
    document.querySelectorAll('[data-zori-avatar]').forEach(el => { el.dataset.emotion=next; el.innerHTML=makeSvg(next); });
    document.documentElement.dataset.zoriEmotion=next;
  }
  window.setZoriEmotion = setEmotion;
  setEmotion('happy');
  let clickMood=0;
  let suppressClick = false;
  document.addEventListener('click', e => {
    if (!e.target.closest('#zori-face')) return;
    if (suppressClick) { e.stopImmediatePropagation(); e.preventDefault(); suppressClick = false; return; }
    clickMood = (clickMood + 1) % moods.length;
    setEmotion(moods[clickMood]);
  }, true);

  // ZORI can be moved freely by its face, without moving the map behind it.
  const widget = document.getElementById('zori-widget');
  const grip = document.getElementById('zori-face');
  if (widget && grip) {
    let start = null;
    grip.setAttribute('title', 'Drag ZORI or click for a new emotion');
    grip.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const rect = widget.getBoundingClientRect();
      start = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, left: rect.left, top: rect.top, dragged: false };
      grip.setPointerCapture(e.pointerId);
    });
    grip.addEventListener('pointermove', e => {
      if (!start || start.pointerId !== e.pointerId) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) < 6 && !start.dragged) return;
      start.dragged = true;
      const rect = widget.getBoundingClientRect();
      widget.style.right = 'auto'; widget.style.bottom = 'auto';
      widget.style.left = Math.max(8, Math.min(innerWidth - rect.width - 8, start.left + dx)) + 'px';
      widget.style.top = Math.max(70, Math.min(innerHeight - rect.height - 8, start.top + dy)) + 'px';
      widget.dataset.dragged = 'true';
      setEmotion('wave');
    });
    const finishDrag = e => {
      if (!start || e.pointerId !== start.pointerId) return;
      suppressClick = start.dragged;
      start = null;
    };
    grip.addEventListener('pointerup', finishDrag);
    grip.addEventListener('pointercancel', finishDrag);
    window.addEventListener('resize', () => {
      if (!widget.style.left) return;
      const rect = widget.getBoundingClientRect();
      widget.style.left = Math.max(8, Math.min(innerWidth - rect.width - 8, rect.left)) + 'px';
      widget.style.top = Math.max(70, Math.min(innerHeight - rect.height - 8, rect.top)) + 'px';
    });
  }
})();
