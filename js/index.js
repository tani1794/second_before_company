/* トップページ:車の図のホットスポットと、情報リレーの動き */
(function () {
  "use strict";
  var info = {
    ecu: ["ECU(電子制御ユニット)", "エンジンルームなどに置かれる「司令塔」。エンジン用・ブレーキ用など、仕事ごとに何十個もあります。", "ecu.html"],
    mcu: ["MCU(マイコン)", "ECUの中心部品。メーターやエアコン、窓の開け閉めなど、車のあちこちの電子部品の中に入っています。", "mcu.html"],
    obd: ["OBD(自己診断)コネクター", "運転席の足元付近にある差し込み口。ここに診断機をつなぐと、車が記録した故障コードを読めます。", "obd.html"],
    gyro: ["ジャイロセンサー", "車の中心付近で、車体の回転(向きの変わり方)を見張っています。横滑り防止装置の「目」です。", "gyro.html"],
    hub: ["ハブ(ハブモーター)", "車輪の中心部分が「ハブ」。ここにモーターを組み込むと、タイヤを直接回せます。", "hub.html#motor"],
    harness: ["ワイヤーハーネス", "紫の点線。車じゅうに張りめぐらされた配線の束で、電気と信号を運びます。", "harness.html"]
  };
  var box = document.getElementById("car-info");
  var esc = window.OAS ? window.OAS.esc : function (s) { return s; };
  Array.prototype.forEach.call(document.querySelectorAll("#car-map .hotspot"), function (g) {
    var show = function () {
      var d = info[g.getAttribute("data-key")];
      box.innerHTML = "<b>" + esc(d[0]) + "</b><br>" + esc(d[1]) + '<br><a href="' + d[2] + '">このページへ →</a>';
    };
    g.addEventListener("mouseenter", show);
    g.addEventListener("focus", show);
    g.addEventListener("click", show);
    g.addEventListener("keydown", function (e) { if (e.key === "Enter") location.href = info[g.getAttribute("data-key")][2]; });
  });

  // 情報リレー
  var steps = [
    { x: 80,  t: "① ジャイロなどの<b>センサー</b>が、車の状態(回転の速さ、タイヤの速度など)を電気の信号に変えます。" },
    { x: 260, t: "② <b>ワイヤーハーネス</b>(配線の束)が、その信号をECUまで運びます。" },
    { x: 450, t: "③ <b>ECU</b>の中の<b>MCU(マイコン)</b>が、プログラムに従って計算し「ブレーキを少し強める」と判断します。" },
    { x: 640, t: "④ <b>アクチュエーター</b>(実際に動く部品)が指示どおりにブレーキを動かします。" },
    { x: 820, t: "⑤ もし途中で異常があれば、<b>OBD</b>が故障コードとして記録し、警告灯で知らせます。" }
  ];
  var i = -1, dot = document.getElementById("relay-dot"), txt = document.getElementById("relay-text");
  var boxes = document.querySelectorAll("#relay [data-step] rect");
  function go(n) {
    i = n;
    Array.prototype.forEach.call(boxes, function (r, k) { r.setAttribute("stroke", k === i ? "#3a6fe0" : "#e3e7ee"); r.setAttribute("fill", k === i ? "#edf2fd" : "#fff"); });
    if (i < 0) { dot.setAttribute("cx", 80); txt.innerHTML = "「次へ進む」を押してください。"; return; }
    dot.style.transition = "cx .6s ease"; dot.setAttribute("cx", steps[i].x);
    txt.innerHTML = steps[i].t;
  }
  document.getElementById("relay-next").addEventListener("click", function () { go(i + 1 >= steps.length ? 0 : i + 1); });
  document.getElementById("relay-reset").addEventListener("click", function () { go(-1); });
})();
