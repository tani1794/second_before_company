/* ハーネスページ:ECUの数と配線の本数 */
(function () {
  "use strict";
  var svg = document.getElementById("wire-demo"), range = document.getElementById("wire-n"),
      nv = document.getElementById("wire-nv"), out = document.getElementById("wire-out"), mode = "p2p";
  Array.prototype.forEach.call(document.querySelectorAll(".wire-mode"), function (b) {
    b.addEventListener("click", function () {
      mode = b.dataset.mode;
      Array.prototype.forEach.call(document.querySelectorAll(".wire-mode"), function (x) { x.setAttribute("aria-selected", String(x === b)); });
      draw();
    });
  });
  function draw() {
    var n = +range.value, cx = 160, cy = 120, R = 95, pts = [], s = "";
    nv.textContent = n + "個";
    for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    var lines;
    if (mode === "p2p") {
      lines = n * (n - 1) / 2;
      for (var p = 0; p < n; p++) for (var q = p + 1; q < n; q++)
        s += '<line x1="' + pts[p][0] + '" y1="' + pts[p][1] + '" x2="' + pts[q][0] + '" y2="' + pts[q][1] + '" stroke="#e0524d" stroke-width="1.4" opacity=".7"/>';
    } else {
      lines = 2;
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R - 26) + '" fill="none" stroke="#3a6fe0" stroke-width="3"/>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R - 32) + '" fill="none" stroke="#7b5cf0" stroke-width="3"/>';
      pts.forEach(function (pt) {
        var dx = pt[0] - cx, dy = pt[1] - cy, d = Math.hypot(dx, dy), k = (R - 26) / d;
        s += '<line x1="' + pt[0] + '" y1="' + pt[1] + '" x2="' + (cx + dx * k) + '" y2="' + (cy + dy * k) + '" stroke="#cfd6e2" stroke-width="2"/>';
      });
    }
    pts.forEach(function (pt, i) {
      s += '<rect x="' + (pt[0] - 15) + '" y="' + (pt[1] - 11) + '" width="30" height="22" rx="5" fill="#0e1726"/>' +
           '<text x="' + pt[0] + '" y="' + (pt[1] + 4) + '" text-anchor="middle" font-size="10" fill="#fff">ECU</text>';
    });
    s += '<text x="160" y="250" text-anchor="middle" font-size="14" font-weight="700" fill="' + (mode === "p2p" ? "#e0524d" : "#3a6fe0") + '">配線の組み合わせ:' + lines + (mode === "p2p" ? " 通り" : " 本(共有)") + "</text>";
    svg.innerHTML = s;
    out.className = "demo-out " + (mode === "p2p" ? (lines > 20 ? "ng" : "") : "ok");
    out.innerHTML = mode === "p2p"
      ? "1対1で全部結ぶと、ECUが " + n + " 個で <b>" + lines + " 通り</b>の配線が必要。数が2倍になると、配線はおよそ4倍に増えます。"
      : "CANなら、ECUがいくつ増えても<b>共有する2本の通信線</b>に枝分かれでつなぐだけ。配線を大きく減らせます。";
  }
  range.addEventListener("input", draw);
  draw();
})();
