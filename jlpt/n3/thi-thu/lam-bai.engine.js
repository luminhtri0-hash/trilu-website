/* ════════════════════════════════════════════════════════════
   Trí Lữ Nihongo — Thi thử N3 · Engine
   Render đề · bấm giờ · chấm chuẩn 0–180 · sửa đề · định hướng AI
   ════════════════════════════════════════════════════════════ */
(function () {
  var E = window.EXAM;
  var Q = E.questions;
  var TOTAL = Q.length;
  var answers = {};          // qIndex -> optionIndex
  var currentIdx = 0;
  var submitted = false;

  var CAT = {
    lang:   { name: "Ngôn ngữ", jp: "言語知識（文字・語彙・文法）" },
    read:   { name: "Đọc hiểu", jp: "読解" },
    listen: { name: "Nghe hiểu", jp: "聴解" }
  };
  var LETTER = ["A", "B", "C", "D"];

  /* ---------- build flat index map per section ---------- */
  // global question number = position in Q (1-based)
  var byCat = { lang: [], read: [], listen: [] };
  Q.forEach(function (q, i) { byCat[q.cat].push(i); });

  /* ════════ RENDER EXAM ════════ */
  var sectionsEl = document.getElementById("sections");
  var qnRow = document.getElementById("qnRow");
  document.getElementById("totalCount").textContent = TOTAL;

  E.sections.forEach(function (sec) {
    var idxs = byCat[sec.id];
    if (!idxs.length) return;

    var wrap = document.createElement("section");
    wrap.className = "qs";
    var head =
      '<div class="qs-head">' +
        '<div class="qs-kick"><span>' + sec.kick + '</span></div>' +
        '<h2 class="qs-title">' + sec.title + '</h2>' +
        '<p class="qs-sub">' + sec.sub + '</p>' +
      '</div>';
    var qHtml = "";
    idxs.forEach(function (gi) {
      var q = Q[gi];
      var n = gi + 1;
      var audio = q.audio
        ? '<div class="audio">' +
            '<button class="audio-play" type="button" aria-label="Phát audio"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>' +
            '<div class="audio-wave">' + waveBars() + '</div>' +
            '<div class="audio-meta">' + q.audio.dur + ' · ♪ 1×</div>' +
          '</div>'
        : "";
      var passage = q.passage
        ? '<div class="q-passage"><p>' + q.passage + '</p></div>'
        : "";
      var opts = q.options.map(function (o, oi) {
        return '<button class="opt" type="button" data-q="' + gi + '" data-o="' + oi + '">' +
                 '<span class="opt-mark"></span>' +
                 '<span class="opt-text"><span class="opt-key">' + LETTER[oi] + '</span>' + o.jp +
                   (o.vn ? ' <span class="vn" style="color:var(--ink-55);font-size:.82em;">— ' + o.vn + '</span>' : '') +
                 '</span>' +
               '</button>';
      }).join("");

      qHtml +=
        '<div class="q" id="q-' + gi + '">' +
          '<div class="q-top">' +
            '<div class="q-num"><span class="small">Câu</span>' + pad(n) + '</div>' +
            '<div class="q-instruct">' + q.instruct + '</div>' +
          '</div>' +
          passage +
          audio +
          '<div class="q-prompt">' + q.prompt + '</div>' +
          '<div class="opts">' + opts + '</div>' +
        '</div>';
    });

    wrap.innerHTML = head + qHtml;
    sectionsEl.appendChild(wrap);
  });

  /* qnav numbers */
  Q.forEach(function (q, gi) {
    var b = document.createElement("button");
    b.className = "qn";
    b.id = "qn-" + gi;
    b.type = "button";
    b.textContent = pad(gi + 1);
    b.addEventListener("click", function () { goTo(gi); });
    qnRow.appendChild(b);
  });

  /* option selection */
  sectionsEl.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".opt");
    if (!btn || submitted) return;
    var gi = +btn.dataset.q, oi = +btn.dataset.o;
    answers[gi] = oi;
    // update UI within this question
    var parent = btn.closest(".opts");
    parent.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("selected"); });
    btn.classList.add("selected");
    document.getElementById("qn-" + gi).classList.add("answered");
    currentIdx = gi;
    updateProgress();
    setCurrent(gi);
  });

  /* audio (visual only) */
  sectionsEl.addEventListener("click", function (ev) {
    var play = ev.target.closest(".audio-play");
    if (!play) return;
    var wave = play.parentElement.querySelector(".audio-wave");
    wave.classList.toggle("playing");
    animateWave(wave);
  });

  function updateProgress() {
    var n = Object.keys(answers).length;
    document.getElementById("answeredBig").textContent = n;
    document.getElementById("progFill").style.width = (n / TOTAL * 100) + "%";
  }
  updateProgress();

  /* ---------- navigation ---------- */
  function goTo(gi) {
    currentIdx = gi;
    setCurrent(gi);
    var el = document.getElementById("q-" + gi);
    if (el) {
      var y = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }
  function setCurrent(gi) {
    document.querySelectorAll(".qn").forEach(function (x) { x.classList.remove("current"); });
    var n = document.getElementById("qn-" + gi);
    if (n) n.classList.add("current");
    document.getElementById("prevBtn").classList.toggle("disabled", gi <= 0);
    document.getElementById("nextBtn").classList.toggle("disabled", gi >= TOTAL - 1);
  }
  document.getElementById("prevBtn").addEventListener("click", function () { if (currentIdx > 0) goTo(currentIdx - 1); });
  document.getElementById("nextBtn").addEventListener("click", function () { if (currentIdx < TOTAL - 1) goTo(currentIdx + 1); });
  setCurrent(0);

  /* track current on scroll */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var gi = +e.target.id.split("-")[1];
          currentIdx = gi; setCurrent(gi);
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    Q.forEach(function (q, gi) { io.observe(document.getElementById("q-" + gi)); });
  }

  /* ════════ TIMER ════════ */
  var remaining = E.meta.minutes * 60;
  var startTotal = remaining;
  var timerEl = document.getElementById("timer");
  var timerBox = document.getElementById("ebTimer");
  var tick = setInterval(function () {
    remaining--;
    if (remaining <= 60) timerBox.classList.add("warn");
    if (remaining <= 0) { remaining = 0; render(); clearInterval(tick); doSubmit(true); }
    render();
    function render() { timerEl.textContent = fmt(remaining); }
  }, 1000);

  /* ════════ SUBMIT + GRADE ════════ */
  document.getElementById("submitTop").addEventListener("click", function () { confirmSubmit(); });
  document.getElementById("submitBottom").addEventListener("click", function () { confirmSubmit(); });

  function confirmSubmit() {
    var n = Object.keys(answers).length;
    if (n < TOTAL) {
      if (!window.confirm("Bạn còn " + (TOTAL - n) + " câu chưa trả lời. Nộp bài luôn?")) return;
    }
    doSubmit(false);
  }

  function doSubmit(timeUp) {
    if (submitted) return;
    submitted = true;
    clearInterval(tick);

    /* score per category */
    var cats = ["lang", "read", "listen"];
    var perCat = {};
    var rawCorrect = 0;
    cats.forEach(function (c) {
      var idxs = byCat[c];
      if (!idxs.length) return;
      var correct = 0;
      idxs.forEach(function (gi) { if (answers[gi] === Q[gi].answer) correct++; });
      rawCorrect += correct;
      var scaled = Math.round(correct / idxs.length * 60);
      perCat[c] = { correct: correct, total: idxs.length, scaled: scaled, pass: scaled >= E.meta.passEach };
    });
    var totalScore = cats.reduce(function (s, c) { return s + (perCat[c] ? perCat[c].scaled : 0); }, 0);
    var allSectionsPass = cats.every(function (c) { return !perCat[c] || perCat[c].pass; });
    var passed = totalScore >= E.meta.passTotal && allSectionsPass;
    var pctPass = Math.round(totalScore / E.meta.passTotal * 100);
    var elapsed = startTotal - remaining;

    var result = { perCat: perCat, totalScore: totalScore, passed: passed, pctPass: pctPass, rawCorrect: rawCorrect, elapsed: elapsed, timeUp: timeUp };

    renderResult(result);
    renderReview();
    renderAI(result);

    /* switch views */
    document.getElementById("examView").style.display = "none";
    document.getElementById("resultView").style.display = "block";
    // exam bar → result mode
    document.getElementById("ebKick").textContent = "Thi thử · " + E.meta.level + " · Đã nộp bài";
    timerBox.style.display = "none";
    document.querySelector(".eb-right").style.display = "none";
    document.getElementById("progFill").style.width = "100%";
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------- render result hero + scorecard ---------- */
  function renderResult(r) {
    // gauge
    var C = 2 * Math.PI * 52; // 326.7
    var frac = Math.min(r.totalScore / 180, 1);
    var bar = document.getElementById("gaugeBar");
    bar.setAttribute("stroke-dasharray", C.toFixed(1));
    bar.setAttribute("stroke-dashoffset", C.toFixed(1));
    var gauge = document.getElementById("gauge");
    if (r.passed) gauge.classList.add("is-pass");
    setTimeout(function () { bar.setAttribute("stroke-dashoffset", (C * (1 - frac)).toFixed(1)); }, 200);
    countUp(document.getElementById("gaugeTotal"), r.totalScore, 1200);

    // verdict
    var v = document.getElementById("verdict");
    v.textContent = r.passed ? "ĐỖ" : "TRƯỢT";
    v.className = "rh-verdict " + (r.passed ? "pass" : "fail");
    document.getElementById("verdictNote").textContent = r.passed
      ? "Chúc mừng! Bạn đã vượt mốc đỗ N3 ở cả tổng điểm lẫn từng phần. Hãy giữ phong độ và thử sức với đề khó hơn."
      : (r.totalScore >= E.meta.passTotal
          ? "Tổng điểm đã đủ, nhưng có phần chưa đạt điểm liệt tối thiểu (19/60). Tập trung gỡ đúng phần yếu là sẽ đỗ."
          : "Chưa đạt mốc đỗ lần này. Đừng nản — bảng phân tích bên dưới chỉ rõ phần cần ưu tiên ôn.");
    document.getElementById("pctPass").textContent = r.pctPass + "%";
    document.getElementById("rawCorrect").textContent = r.rawCorrect + "/" + TOTAL;
    document.getElementById("timeTaken").textContent = fmt(r.elapsed);

    // scorecard rows
    var rowsEl = document.getElementById("scoreRows");
    var cats = ["lang", "read", "listen"];
    var html = "";
    cats.forEach(function (c) {
      var p = r.perCat[c]; if (!p) return;
      var markPct = (E.meta.passEach / 60 * 100);
      var fillPct = (p.scaled / 60 * 100);
      html +=
        '<div class="sc-row">' +
          '<div class="scr-name"><div class="scr-jp">' + CAT[c].jp + '</div><div class="scr-vn">' + CAT[c].name + '</div></div>' +
          '<div class="scr-bar-wrap">' +
            '<div class="scr-bar"><div class="fill ' + (p.pass ? "pass" : "fail") + '" data-w="' + fillPct + '"></div><div class="mark" style="left:' + markPct + '%;"></div></div>' +
            '<div class="scr-meta"><span>0</span><span>điểm liệt ' + E.meta.passEach + '</span><span>60</span></div>' +
          '</div>' +
          '<div class="scr-score"><span class="v">' + p.scaled + '</span><span class="o"> / 60</span>' +
            '<div class="scr-tag ' + (p.pass ? "pass" : "fail") + '">' + (p.pass ? "Đạt" : "Chưa đạt") + '</div>' +
          '</div>' +
        '</div>';
    });
    // total row
    html +=
      '<div class="sc-row total">' +
        '<div class="scr-name"><div class="scr-jp">総合得点</div><div class="scr-vn">Tổng điểm · mốc đỗ ' + E.meta.passTotal + '</div></div>' +
        '<div class="scr-bar-wrap">' +
          '<div class="scr-bar"><div class="fill ' + (r.passed ? "pass" : "fail") + '" data-w="' + (r.totalScore / 180 * 100) + '"></div><div class="mark" style="left:' + (E.meta.passTotal / 180 * 100) + '%;"></div></div>' +
          '<div class="scr-meta"><span>0</span><span>mốc đỗ ' + E.meta.passTotal + '</span><span>180</span></div>' +
        '</div>' +
        '<div class="scr-score"><span class="v total">' + r.totalScore + '</span><span class="o"> / 180</span>' +
          '<div class="scr-tag ' + (r.passed ? "pass" : "fail") + '">' + (r.passed ? "ĐỖ" : "TRƯỢT") + '</div>' +
        '</div>' +
      '</div>';
    rowsEl.innerHTML = html;
    // animate bars
    setTimeout(function () {
      rowsEl.querySelectorAll(".fill").forEach(function (f) { f.style.width = f.dataset.w + "%"; });
    }, 300);
  }

  /* ---------- render review ---------- */
  function renderReview() {
    var listEl = document.getElementById("reviewList");
    var html = "";
    Q.forEach(function (q, gi) {
      var picked = answers[gi];
      var isCorrect = picked === q.answer;
      var n = gi + 1;
      var opts = q.options.map(function (o, oi) {
        var cls = "", tag = "";
        if (oi === q.answer) { cls = " correct"; tag = '<span class="tag">✓ Đáp án đúng</span>'; }
        else if (oi === picked) { cls = " wrong"; tag = '<span class="tag">✗ Bạn chọn</span>'; }
        return '<div class="rev-opt' + cls + '"><span class="k">' + LETTER[oi] + '</span>' +
                 '<span>' + o.jp + (o.vn ? ' <span style="font-family:var(--serif);font-style:italic;color:var(--ink-55);">— ' + o.vn + '</span>' : '') + '</span>' + (tag || '<span></span>') + '</div>';
      }).join("");

      var scriptBlock = q.script
        ? '<p class="rev-ex-text"><span style="font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);">Lời thoại</span><br><span class="jp" style="line-height:1.9;">' + q.script + '</span></p>'
        : "";
      var passageBlock = (q.passage && false) ? "" : ""; // passage already implied in prompt review below

      html +=
        '<div class="rev-item ' + (isCorrect ? "correct" : "wrong") + '" data-correct="' + (isCorrect ? "1" : "0") + '" id="rev-' + gi + '">' +
          '<div class="rev-top">' +
            '<span class="rev-num">' + pad(n) + '</span>' +
            '<span class="rev-status ' + (isCorrect ? "correct" : "wrong") + '">' + (isCorrect ? "Đúng" : (picked === undefined ? "Bỏ trống" : "Sai")) + '</span>' +
            '<span class="rev-cat">' + CAT[q.cat].name + '</span>' +
          '</div>' +
          (q.passage ? '<div class="q-passage" style="margin-bottom:16px;"><p>' + q.passage + '</p></div>' : "") +
          '<div class="rev-prompt">' + stripInstruct(q.prompt) + '</div>' +
          '<div class="rev-opts">' + opts + '</div>' +
          '<div class="rev-explain">' +
            '<div class="ex-ico">解</div>' +
            '<div>' +
              '<div class="rev-ex-lab">Giải thích</div>' +
              '<p class="rev-ex-text">' + q.explain + '</p>' +
              scriptBlock +
              '<div class="rev-trans"><span class="lab">Dịch nghĩa</span>' + q.translate + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    listEl.innerHTML = html;
  }

  /* review filter */
  document.getElementById("filterAll").addEventListener("click", function () { setFilter("all", this); });
  document.getElementById("filterWrong").addEventListener("click", function () { setFilter("wrong", this); });
  function setFilter(mode, btn) {
    document.querySelectorAll(".rev-filter button").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    var items = document.querySelectorAll(".rev-item");
    var anyShown = false;
    items.forEach(function (it) {
      var show = mode === "all" || it.dataset.correct === "0";
      it.style.display = show ? "" : "none";
      if (show) anyShown = true;
    });
    var listEl = document.getElementById("reviewList");
    var empty = document.getElementById("revEmpty");
    if (mode === "wrong" && !anyShown) {
      if (!empty) {
        empty = document.createElement("div");
        empty.id = "revEmpty";
        empty.className = "rev-empty";
        empty.textContent = "Tuyệt vời — bạn không sai câu nào.";
        listEl.appendChild(empty);
      }
      empty.style.display = "";
    } else if (empty) { empty.style.display = "none"; }
  }

  /* ════════ AI ĐỊNH HƯỚNG ════════ */
  // AI ĐỊNH HƯỚNG: gọi Gemini thật qua Cloudflare Worker, fallback logic tĩnh.
  var AI_ENDPOINT = "https://trilu.edu.vn/api/thi-thu-feedback";
  function renderAI(r) {
    var done = false;
    var fb = setTimeout(function () { if (!done) { done = true; fillAI(r); } }, 9000);
    var payload = {
      level: E.meta.level, term: E.meta.term,
      totalScore: r.totalScore, passTotal: E.meta.passTotal, passEach: E.meta.passEach,
      passed: r.passed, rawCorrect: r.rawCorrect, total: TOTAL,
      perCat: r.perCat
    };
    try {
      fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error("bad")); })
      .then(function (d) {
        if (done) return; done = true; clearTimeout(fb);
        if (d && (d.diag || d.plan)) fillAI(r, d); else fillAI(r);
      })
      .catch(function () { if (done) return; done = true; clearTimeout(fb); fillAI(r); });
    } catch (e) { if (!done) { done = true; clearTimeout(fb); fillAI(r); } }
  }

  function fillAI(r, ai) {
    ai = ai || null;
    var cats = ["lang", "read", "listen"];
    // weakest section by scaled score
    var weakest = null;
    cats.forEach(function (c) {
      if (!r.perCat[c]) return;
      if (!weakest || r.perCat[c].scaled < r.perCat[weakest].scaled) weakest = c;
    });
    var strongest = null;
    cats.forEach(function (c) {
      if (!r.perCat[c]) return;
      if (!strongest || r.perCat[c].scaled > r.perCat[strongest].scaled) strongest = c;
    });

    var diag = ai && ai.diag ? ai.diag : (r.passed
      ? "Bài làm cho thấy nền tảng N3 của bạn đã vững: tổng " + r.totalScore + "/180, vượt mốc đỗ " + E.meta.passTotal + ". Điểm mạnh rõ nhất là phần " + CAT[strongest].name + "."
      : "Tổng điểm lần này là " + r.totalScore + "/180" + (r.totalScore >= E.meta.passTotal ? ", đủ mốc nhưng vướng điểm liệt ở một phần" : ", còn cách mốc đỗ " + (E.meta.passTotal - r.totalScore) + " điểm") + ". Phần cần ưu tiên nhất là " + CAT[weakest].name + " (" + r.perCat[weakest].scaled + "/60).");

    var plan = ai && ai.plan ? ai.plan : (weakest === "lang"
      ? "Mỗi ngày dành 20 phút ôn 15 từ vựng N3 theo chủ đề và 2 mẫu ngữ pháp, làm lại ngay phần ‘Sửa đề’ phía dưới để ghi nhớ lỗi sai."
      : weakest === "read"
        ? "Luyện đọc 1 đoạn ngắn mỗi ngày, tập gạch từ khoá và trả lời trong 90 giây/câu để quen áp lực thời gian."
        : "Nghe 1 hội thoại " + E.meta.level + " mỗi ngày, nghe 2 lần rồi đối chiếu lời thoại trong phần ‘Sửa đề’ để bắt được từ khoá quyết định đáp án.");

    var focusChips = [];
    cats.forEach(function (c) {
      if (r.perCat[c] && !r.perCat[c].pass) focusChips.push(CAT[c].name);
    });
    if (ai && ai.focus && ai.focus.length) focusChips = ai.focus.slice(0,4);
    if (!focusChips.length) focusChips.push("Duy trì phong độ", "Thử đề khó hơn");

    var html =
      '<div class="ai-body">' +
        '<div class="ai-block"><div class="ai-block-lab">Chẩn đoán</div><p>' + diag + '</p></div>' +
        '<div class="ai-block"><div class="ai-block-lab">Gợi ý 7 ngày tới</div><p>' + plan + '</p></div>' +
        '<div class="ai-block"><div class="ai-block-lab">Ưu tiên ôn</div><div class="ai-focus">' +
          focusChips.map(function (f) { return '<span class="ai-chip">' + f + '</span>'; }).join("") +
        '</div></div>' +
      '</div>' +
      '<a class="ai-cta" href="../../n3.html">Mở lộ trình ôn tập <span>→</span></a>';

    var content = document.getElementById("aiContent");
    content.style.opacity = "0";
    content.innerHTML = html;
    requestAnimationFrame(function () {
      content.style.transition = "opacity .6s ease";
      content.style.opacity = "1";
    });
  }

  /* ════════ helpers ════════ */
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmt(s) { var m = Math.floor(s / 60), ss = s % 60; return pad(m) + ":" + pad(ss); }
  function waveBars() {
    var h = [10, 18, 26, 14, 22, 8, 16, 24, 12, 20, 28, 10, 18, 14, 22, 9, 17, 25, 13, 19];
    return h.map(function (v) { return '<span style="height:' + v + 'px;"></span>'; }).join("");
  }
  function animateWave(wave) {
    if (!wave.classList.contains("playing")) return;
    var spans = wave.querySelectorAll("span");
    var iv = setInterval(function () {
      if (!wave.classList.contains("playing")) { clearInterval(iv); return; }
      spans.forEach(function (s) { s.style.height = (6 + Math.random() * 22) + "px"; });
    }, 160);
  }
  function stripInstruct(html) {
    // remove the leading "Chọn ... :" lead line before the JP sentence for review compactness
    return html;
  }
  function countUp(el, target, dur) {
    var start = 0, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.round(start + (target - start) * easeOut(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    // guarantee final value even if rAF is throttled (background/offscreen tab)
    setTimeout(function () { el.textContent = target; }, dur + 100);
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* reveal for result sections */
  document.addEventListener("click", function () {}, false);
})();

/* ────────────────────────────────────────────────────────────
   GHI CHÚ TÍCH HỢP AI THẬT
   Trong fillAI(), thay phần setTimeout bằng lời gọi mô hình của bạn.
   Ví dụ (nếu môi trường có window.claude.complete):

   async function renderAI(r){
     const prompt = `Học viên vừa thi thử JLPT ${E.meta.level}.
       Tổng ${r.totalScore}/180. Chi tiết: ${JSON.stringify(r.perCat)}.
       Viết nhận xét tiếng Việt: chẩn đoán, kế hoạch 7 ngày, 2-3 phần cần ưu tiên.`;
     const txt = await window.claude.complete(prompt);
     // parse rồi đổ vào #aiContent
   }
   ──────────────────────────────────────────────────────────── */
