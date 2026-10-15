/* ECUページ:CANの優先順位デモ */
(function () {
  "use strict";
  var btn = document.getElementById("can-send"), out = document.getElementById("can-out"), msg = document.getElementById("can-msg");
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".can-node"));
  var busy = false;
  function reset() { nodes.forEach(function (n) { n.querySelector("rect").setAttribute("stroke", "#cfd6e2"); n.querySelector("rect").setAttribute("fill", "#fff"); }); }
  btn.addEventListener("click", function () {
    if (busy) return; busy = true; reset();
    nodes.forEach(function (n) { n.querySelector("rect").setAttribute("stroke", "#7b5cf0"); });
    out.className = "demo-out"; out.innerHTML = "3台が同時に送信を開始…番号(ID)を1ビットずつ比べています。";
    var order = nodes.slice().sort(function (a, b) { return +a.dataset.id - +b.dataset.id; });
    var step = 0;
    function next() {
      if (step >= order.length) { busy = false; out.innerHTML += "<br>→ ぶつかってもデータが壊れず、<b>大事なものから順番に</b>届きます。これがCANの強みです。"; return; }
      var n = order[step], rect = n.querySelector("rect");
      nodes.forEach(function (o) { if (o !== n && order.indexOf(o) > step) o.querySelector("rect").setAttribute("stroke", "#cfd6e2"); });
      rect.setAttribute("stroke", "#3a6fe0"); rect.setAttribute("fill", "#edf2fd");
      var x0 = +rect.getAttribute("x") + 55;
      msg.style.transition = "none"; msg.setAttribute("cx", x0);
      requestAnimationFrame(function () { msg.style.transition = "cx 1s ease"; msg.setAttribute("cx", step % 2 ? 20 : 400); });
      var name = n.querySelector("text").textContent;
      out.innerHTML = (step === 0 ? "番号がいちばん小さい<b>" : (step + 1) + "番目:<b>") + name + "(ID " + n.dataset.id + ")</b>" +
        (step === 0 ? "が優先されて先に送信!ほかのECUは自動で待ちます。" : "が送信。");
      step++;
      setTimeout(next, 1400);
    }
    setTimeout(next, 700);
  });
})();
