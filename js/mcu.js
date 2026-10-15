/* MCUページ:内部構成図とファンのデモ */
(function () {
  "use strict";
  var parts = {
    cpu: ["CPU(中央処理装置)", "計算と判断をする「脳」。ROMに書かれた手順を1つずつ読み、その通りに計算します。"],
    rom: ["ROM / フラッシュメモリー", "プログラム(仕事の手順書)をしまっておく「本棚」。電源を切っても消えません。車では、ソフトの更新でここを書き換えることもあります。"],
    ram: ["RAM", "計算の途中経過を置く「作業机」。電源を切ると内容は消えます。"],
    io: ["I/O(入出力ポート)", "チップから出ている足(ピン)を通して、スイッチの状態を読んだり(入力)、ランプやモーターに指示を出したり(出力)します。"],
    adc: ["A/D変換器", "温度や電圧のような「なめらかに変わる量(アナログ)」を、CPUが扱える「数字(デジタル)」に変換します。"],
    timer: ["タイマー", "正確に時間を数える部分。「0.01秒ごとにセンサーを読む」といった仕事に使います。"],
    com: ["通信", "ほかのMCUやECUと情報をやりとりする部分。車では主にCAN(キャン)という方式が使われます。"]
  };
  var box = document.getElementById("mcu-info");
  Array.prototype.forEach.call(document.querySelectorAll(".mcu-part"), function (g) {
    g.style.cursor = "pointer";
    var show = function () {
      var p = parts[g.getAttribute("data-k")];
      box.innerHTML = "<b>" + p[0] + "</b><br>" + p[1];
      Array.prototype.forEach.call(document.querySelectorAll(".mcu-part rect"), function (r) { r.style.opacity = ".45"; });
      g.querySelector("rect").style.opacity = "1";
    };
    g.addEventListener("click", show);
    g.addEventListener("focus", show);
    g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
  });

  // ファンのデモ
  var range = document.getElementById("fd-range"), temp = document.getElementById("fd-temp"),
      judge = document.getElementById("fd-judge"), out = document.getElementById("fd-out"),
      fan = document.querySelector("#fd-fan > g"), angle = 0, speed = 0;
  function update() {
    var t = +range.value, on = t >= 30;
    temp.textContent = t + "℃";
    judge.textContent = on ? "30℃以上!" : "30℃未満";
    judge.setAttribute("fill", on ? "#e0524d" : "#3a6fe0");
    speed = on ? (t - 25) * 1.2 : 0;
    out.className = "demo-out " + (on ? "ng" : "ok");
    out.innerHTML = on ? "MCUが「暑い」と判断 → 出力ピンをONにして<b>ファンを回しています</b>。温度が高いほど速く回すように作ることもできます。"
                       : "MCUが「まだ大丈夫」と判断 → <b>ファンは止まっています</b>。";
  }
  range.addEventListener("input", update);
  update();
  (function spin() { angle = (angle + speed) % 360; fan.setAttribute("transform", "rotate(" + angle + ")"); requestAnimationFrame(spin); })();
})();
