/* VELX 営業日カレンダー＋休業のお知らせバー（設定は assets/calendar-data.js） */
(function () {
  var C = window.VELX_CALENDAR;
  if (!C) return;
  var WD = ['日', '月', '火', '水', '木', '金', '土'];
  var holidays = Object.assign({}, C.publicHolidays || {});

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function jp(d, withYear) {
    return (withYear ? d.getFullYear() + '年' : '') + (d.getMonth() + 1) + '月' + d.getDate() + '日（' + WD[d.getDay()] + '）';
  }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function inRange(k, r) { return k >= r.from && k <= r.to; }

  // 日付の状態：{closed, type: 'weekly'|'holiday'|'long'|'temp'|null, label}
  function status(d) {
    var k = key(d), i;
    for (i = 0; i < (C.openDays || []).length; i++) if (C.openDays[i] === k) return { closed: false, type: 'open', label: '臨時営業' };
    for (i = 0; i < (C.closures || []).length; i++) if (inRange(k, C.closures[i])) return { closed: true, type: 'temp', label: '臨時休業' };
    for (i = 0; i < (C.longHolidays || []).length; i++) if (inRange(k, C.longHolidays[i])) return { closed: true, type: 'long', label: C.longHolidays[i].title };
    if (C.closePublicHolidays && holidays[k]) return { closed: true, type: 'holiday', label: holidays[k] };
    if ((C.weeklyClosed || []).indexOf(d.getDay()) >= 0) return { closed: true, type: 'weekly', label: '定休日' };
    return { closed: false, type: null, label: '' };
  }
  function nextOpen(from) {
    var d = new Date(from);
    for (var i = 0; i < 60; i++) { d.setDate(d.getDate() + 1); if (!status(d).closed) return d; }
    return null;
  }
  function rangeText(r) {
    var a = parse(r.from), b = parse(r.to);
    return r.from === r.to ? jp(a, true) : jp(a, true) + '〜' + jp(b, a.getFullYear() !== b.getFullYear());
  }

  /* ---------- 上部のお知らせバー（全ページ） ---------- */
  function noticeBar() {
    var t = today(), tk = key(t);
    var limit = new Date(t); limit.setDate(limit.getDate() + (C.noticeDaysBefore || 14));
    var lk = key(limit);
    var items = [];
    (C.closures || []).forEach(function (r) {
      if (r.to >= tk && r.from <= lk) items.push('<strong>臨時休業のお知らせ</strong>　' + rangeText(r) + 'は' + (r.reason ? r.reason + '、' : '') + '臨時休業とさせていただきます。');
    });
    (C.longHolidays || []).forEach(function (r) {
      if (r.to >= tk && r.from <= lk) items.push('<strong>' + r.title + 'のお知らせ</strong>　' + rangeText(r) + 'は' + r.title + 'とさせていただきます。');
    });
    if (!items.length) return;
    var sig = items.join('|');
    try { if (sessionStorage.getItem('velx-notice-closed') === sig) return; } catch (e) {}
    var bar = document.createElement('div');
    bar.className = 'biz-notice';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<div class="biz-notice-inner"><span class="biz-notice-icon" aria-hidden="true">!</span><div class="biz-notice-text">' +
      items.join('<br>') + '<span class="biz-notice-sub">期間中にいただいたお問い合わせは、翌営業日以降に順次ご対応いたします。</span>' +
      '</div><a class="biz-notice-link" href="index.html#calendar">営業日カレンダー</a>' +
      '<button class="biz-notice-close" aria-label="お知らせを閉じる">×</button></div>';
    bar.querySelector('.biz-notice-close').addEventListener('click', function () {
      bar.remove(); document.body.classList.remove('has-biz-notice');
      try { sessionStorage.setItem('velx-notice-closed', sig); } catch (e) {}
    });
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('has-biz-notice');
  }

  /* ---------- カレンダー（index.html の #biz-calendar） ---------- */
  function calendar() {
    var root = document.getElementById('biz-calendar');
    if (!root) return;
    var t = today();
    var base = new Date(t.getFullYear(), t.getMonth(), 1);
    var offset = 0;

    function month(y, m) {
      var first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
      var h = '<div class="bc-month"><div class="bc-title">' + y + '年 <span>' + (m + 1) + '</span>月</div><table class="bc-table"><thead><tr>';
      WD.forEach(function (w, i) { h += '<th class="' + (i === 0 ? 'sun' : i === 6 ? 'sat' : '') + '">' + w + '</th>'; });
      h += '</tr></thead><tbody><tr>';
      for (var i = 0; i < first.getDay(); i++) h += '<td class="empty"></td>';
      for (var d = 1; d <= days; d++) {
        var dt = new Date(y, m, d), s = status(dt), cls = [];
        if (dt.getDay() === 0 || holidays[key(dt)]) cls.push('sun'); else if (dt.getDay() === 6) cls.push('sat');
        if (s.closed) cls.push(s.type === 'temp' ? 'closed temp' : 'closed');
        if (s.type === 'open') cls.push('open');
        if (key(dt) === key(t)) cls.push('today');
        if (dt < t) cls.push('past');
        h += '<td class="' + cls.join(' ') + '"' + (s.label ? ' title="' + s.label + '"' : '') + '><span>' + d + '</span></td>';
        if (dt.getDay() === 6 && d < days) h += '</tr><tr>';
      }
      var last = new Date(y, m, days).getDay();
      for (var j = last + 1; j <= 6; j++) h += '<td class="empty"></td>';
      return h + '</tr></tbody></table></div>';
    }

    function upcoming() {
      var tk = key(t), list = [];
      var far = new Date(t); far.setDate(far.getDate() + 180); var fk = key(far);
      (C.closures || []).forEach(function (r) { if (r.to >= tk && r.from <= fk) list.push({ from: r.from, html: '<span class="bc-tag temp">臨時休業</span>' + rangeText(r) + (r.reason ? '<small>' + r.reason.replace(/のため$/, '') + '</small>' : '') }); });
      (C.longHolidays || []).forEach(function (r) { if (r.to >= tk && r.from <= fk) list.push({ from: r.from, html: '<span class="bc-tag">' + r.title + '</span>' + rangeText(r) }); });
      list.sort(function (a, b) { return a.from < b.from ? -1 : 1; });
      if (!list.length) return '';
      return '<div class="bc-upcoming"><div class="bc-upcoming-h">今後の休業予定</div><ul>' +
        list.slice(0, 4).map(function (x) { return '<li>' + x.html + '</li>'; }).join('') + '</ul></div>';
    }

    function render() {
      var a = new Date(base.getFullYear(), base.getMonth() + offset, 1);
      var b = new Date(a.getFullYear(), a.getMonth() + 1, 1);
      var s = status(t), n = nextOpen(t);
      var todayHtml = s.closed
        ? '<div class="bc-today off"><span class="bc-dot"></span>本日 ' + jp(t) + ' は<strong>休業日</strong>です' + (s.type === 'holiday' || s.type === 'long' || s.type === 'temp' ? '（' + s.label + '）' : '') + '。' +
          (n ? '<span>次の営業日は ' + jp(n) + ' です。</span>' : '') + '</div>'
        : '<div class="bc-today on"><span class="bc-dot"></span>本日 ' + jp(t) + ' は<strong>営業日</strong>です。<span>営業時間 ' + C.hours + '</span></div>';
      root.innerHTML = todayHtml +
        '<div class="bc-nav"><button type="button" class="bc-prev" aria-label="前の月"' + (offset <= 0 ? ' disabled' : '') + '>‹ 前月</button>' +
        '<button type="button" class="bc-next" aria-label="次の月"' + (offset >= 10 ? ' disabled' : '') + '>翌月 ›</button></div>' +
        '<div class="bc-months">' + month(a.getFullYear(), a.getMonth()) + month(b.getFullYear(), b.getMonth()) + '</div>' +
        '<div class="bc-legend"><span><i class="lg closed"></i>休業日（土日・祝日）</span><span><i class="lg temp"></i>臨時休業</span><span><i class="lg today"></i>本日</span></div>' +
        upcoming();
      root.querySelector('.bc-prev').onclick = function () { if (offset > 0) { offset--; render(); } };
      root.querySelector('.bc-next').onclick = function () { if (offset < 10) { offset++; render(); } };
    }
    render();
    calendar.render = render;
  }

  // 設定にない年の祝日は holidays-jp（内閣府データ）から補完
  function fillHolidays(done) {
    var y = today().getFullYear(), need = [y, y + 1].filter(function (yr) {
      return !Object.keys(holidays).some(function (k) { return k.indexOf(yr + '-') === 0; });
    });
    if (!need.length || !window.fetch) return done();
    Promise.all(need.map(function (yr) {
      return fetch('https://holidays-jp.github.io/api/v1/' + yr + '/date.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
    })).then(function (rs) { rs.forEach(function (o) { Object.assign(holidays, o); }); done(); });
  }

  function init() { noticeBar(); calendar(); fillHolidays(function () { if (calendar.render) calendar.render(); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
