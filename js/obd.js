/* OBDページ:16ピンコネクターと故障コードの読み解き */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var pinInfo = {
    2: ["2番:J1850 バス(+)", "古いアメリカ車などで使われた通信方式の線。"],
    4: ["4番:車体アース", "車のボディ(金属部分)につながる、電気の帰り道。"],
    5: ["5番:信号アース", "通信やセンサー信号の基準になる、電気の帰り道。"],
    6: ["6番:CAN-High", "CAN通信の2本の線のうちの1本。今の車ではここを通って診断データがやりとりされます。"],
    7: ["7番:K-Line", "CANより前から使われている、ゆっくりした通信方式の線。"],
    10: ["10番:J1850 バス(−)", "2番と対になる通信線。"],
    14: ["14番:CAN-Low", "CAN通信のもう1本の線。6番とペアで使います。"],
    15: ["15番:L-Line", "K-Lineと組み合わせて使われることがある通信線。"],
    16: ["16番:バッテリー電源(+)", "スキャンツールに電気を送る線。エンジンが止まっていても電気が来ています。"]
  };
  var g = document.getElementById("obd-pins"), box = document.getElementById("pin-info");
  function addPin(n, x, y) {
    var used = !!pinInfo[n];
    var grp = document.createElementNS(NS, "g");
    grp.setAttribute("tabindex", "0"); grp.setAttribute("role", "button"); grp.setAttribute("aria-label", n + "番ピン");
    grp.style.cursor = "pointer";
    var r = document.createElementNS(NS, "rect");
    r.setAttribute("x", x - 13); r.setAttribute("y", y - 16); r.setAttribute("width", 26); r.setAttribute("height", 32); r.setAttribute("rx", 5);
    r.setAttribute("fill", used ? "#3a6fe0" : "#2a3650");
    if (n === 16) r.setAttribute("fill", "#e0524d");
    if (n === 6 || n === 14) r.setAttribute("fill", "#7b5cf0");
    var t = document.createElementNS(NS, "text");
    t.setAttribute("x", x); t.setAttribute("y", y + 5); t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", "12"); t.setAttribute("fill", "#fff");
    t.textContent = n;
    grp.appendChild(r); grp.appendChild(t); g.appendChild(grp);
    var show = function () {
      var d = pinInfo[n] || [n + "番", "規格では用途が決められておらず、メーカーが独自に使えるピンです。"];
      box.innerHTML = "<b>" + d[0] + "</b><br>" + d[1];
      Array.prototype.forEach.call(g.querySelectorAll("rect"), function (x) { x.setAttribute("stroke", "none"); });
      r.setAttribute("stroke", "#fff"); r.setAttribute("stroke-width", "2");
    };
    grp.addEventListener("mouseenter", show); grp.addEventListener("focus", show); grp.addEventListener("click", show);
  }
  for (var i = 0; i < 8; i++) addPin(i + 1, 72 + i * 42.3, 80);
  for (var j = 0; j < 8; j++) addPin(j + 9, 88 + j * 37.7, 132);

  // 故障コード
  var L = {
    P: ["パワートレイン", "エンジン・変速機など「走る」ための部分"],
    C: ["シャシー", "ブレーキ・ハンドル・サスペンションなど足まわり"],
    B: ["ボディ", "エアバッグ・エアコン・シートなど車体と車内"],
    U: ["ネットワーク", "ECU同士の通信(CANなど)"]
  };
  var D2 = {
    "0": "全メーカー共通のコード(規格で意味が決まっている)",
    "1": "メーカー独自のコード(意味はメーカーの整備書で確認)",
    "2": "主に共通のコード(一部メーカー独自)",
    "3": "共通とメーカー独自が混在する範囲"
  };
  var P3 = {
    "0": "燃料・空気の量と、補助的な排ガス制御", "1": "燃料と空気の量の測定", "2": "燃料噴射装置の回路",
    "3": "点火系・失火(燃焼がうまくいかない)", "4": "排出ガスを減らす補助装置", "5": "車速・アイドリング制御・補助入力",
    "6": "コンピューター(ECU)と出力回路", "7": "変速機(トランスミッション)", "8": "変速機(トランスミッション)", "9": "変速機・その他"
  };
  var known = {
    P0300: "複数の気筒(シリンダー)でランダムに失火を検出",
    P0171: "燃料が薄すぎる状態(バンク1)。空気が多すぎる・燃料が少なすぎる原因を探す",
    P0172: "燃料が濃すぎる状態(バンク1)",
    P0420: "触媒(排ガスをきれいにする部品)の効率が下がっている(バンク1)",
    U0100: "エンジン制御ECUとの通信が途絶えている"
  };
  var input = document.getElementById("dtc-input"), out = document.getElementById("dtc-out");
  function card(ch, title, body) {
    return '<div class="card"><div style="font-family:Cormorant Garamond,serif;font-size:40px;line-height:1;color:var(--blue)">' + ch + '</div><h3 style="margin-top:10px;font-size:16px">' + title + '</h3><p style="font-size:14px">' + body + "</p></div>";
  }
  function decode() {
    var c = input.value.trim().toUpperCase(); input.value = c;
    if (!/^[PCBU][0-3][0-9A-F]{3}$/.test(c)) {
      out.innerHTML = '<div class="demo-out ng" style="grid-column:1/-1">「P0301」のように、<b>P・C・B・U のどれか1文字+数字4ケタ</b>(2ケタ目は0〜3)で入力してください。</div>';
      return;
    }
    var l = L[c[0]];
    var third = c[0] === "P" ? (P3[c[2]] || "その他") : "装置の細かい区分(メーカーによって異なる場合があります)";
    var last = "具体的な不具合の番号";
    if (/^P030[1-9]$/.test(c)) last = c[4] + "番目の気筒(シリンダー)で失火を検出";
    else if (known[c]) last = known[c];
    out.innerHTML = card(c[0], "1文字目:" + l[0], l[1]) + card(c[1], "2ケタ目:種類", D2[c[1]]) +
      card(c[2], "3ケタ目:系統", third) + card(c.slice(3), "4・5ケタ目:中身", last);
  }
  document.getElementById("dtc-btn").addEventListener("click", decode);
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") decode(); });
  Array.prototype.forEach.call(document.querySelectorAll(".dtc-ex"), function (b) { b.addEventListener("click", function () { input.value = b.textContent; decode(); }); });
  decode();
})();
