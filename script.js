
document.addEventListener('DOMContentLoaded', function () {

 
  var cursor    = document.getElementById('cursor');
  var cursorDot = document.getElementById('cursorDot');
  var cursorActive = false;

  if (cursor && cursorDot) {

    function moveCursor(x, y) {
      cursor.style.left    = x + 'px';
      cursor.style.top     = y + 'px';
      cursorDot.style.left = x + 'px';
      cursorDot.style.top  = y + 'px';
    }

    document.addEventListener('mousemove', function (e) {
      moveCursor(e.clientX, e.clientY);
     
      if (!cursorActive) {
        cursor.style.opacity    = '1';
        cursorDot.style.opacity = '1';
        cursorActive = true;
      }
    });

    document.addEventListener('mouseleave', function () {
      cursor.style.opacity    = '0';
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      if (cursorActive) {
        cursor.style.opacity    = '1';
        cursorDot.style.opacity = '1';
      }
    });

    
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest(
        'a, button, .service-card, .combo-card, .gitem, ' +
        '.cal-day.available, .time-slot.available, ' +
        '.cert-card, .star-pick, .btn-avaliar, .social-link'
      );
      if (t) {
        cursor.style.transform    = 'translate(-50%,-50%) scale(1.8)';
        cursorDot.style.background = '#fff';
        cursorDot.style.boxShadow  = '0 0 10px 2px rgba(255,255,255,.8)';
      } else {
        cursor.style.transform    = 'translate(-50%,-50%) scale(1)';
        cursorDot.style.background = 'var(--accent)';
        cursorDot.style.boxShadow  = '0 0 10px 2px rgba(232,255,0,.9)';
      }
    });
  }

 
  window.toggleMobile = function () {
    document.getElementById('mobileMenu').classList.toggle('open');
  };
  window.closeMobile = function () {
    document.getElementById('mobileMenu').classList.remove('open');
  };

  
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    reveals.forEach(function (el) { el.classList.add('js-hidden'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove('js-hidden');
          en.target.classList.add('js-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  }

 
  var currentDate  = new Date();
  var selectedDate = null;
  var selectedTime = null;

  
  var WHATSAPP_NUM = '5547900000000';

  var CLOSED_DAYS = [0]; // 0 = domingo

  var ALL_SLOTS = [
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00','17:30','18:00','18:30',
    '19:00','19:30'
  ];
  var SAT_SLOTS = [
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30'
  ];
  var BOOKED = {
    
  };

  var MONTHS = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  var TODAY = new Date(); TODAY.setHours(0,0,0,0);

  function pad2(n) { return String(n).padStart(2,'0'); }
  function dateKey(d) { return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }

  function renderCalendar() {
    var y = currentDate.getFullYear(), m = currentDate.getMonth();
    document.getElementById('calMonth').textContent = MONTHS[m] + ' ' + y;
    var grid = document.getElementById('calGrid');
    grid.innerHTML = '';

    var firstDay  = new Date(y, m, 1).getDay();
    var totalDays = new Date(y, m+1, 0).getDate();

    for (var i = 0; i < firstDay; i++) {
      var emp = document.createElement('div');
      emp.className = 'cal-day';
      grid.appendChild(emp);
    }

    for (var d = 1; d <= totalDays; d++) {
      (function (day) {
        var el   = document.createElement('div');
        var date = new Date(y, m, day); date.setHours(0,0,0,0);
        var past   = date < TODAY;
        var closed = CLOSED_DAYS.indexOf(date.getDay()) !== -1;
        var isSel  = selectedDate && dateKey(selectedDate) === dateKey(date);
        var isToday = date.getTime() === TODAY.getTime();

        el.textContent = day;
        if      (isSel)   el.className = 'cal-day selected';
        else if (past)    el.className = 'cal-day past';
        else if (closed)  el.className = 'cal-day closed';
        else              el.className = 'cal-day available';
        if (isToday) el.classList.add('today');

        if (!past && !closed) {
          el.onclick = function () { selectDate(date); };
        }
        grid.appendChild(el);
      })(d);
    }
  }

  function selectDate(date) {
    selectedDate = date; selectedTime = null;
    renderCalendar(); renderSlots(); updateSummary();
  }

  window.changeMonth = function (dir) {
    currentDate.setMonth(currentDate.getMonth() + dir);
    renderCalendar();
  };

  function renderSlots() {
    var grid = document.getElementById('timeGrid');
    grid.innerHTML = '';
    if (!selectedDate) {
      var p = document.createElement('p');
      p.style.cssText = 'color:var(--gray);font-size:13px;grid-column:span 4;padding:10px 0;';
      p.textContent   = 'Selecione um dia no calendário';
      grid.appendChild(p);
      return;
    }
    var isSat  = selectedDate.getDay() === 6;
    var slots  = isSat ? SAT_SLOTS : ALL_SLOTS;
    var booked = BOOKED[dateKey(selectedDate)] || [];

    slots.forEach(function (t) {
      var el = document.createElement('div');
      var isB = booked.indexOf(t) !== -1;
      var isS = selectedTime === t;
      el.className  = isB ? 'time-slot booked' : (isS ? 'time-slot selected' : 'time-slot available');
      el.textContent = t;
      if (!isB) {
        (function (time) {
          el.onclick = function () { selectedTime = time; renderSlots(); updateSummary(); };
        })(t);
      }
      grid.appendChild(el);
    });
  }

  function updateSummary() {
    var wrap = document.getElementById('bookingSummary');
    if (!selectedDate || !selectedTime) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    var svc = document.getElementById('clientService');
    document.getElementById('sumService').textContent = svc ? (svc.value || 'Não selecionado') : '—';
    document.getElementById('sumDate').textContent    = selectedDate.toLocaleDateString('pt-BR', {weekday:'long',day:'numeric',month:'long'});
    document.getElementById('sumTime').textContent    = selectedTime;
  }

  var svcSel = document.getElementById('clientService');
  if (svcSel) svcSel.addEventListener('change', updateSummary);

  window.submitBooking = function () {
    var name    = (document.getElementById('clientName')    || {}).value || '';
    var phone   = (document.getElementById('clientPhone')   || {}).value || '';
    var service = (document.getElementById('clientService') || {}).value || '';
    name    = name.trim(); phone = phone.trim();

    if (!name)         { alert('Informe seu nome.');         return; }
    if (!phone)        { alert('Informe seu WhatsApp.');     return; }
    if (!service)      { alert('Selecione um serviço.');     return; }
    if (!selectedDate) { alert('Selecione um dia.');         return; }
    if (!selectedTime) { alert('Selecione um horário.');     return; }

    var dateStr = selectedDate.toLocaleDateString('pt-BR', {weekday:'long',day:'numeric',month:'long'});
    var msg = 'Olá Vinicius! Quero agendar um horário 💈\n\n'
      + '👤 *Nome:* '     + name    + '\n'
      + '📱 *Contato:* '  + phone   + '\n'
      + '✂️ *Serviço:* '  + service + '\n'
      + '📅 *Dia:* '      + dateStr + '\n'
      + '🕐 *Horário:* '  + selectedTime + '\n\n'
      + 'Aguardo confirmação!';

    var det = document.getElementById('modalDetail');
    if (det) det.innerHTML = '<p><strong>Serviço:</strong> '+service+'<br><strong>Data:</strong> '+dateStr+'<br><strong>Hora:</strong> '+selectedTime+'</p>';
    document.getElementById('modal').classList.add('active');
    setTimeout(function () {
      window.open('https://wa.me/'+WHATSAPP_NUM+'?text='+encodeURIComponent(msg), '_blank');
    }, 1500);
  };

  window.closeModal = function () {
    document.getElementById('modal').classList.remove('active');
  };

 
  var STORE_KEY = 'vinibarber_v2_reviews';
  var selStars  = 0;

  var DEFAULT_REVIEWS = [
    { name:'Lucas Ferreira',  stars:5, comment:'Melhor barbeiro que já fui! O fade ficou perfeito, muito detalhista e atencioso. Virei cliente fixo.',               date:'2025-04-10' },
    { name:'Mateus Oliveira', stars:5, comment:'O Vini é fera demais! Fui sem hora marcada e mesmo assim fui bem atendido. O corte ficou exatamente como queria.',   date:'2025-03-28' },
    { name:'Rafael Santos',   stars:5, comment:'Ambiente agradável, profissional jovem e talentoso. A barba ficou impecável, super recomendo!',                      date:'2025-04-05' },
  ];

  function loadReviews() {
    try { var r = localStorage.getItem(STORE_KEY); return r ? JSON.parse(r) : DEFAULT_REVIEWS.slice(); }
    catch(e) { return DEFAULT_REVIEWS.slice(); }
  }
  function saveReviews(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch(e) {}
  }

  function starsHTML(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += '<span'+(i > n ? ' class="e"' : '')+'>★</span>';
    return s;
  }

  function timeAgo(ds) {
    var diff = Math.floor((Date.now() - new Date(ds)) / 86400000);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    if (diff < 7)   return 'Há '+diff+' dias';
    if (diff < 30)  return 'Há '+Math.floor(diff/7)+' semana(s)';
    if (diff < 365) return 'Há '+Math.floor(diff/30)+' mês(es)';
    return 'Há '+Math.floor(diff/365)+' ano(s)';
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function calcStats(list) {
    var c = {1:0,2:0,3:0,4:0,5:0}, sum = 0;
    list.forEach(function(r){ c[r.stars]++; sum += r.stars; });
    return { counts:c, total:list.length, avg: list.length ? (sum/list.length).toFixed(1) : '—' };
  }

  function renderStats(list) {
    var s = calcStats(list);
    var bigEl = document.getElementById('ratingBig');
    var strEl = document.getElementById('ratingStarsDisplay');
    var totEl = document.getElementById('ratingTotal');
    var herEl = document.getElementById('heroRating');

    if (bigEl) bigEl.textContent = s.avg;
    if (herEl) herEl.textContent = s.avg;
    if (totEl) totEl.textContent = s.total + (s.total === 1 ? ' avaliação' : ' avaliações');
    if (strEl) {
      var avg = parseFloat(s.avg) || 0, r = Math.round(avg), str = '';
      for (var i = 1; i <= 5; i++) str += i <= r ? '★' : '☆';
      strEl.textContent = str;
    }
    for (var n = 1; n <= 5; n++) {
      var bar = document.getElementById('bar'+n);
      var cnt = document.getElementById('count'+n);
      if (bar) bar.style.width = (s.total > 0 ? (s.counts[n]/s.total*100).toFixed(1) : 0) + '%';
      if (cnt) cnt.textContent = s.counts[n];
    }
  }

  function renderReviews(list) {
    var container = document.getElementById('reviewsList');
    if (!container) return;
    container.innerHTML = '';
    if (!list || !list.length) {
      container.innerHTML = '<div class="reviews-empty"><p>Nenhuma avaliação ainda.<br><strong>Seja o primeiro a avaliar!</strong></p></div>';
      return;
    }
    list.slice().sort(function(a,b){ return new Date(b.date)-new Date(a.date); }).forEach(function(r) {
      var card = document.createElement('div');
      card.className = 'review-card';
      var init = r.name ? r.name.charAt(0).toUpperCase() : '?';
      card.innerHTML =
        (r.stars===5 ? '<div class="rc-badge">⭐ TOP</div>' : '') +
        '<div class="rc-stars">'+starsHTML(r.stars)+'</div>'+
        '<div class="rc-text">"'+esc(r.comment)+'"</div>'+
        '<div class="rc-author">'+
          '<div class="rc-avatar">'+init+'</div>'+
          '<div><div class="rc-name">'+esc(r.name)+'</div>'+
          '<div class="rc-date">'+timeAgo(r.date)+'</div></div>'+
        '</div>';
      container.appendChild(card);
    });
  }


  var starPicks = document.querySelectorAll('.star-pick');
  var starLbl   = document.getElementById('starLabel');
  var lbls = ['','Ruim 😕','Regular 😐','Bom 👍','Ótimo 😄','Excelente! 🔥'];

  function updateStarPicks(hov, sel) {
    starPicks.forEach(function(s) {
      var v = parseInt(s.dataset.star);
      s.classList.toggle('lit', v <= (hov || sel));
    });
    if (starLbl) starLbl.textContent = hov ? lbls[hov] : (sel ? lbls[sel] : 'Clique nas estrelas para avaliar');
  }

  starPicks.forEach(function(s) {
    s.addEventListener('mouseenter', function() { updateStarPicks(parseInt(this.dataset.star), selStars); });
    s.addEventListener('mouseleave', function() { updateStarPicks(0, selStars); });
    s.addEventListener('click',      function() { selStars = parseInt(this.dataset.star); updateStarPicks(0, selStars); });
   
    s.addEventListener('touchend',   function(e) { e.preventDefault(); selStars = parseInt(this.dataset.star); updateStarPicks(0, selStars); });
  });

  window.abrirModalAvaliacao = function() {
    selStars = 0;
    updateStarPicks(0, 0);
    var n = document.getElementById('reviewName');
    var c = document.getElementById('reviewComment');
    if (n) n.value = '';
    if (c) c.value = '';
    document.getElementById('modalAvaliacao').classList.add('active');
  };
  window.fecharModalAvaliacao = function() {
    document.getElementById('modalAvaliacao').classList.remove('active');
  };
  window.fecharModalOk = function() {
    document.getElementById('modalAvaliacaoOk').classList.remove('active');
  };

  window.enviarAvaliacao = function() {
    var name    = (document.getElementById('reviewName')    || {}).value || '';
    var comment = (document.getElementById('reviewComment') || {}).value || '';
    name = name.trim(); comment = comment.trim();

    if (!name)    { alert('Informe seu nome.');         return; }
    if (!selStars){ alert('Selecione uma nota.');       return; }
    if (!comment) { alert('Escreva um comentário.');    return; }

    var list = loadReviews();
    list.push({ name:name, stars:selStars, comment:comment, date:new Date().toISOString().split('T')[0] });
    saveReviews(list);
    fecharModalAvaliacao();
    document.getElementById('modalAvaliacaoOk').classList.add('active');
    renderStats(list);
    renderReviews(list);
  };

  document.querySelectorAll('.modal-overlay').forEach(function(ov) {
    ov.addEventListener('click', function(e) { if (e.target===ov) ov.classList.remove('active'); });
  });

  
  renderCalendar();
  renderSlots();
  var reviews = loadReviews();
  renderStats(reviews);
  renderReviews(reviews);

}); 