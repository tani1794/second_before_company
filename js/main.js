/* =========================================================
   ONEV ALLEY STATION — 共通の動き
   1. ヘッダー(スクロールで線が出る/スマホメニュー)
   2. スクロールでフェードイン・アウト
   3. ページ内タブの現在地表示
   4. コンテンツ内の切り替えタブ
   5. 数字のカウントアップ・棒グラフ
   6. 用語ツールチップ
   7. 用語検索(用語集+インターネット)
   ========================================================= */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. ヘッダー ---------- */
  var header = $(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = $(".nav-toggle"), nav = $(".global-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); document.body.style.overflow = "";
      });
    });
  }

  /* ---------- 2. フェードイン・アウト ---------- */
  // 画面に入ったらフェードイン、画面から外れたらフェードアウトします。
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle("is-visible", e.isIntersecting);
        if (e.isIntersecting) e.target.dispatchEvent(new CustomEvent("reveal"));
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); el.dispatchEvent(new CustomEvent("reveal")); });
  }

  /* ---------- 3. ページ内タブの現在地 ---------- */
  var tabLinks = $$(".page-tabs a");
  if (tabLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tabLinks.forEach(function (a) { var id = a.getAttribute("href").slice(1); var sec = document.getElementById(id); if (sec) map[id] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          tabLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[e.target.id];
          if (a) { a.classList.add("is-active"); a.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ---------- 4. 切り替えタブ ---------- */
  function activateTab(tabs, btn) {
    $$(".tab-btn", tabs).forEach(function (b) {
      var on = b === btn;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(b.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    tabs.dispatchEvent(new CustomEvent("tabchange", { detail: btn.getAttribute("aria-controls") }));
  }
  $$(".tabs").forEach(function (tabs) {
    var btns = $$(".tab-btn", tabs);
    btns.forEach(function (btn, i) {
      btn.addEventListener("click", function () { activateTab(tabs, btn); });
      btn.addEventListener("keydown", function (ev) {
        var d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
        if (d) { var n = btns[(i + d + btns.length) % btns.length]; n.focus(); activateTab(tabs, n); }
      });
    });
  });
  // URLの「#usb」などで、該当タブを開いた状態にする
  function openTabFromHash() {
    var h = location.hash.slice(1); if (!h) return;
    var btn = $('.tab-btn[data-hash="' + h + '"]');
    if (btn) { activateTab(btn.closest(".tabs"), btn); setTimeout(function () { btn.closest(".tabs").scrollIntoView({ behavior: "smooth" }); }, 50); }
  }
  window.addEventListener("hashchange", openTabFromHash);
  openTabFromHash();

  /* ---------- 5. カウントアップ・棒グラフ ---------- */
  $$("[data-count]").forEach(function (el) {
    var done = false, target = parseFloat(el.getAttribute("data-count"));
    var holder = el.closest(".reveal") || el;
    holder.addEventListener("reveal", function () {
      if (done) return; done = true;
      if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
      var start = performance.now(), dur = 1400;
      (function step(t) {
        var p = Math.min(1, (t - start) / dur), v = target * (1 - Math.pow(1 - p, 3));
        el.textContent = Math.round(v).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  });
  $$(".bar-fill").forEach(function (bar) {
    var holder = bar.closest(".reveal") || bar;
    holder.addEventListener("reveal", function () { bar.style.width = bar.getAttribute("data-width") + "%"; });
  });

  /* ---------- 6. 用語ツールチップ ---------- */
  var G = window.GLOSSARY || [];
  function findLocal(word) {
    var w = String(word).trim().toLowerCase().replace(/[‐\-–\s]/g, "");
    if (!w) return null;
    for (var i = 0; i < G.length; i++) {
      var g = G[i];
      var names = [g.term].concat(g.alias || []).map(function (s) { return s.toLowerCase().replace(/[‐\-–\s]/g, ""); });
      if (names.indexOf(w) >= 0) return g;
    }
    return null;
  }
  function searchLocal(word) {
    var w = String(word).trim().toLowerCase();
    if (!w) return [];
    return G.filter(function (g) {
      var hay = [g.term, g.full, g.ja, g.desc].concat(g.alias || []).join(" ").toLowerCase();
      return hay.indexOf(w) >= 0;
    }).sort(function (a, b) {
      // 用語名に一致するものを先に
      var am = (a.term + (a.alias || []).join()).toLowerCase().indexOf(w) >= 0 ? 0 : 1;
      var bm = (b.term + (b.alias || []).join()).toLowerCase().indexOf(w) >= 0 ? 0 : 1;
      return am - bm;
    });
  }

  var pop = document.createElement("div");
  pop.className = "term-pop"; pop.setAttribute("role", "tooltip");
  document.body.appendChild(pop);
  var hideTimer;
  function showPop(el) {
    var g = findLocal(el.getAttribute("data-term") || el.textContent);
    if (!g) return;
    clearTimeout(hideTimer);
    pop.innerHTML = "<b>" + esc(g.term) + "|" + esc(g.ja) + "</b>" + esc(g.desc) +
      (g.page ? '<br><a href="' + esc(g.page) + '">くわしく見る →</a>' : "");
    var r = el.getBoundingClientRect();
    pop.style.left = Math.max(12, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - 332)) + "px";
    pop.style.top = (window.scrollY + r.bottom + 10) + "px";
    pop.classList.add("is-show");
  }
  function hidePop() { hideTimer = setTimeout(function () { pop.classList.remove("is-show"); }, 180); }
  $$(".term").forEach(function (el) {
    el.tabIndex = 0;
    el.addEventListener("mouseenter", function () { showPop(el); });
    el.addEventListener("mouseleave", hidePop);
    el.addEventListener("focus", function () { showPop(el); });
    el.addEventListener("blur", hidePop);
    el.addEventListener("click", function () { showPop(el); });
  });
  pop.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
  pop.addEventListener("mouseleave", hidePop);

  /* ---------- 7. 用語検索 ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function enc(s) { return encodeURIComponent(s); }

  function externalLinks(q) {
    return '<div class="actions">' +
      '<a href="https://www.google.com/search?q=' + enc(q + " とは わかりやすく") + '" target="_blank" rel="noopener">Googleで「とは」を検索</a>' +
      '<a href="https://www.google.com/search?q=' + enc(q + " 使い方 初心者") + '" target="_blank" rel="noopener">使い方を検索</a>' +
      '<a href="https://www.google.com/search?tbm=isch&q=' + enc(q) + '" target="_blank" rel="noopener">画像で見る</a>' +
      '</div>';
  }
  function localCard(g) {
    return '<article class="result"><span class="src-label local">● このサイトの用語集</span>' +
      "<h4>" + esc(g.term) + "|" + esc(g.ja) + "</h4>" +
      '<p class="muted">' + esc(g.full) + "</p>" +
      "<p>" + esc(g.desc) + "</p>" +
      (g.how ? '<div class="how"><b>扱い方のポイント:</b>' + esc(g.how) + "</div>" : "") +
      '<div class="actions">' + (g.page ? '<a href="' + esc(g.page) + '">このサイトでくわしく</a>' : "") + "</div></article>";
  }

  // インターネット(Wikipedia日本語版)から要約を取ってくる
  function fetchWeb(q) {
    var api = "https://ja.wikipedia.org/w/api.php?action=query&list=search&srlimit=3&format=json&origin=*&srsearch=" + enc(q);
    return fetch(api).then(function (r) { if (!r.ok) throw new Error("search"); return r.json(); })
      .then(function (data) {
        var hits = (data.query && data.query.search) || [];
        return Promise.all(hits.map(function (h) {
          return fetch("https://ja.wikipedia.org/api/rest_v1/page/summary/" + enc(h.title.replace(/ /g, "_")))
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
        }));
      })
      .then(function (list) { return list.filter(function (x) { return x && x.extract && x.type !== "disambiguation"; }); });
  }
  function webCard(s) {
    var url = (s.content_urls && s.content_urls.desktop && s.content_urls.desktop.page) || ("https://ja.wikipedia.org/wiki/" + enc(s.title));
    var text = s.extract.length > 260 ? s.extract.slice(0, 260) + "…" : s.extract;
    return '<article class="result"><span class="src-label web">● インターネット(Wikipedia日本語版)</span>' +
      "<h4>" + esc(s.title) + "</h4>" + (s.description ? '<p class="muted">' + esc(s.description) + "</p>" : "") +
      "<p>" + esc(text) + "</p>" +
      '<div class="actions"><a href="' + esc(url) + '" target="_blank" rel="noopener">元の記事を読む ↗</a></div></article>';
  }

  function runSearch(q, out) {
    q = String(q || "").trim();
    if (!q) { out.innerHTML = ""; return; }
    var locals = searchLocal(q);
    var html = locals.slice(0, 4).map(localCard).join("");
    html += '<div class="web-zone"><p class="search-note"><span class="loading"></span>インターネットで「' + esc(q) + '」を調べています…</p></div>';
    out.innerHTML = html;
    var zone = $(".web-zone", out);
    fetchWeb(q).then(function (list) {
      if (!list.length) {
        zone.innerHTML = '<p class="search-note">インターネット上の百科事典では見つかりませんでした。下のボタンで検索エンジンを使って調べられます。</p>' + externalLinks(q);
      } else {
        zone.innerHTML = list.map(webCard).join("") +
          '<p class="search-note">※インターネットの情報は自動で取得しています。内容が正しいか、複数の情報源で確かめる習慣をつけましょう。</p>' + externalLinks(q);
      }
    }).catch(function () {
      zone.innerHTML = '<p class="search-note">インターネットにつながらないか、取得に失敗しました。下のボタンから検索エンジンで調べられます。</p>' + externalLinks(q);
    });
  }

  function bindSearch(form) {
    var input = $("input", form), out = document.getElementById(form.getAttribute("data-out"));
    form.addEventListener("submit", function (ev) { ev.preventDefault(); runSearch(input.value, out); });
    var wrap = form.parentNode;
    $$(".chip", wrap).forEach(function (c) {
      c.addEventListener("click", function () { input.value = c.textContent; runSearch(input.value, out); });
    });
    return { input: input, out: out };
  }
  var forms = $$("form.search-box").map(bindSearch);

  // 右下ボタンで開く検索パネル
  var fab = $(".search-fab"), drawer = $(".search-drawer");
  if (fab && drawer) {
    var lastFocus;
    var open = function () { lastFocus = document.activeElement; drawer.classList.add("is-open"); setTimeout(function () { $("input", drawer).focus(); }, 50); };
    var close = function () { drawer.classList.remove("is-open"); if (lastFocus) lastFocus.focus(); };
    fab.addEventListener("click", open);
    $(".backdrop", drawer).addEventListener("click", close);
    $(".close", drawer).addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) close(); });
  }

  // 用語検索ページ: URLの ?q=○○ で自動検索
  var params = new URLSearchParams(location.search);
  if (params.get("q") && forms.length) { forms[0].input.value = params.get("q"); runSearch(params.get("q"), forms[0].out); }

  // 用語集ページ: 一覧表示
  var list = document.getElementById("glossary-list");
  if (list) {
    list.innerHTML = G.slice().sort(function (a, b) { return a.term.localeCompare(b.term, "ja"); }).map(localCard).join("");
  }

  // 他のスクリプトから使えるように公開
  window.OAS = { esc: esc, findLocal: findLocal };
})();
