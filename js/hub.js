/* ハブページ:ハブとスイッチの違い/USBハブの電流計算 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  /* ---- ネットワーク ---- */
  var mode = "switch", busy = false;
  var label = document.getElementById("net-label"), layer = document.getElementById("net-packets"), out = document.getElementById("net-out");
  Array.prototype.forEach.call(document.querySelectorAll(".net-mode"), function (b) {
    b.addEventListener("click", function () {
      mode = b.dataset.mode;
      Array.prototype.forEach.call(document.querySelectorAll(".net-mode"), function (x) { x.setAttribute("aria-selected", String(x === b)); });
      label.textContent = mode === "hub" ? "ハブ" : "スイッチ";
      out.className = "demo-out"; out.textContent = "「送信」を押してみましょう。";
    });
  });
  function packet(x1, y1, x2, y2, color, delay, cb) {
    var c = document.createElementNS(NS, "circle");
    c.setAttribute("r", 7); c.setAttribute("fill", color); c.setAttribute("cx", x1); c.setAttribute("cy", y1);
    layer.appendChild(c);
    var start = null, dur = 700;
    setTimeout(function () {
      requestAnimationFrame(function step(t) {
        if (!start) start = t;
        var k = Math.min(1, (t - start) / dur), e = k * (2 - k);
        c.setAttribute("cx", x1 + (x2 - x1) * e); c.setAttribute("cy", y1 + (y2 - y1) * e);
        if (k < 1) requestAnimationFrame(step); else if (cb) cb(c);
      });
    }, delay);
  }
  document.getElementById("net-send").addEventListener("click", function () {
    if (busy) return; busy = true; layer.innerHTML = "";
    out.className = "demo-out"; out.textContent = "PC A がデータを送信…";
    packet(60, 60, 180, 150, "#3a6fe0", 0, function (c) {
      layer.removeChild(c);
      var targets = mode === "hub" ? [[300, 60, false], [60, 240, false], [300, 240, true]] : [[300, 240, true]];
      var left = targets.length;
      targets.forEach(function (t) {
        packet(180, 150, t[0], t[1], t[2] ? "#3a6fe0" : "#e0524d", 0, function () {
          if (--left === 0) {
            busy = false;
            if (mode === "hub") { out.className = "demo-out ng"; out.innerHTML = "<b>ハブ</b>は宛先に関係なく<b>全員にコピー</b>(赤は不要なデータ)。PC Bやプリンターは、自分宛てでないデータを捨てています。"; }
            else { out.className = "demo-out ok"; out.innerHTML = "<b>スイッチ</b>は宛先の住所(MACアドレス)を覚えていて、<b>PC Cにだけ</b>届けます。ほかの機器の通信を邪魔しません。"; }
          }
        });
      });
    });
  });

  /* ---- USB ---- */
  var items = [
    ["マウス", 100], ["キーボード", 100], ["USBメモリー", 200], ["Webカメラ", 250], ["外付けSSD", 500], ["外付けHDD(2.5インチ)", 700]
  ];
  var LIMIT = 900, sel = {}, wrap = document.getElementById("usb-items"), bar = document.getElementById("usb-bar"), uo = document.getElementById("usb-out");
  items.forEach(function (it, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = it[0] + "(約" + it[1] + "mA)";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      sel[i] = !sel[i]; b.classList.toggle("is-on", !!sel[i]); b.setAttribute("aria-pressed", String(!!sel[i])); calc();
    });
    wrap.appendChild(b);
  });
  function calc() {
    var sum = 0; items.forEach(function (it, i) { if (sel[i]) sum += it[1]; });
    var pct = Math.min(100, sum / LIMIT * 100);
    bar.style.width = pct + "%";
    bar.style.background = sum > LIMIT ? "linear-gradient(90deg,#e0524d,#e0524d)" : "";
    if (!sum) { uo.className = "demo-out"; uo.textContent = "機器を選ぶと、合計の電流が表示されます。"; return; }
    if (sum <= LIMIT * 0.8) { uo.className = "demo-out ok"; uo.innerHTML = "合計 約<b>" + sum + "mA</b> / 上限900mA:バスパワーでも動きそうです。"; }
    else if (sum <= LIMIT) { uo.className = "demo-out"; uo.innerHTML = "合計 約<b>" + sum + "mA</b> / 上限900mA:ぎりぎりです。動作が不安定になることがあります。"; }
    else { uo.className = "demo-out ng"; uo.innerHTML = "合計 約<b>" + sum + "mA</b> / 上限900mA:<b>電気が足りません</b>。機器が認識されない・途中で切れる原因になります。<b>セルフパワー</b>のハブを使いましょう。"; }
  }
})();
