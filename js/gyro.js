/* ジャイロページ:MEMSのアニメーションと横滑り防止のシミュレーション */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- MEMS ---- */
  var mass = document.getElementById("mems-mass"), frame = document.getElementById("mems-frame"),
      springs = document.getElementById("mems-springs"), rateEl = document.getElementById("mems-rate"),
      valEl = document.getElementById("mems-val"), outEl = document.getElementById("mems-out");
  var rot = 0, last = performance.now(), t0 = last;
  function msg() {
    var r = +rateEl.value;
    valEl.textContent = (r * 3) + " °/s";
    outEl.innerHTML = r === 0 ? "回転なし:おもりは左右に震えているだけです。"
      : "本体が" + (r > 0 ? "右" : "左") + "回りに回転中 → コリオリの力で、おもりが<b>上下にも</b>ずれて楕円を描きます。" +
        (Math.abs(r) > 60 ? "速く回るほど、ずれも大きくなります。" : "") + "このずれの大きさを電極で測ります。";
  }
  rateEl.addEventListener("input", msg); msg();
  function drawMems(now) {
    var dt = (now - last) / 1000; last = now;
    var t = (now - t0) / 1000, r = +rateEl.value;
    var w = reduce ? 2 : 9;                       // 震えの速さ(見やすいようにゆっくり)
    var x = 150 + 50 * Math.sin(w * t);
    var y = 120 - (r / 100) * 45 * Math.cos(w * t);
    mass.setAttribute("x", x.toFixed(1)); mass.setAttribute("y", y.toFixed(1));
    rot += r * 0.6 * dt;
    frame.setAttribute("transform", "rotate(" + rot.toFixed(2) + " 180 150)");
    var c = [[x, y, 64, 54], [x + 60, y, 296, 54], [x, y + 60, 64, 246], [x + 60, y + 60, 296, 246]];
    springs.innerHTML = c.map(function (p) { return '<path d="M' + p[0] + " " + p[1] + " L" + p[2] + " " + p[3] + '"/>'; }).join("");
    requestAnimationFrame(drawMems);
  }
  requestAnimationFrame(drawMems);

  /* ---- ESC ---- */
  var ideal = document.getElementById("esc-ideal"), actual = document.getElementById("esc-actual"),
      car = document.getElementById("esc-car"), out = document.getElementById("esc-out");
  var wheels = ["w-fl", "w-fr", "w-rl", "w-rr"].map(function (id) { return document.getElementById(id); });
  var L = ideal.getTotalLength(), running = false;
  function at(s) { return ideal.getPointAtLength(Math.max(0, Math.min(L, s))); }
  function place(x, y, deg) { car.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + deg.toFixed(1) + ")"); }
  var p0 = at(0), p1 = at(2); place(p0.x, p0.y, Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI + 90);

  document.getElementById("esc-run").addEventListener("click", function () {
    if (running) return; running = true;
    var grip = +document.getElementById("esc-road-sel").value,
        type = document.getElementById("esc-type").value,
        on = document.getElementById("esc-on").checked;
    var slip = 1 - grip;                                   // 滑りやすさ
    var maxDev = slip * 110 * (on ? 0.18 : 1);
    var sign = type === "under" ? 1 : -1;                  // +:外へ / −:内へ
    var brakeId = type === "under" ? "w-rr" : "w-fl";      // 右カーブ:内側後輪 / 外側前輪
    wheels.forEach(function (w) { w.setAttribute("fill", "#8a94a6"); });
    var pts = [], start = performance.now(), dur = 3200, braked = false;
    out.className = "demo-out"; out.innerHTML = "走行中… ジャイロがヨーレートを測っています。";
    function frameStep(now) {
      var k = Math.min(1, (now - start) / dur), s = k * L;
      var p = at(s), q = at(s + 1.5);
      var tx = q.x - p.x, ty = q.y - p.y, n = Math.hypot(tx, ty) || 1; tx /= n; ty /= n;
      var nx = ty, ny = -tx;                                // カーブの外側向き
      var grow = Math.min(1, Math.max(0, (k - 0.25) / 0.5));
      var dev = sign * maxDev * (on ? Math.sin(grow * Math.PI) : grow);
      var x = p.x + nx * dev, y = p.y + ny * dev;
      pts.push(x.toFixed(1) + " " + y.toFixed(1));
      actual.setAttribute("d", "M" + pts.join(" L"));
      var yawExtra = type === "over" ? (on ? 12 : 70) * slip * grow : -(on ? 4 : 20) * slip * grow;
      place(x, y, Math.atan2(ty, tx) * 180 / Math.PI + 90 + yawExtra);
      if (on && slip > 0 && k > 0.3 && !braked) {
        braked = true; document.getElementById(brakeId).setAttribute("fill", "#e0524d");
        out.innerHTML = "ジャイロの値と「曲がりたい量」がずれた!→ ESCが<b>" +
          (type === "under" ? "内側の後輪" : "外側の前輪") + "</b>にブレーキ(赤いタイヤ)。";
      }
      if (k < 1) { requestAnimationFrame(frameStep); return; }
      running = false;
      if (slip === 0) { out.className = "demo-out ok"; out.innerHTML = "乾いた路面では、曲がりたい量と実際の回転がほぼ一致。<b>ESCは作動しません</b>。"; }
      else if (on) { out.className = "demo-out ok"; out.innerHTML += "<br>→ 進路のずれを小さくおさえて、カーブを曲がりきりました。"; }
      else { out.className = "demo-out ng"; out.innerHTML = "ESCなし:" + (type === "under" ? "車が外へふくらみ、道からはみ出しました。" : "後ろが滑って、車が内側へ回りこみました。") + "ESCを作動させて比べてみましょう。"; }
    }
    requestAnimationFrame(frameStep);
  });
})();
