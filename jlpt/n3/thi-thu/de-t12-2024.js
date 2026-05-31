/* ════════════════════════════════════════════════════════════
   Trí Lữ Nihongo — Thi thử JLPT N3 · Tháng 12 · 2024 (đề thật số hoá)
   Nguồn: đề chính thức 12/2024. Đã lọc bỏ watermark nguồn.
   Furigana: <ruby>漢字<rt>かな</rt></ruby>. answer = chỉ số đáp án đúng (0-based).
   pts = điểm/câu theo Cẩm nang Trí Lữ (N3): 言語知識 1đ; 文法 đoạn văn 1.75đ;
         読解 đoản 3.5đ · trung 4đ · trường 4đ · tìm tin 3đ.
   ⚠ ĐANG SỐ HOÁ DẦN — hiện có: 言語知識 Mondai 1. (sẽ bổ sung tiếp)
   ════════════════════════════════════════════════════════════ */
window.EXAM = {
  meta: {
    level: "N3",
    term: "Tháng 12 · 2024",
    minutes: 140,
    passEach: 19,
    passTotal: 95
  },

  sections: [
    { id: "lang",   kick: "言語知識（文字・語彙・文法）", title: "Ngôn ngữ — Chữ Hán · Từ vựng · Ngữ pháp", sub: "Chọn đáp án đúng nhất cho mỗi câu. Phần này thang 0–60 điểm (điểm liệt 19).", max: 60, pass: 19 },
    { id: "read",   kick: "読解", title: "Đọc hiểu", sub: "Đọc kỹ đoạn văn rồi chọn đáp án đúng. Phần này thang 0–60 điểm (điểm liệt 19).", max: 60, pass: 19 },
    { id: "listen", kick: "聴解", title: "Nghe hiểu", sub: "Nghe đoạn hội thoại (bấm ▶) rồi chọn đáp án đúng. Phần này thang 0–60 điểm (điểm liệt 19).", max: 60, pass: 19 }
  ],

  questions: [
    /* ═══════ 言語知識 · 問題1 — Đọc chữ Hán (8 câu, 1đ/câu) ═══════ */
    {
      cat: "lang", instruct: "問題1 · Cách đọc chữ Hán", pts: 1,
      prompt: '<ruby>山田<rt>やまだ</rt></ruby>さんがちらしを<u>配った</u>。',
      options: [{ jp: "ひろった" }, { jp: "くばった" }, { jp: "やぶった" }, { jp: "はった" }],
      answer: 1,
      explain: "「配る」đọc là「くばる」, thể quá khứ「くばった」— nghĩa là phân phát, phát ra. Phân biệt: 拾う(ひろう) nhặt · 破る(やぶる) xé rách · 貼る(はる) dán.",
      translate: "Anh Yamada đã phát tờ rơi."
    },
    {
      cat: "lang", instruct: "問題1 · Cách đọc chữ Hán", pts: 1,
      prompt: '<ruby>私<rt>わたし</rt></ruby>の<ruby>国<rt>くに</rt></ruby>は<u>石油</u>を<ruby>輸入<rt>ゆにゅう</rt></ruby>しています。',
      options: [{ jp: "いしゆ" }, { jp: "せきう" }, { jp: "せきゆ" }, { jp: "いしう" }],
      answer: 2,
      explain: "「石油」đọc là「せきゆ」(thạch du = dầu mỏ). 石 âm On「せき」, 油 âm On「ゆ」.",
      translate: "Nước tôi nhập khẩu dầu mỏ."
    },
    {
      cat: "lang", instruct: "問題1 · Cách đọc chữ Hán", pts: 1,
      prompt: '<ruby>卒業式<rt>そつぎょうしき</rt></ruby>には<ruby>生徒<rt>せいと</rt></ruby>の<u>父母</u>もたくさん<ruby>来<rt>き</rt></ruby>ていた。',
      options: [{ jp: "ふば" }, { jp: "ふぼ" }, { jp: "ふうほ" }, { jp: "ふうば" }],
      answer: 1,
      explain: "「父母」đọc là「ふぼ」(phụ mẫu = cha mẹ). 父「ふ」, 母「ぼ」— đều âm ngắn, không trường âm.",
      translate: "Lễ tốt nghiệp có rất nhiều phụ huynh của học sinh đến dự."
    },
    {
      cat: "lang", instruct: "問題1 · Cách đọc chữ Hán", pts: 1,
      prompt: 'この<ruby>町<rt>まち</rt></ruby>の<u>主要</u>な<ruby>産業<rt>さんぎょう</rt></ruby>は<ruby>何<rt>なん</rt></ruby>ですか。',
      options: [{ jp: "じゅうおう" }, { jp: "しゅおう" }, { jp: "じゅうよう" }, { jp: "しゅよう" }],
      answer: 3,
      explain: "「主要」đọc là「しゅよう」(chủ yếu). 主「しゅ」, 要「よう」. Cảnh giác âm đục/âm trường gây nhiễu.",
      translate: "Ngành công nghiệp chủ yếu của thị trấn này là gì?"
    },
    {
      cat: "lang", instruct: "問題1 · Cách đọc chữ Hán", pts: 1,
      prompt: 'これは<u>加熱</u>して<ruby>食<rt>た</rt></ruby>べてください。',
      options: [{ jp: "かねつ" }, { jp: "かあつ" }, { jp: "かいねつ" }, { jp: "かいあつ" }],
      answer: 0,
      explain: "「加熱」đọc là「かねつ」(gia nhiệt = làm nóng). 加「か」, 熱「ねつ」.",
      translate: "Cái này hãy làm nóng rồi hãy ăn."
    },
    {
      cat: "lang", instruct: "問題1 · Cách đọc chữ Hán", pts: 1,
      prompt: '<ruby>川<rt>かわ</rt></ruby>はあの<ruby>辺<rt>あた</rt></ruby>りで<u>深く</u>なっている。',
      options: [{ jp: "ふかく" }, { jp: "あさく" }, { jp: "ひろく" }, { jp: "せまく" }],
      answer: 0,
      explain: "「深く」đọc là「ふかく」(sâu). Phân biệt: 浅い(あさい) nông · 広い(ひろい) rộng · 狭い(せまい) hẹp.",
      translate: "Con sông trở nên sâu ở khu vực đằng kia."
    },
    {
      cat: "lang", instruct: "問題1 · Cách đọc chữ Hán", pts: 1,
      prompt: '<ruby>文句<rt>もんく</rt></ruby>を<ruby>言<rt>い</rt></ruby>われたので、つい<u>感情的</u>になってしまった。',
      options: [{ jp: "がんじょうてき" }, { jp: "かんしょうてき" }, { jp: "かんじょうてき" }, { jp: "がんしょうてき" }],
      answer: 2,
      explain: "「感情的」đọc là「かんじょうてき」(mang tính cảm xúc). 感「かん」(thanh), 情「じょう」(đục). Bẫy ở chỗ thanh/đục của か và し/じ.",
      translate: "Vì bị phàn nàn nên tôi đã lỡ trở nên cảm tính."
    },
    {
      cat: "lang", instruct: "問題1 · Cách đọc chữ Hán", pts: 1,
      prompt: 'これは<u>残さないで</u>ください。',
      options: [{ jp: "なくさないで" }, { jp: "よごさないで" }, { jp: "こぼさないで" }, { jp: "のこさないで" }],
      answer: 3,
      explain: "「残す」đọc là「のこす」(để lại, để thừa), thể phủ định「のこさないで」. Phân biệt: 無くす(なくす) làm mất · 汚す(よごす) làm bẩn · こぼす làm đổ.",
      translate: "Cái này xin đừng để thừa lại (hãy ăn hết)."
    },

    /* ═══════ 言語知識 · 問題2 — Cách viết Kanji (6 câu, 1đ/câu) ═══════ */
    {
      cat: "lang", instruct: "問題2 · Cách viết chữ Hán", pts: 1,
      prompt: 'ここから<u>じゅんばん</u>に<ruby>見<rt>み</rt></ruby>てください。',
      options: [{ jp: "順番" }, { jp: "項番" }, { jp: "順審" }, { jp: "項審" }],
      answer: 0,
      explain: "「じゅんばん」viết là「順番」(thứ tự). 順 (thuận) + 番 (phiên/số). Cảnh giác chữ gần giống 項・審.",
      translate: "Hãy xem theo thứ tự từ đây."
    },
    {
      cat: "lang", instruct: "問題2 · Cách viết chữ Hán", pts: 1,
      prompt: '<ruby>父<rt>ちち</rt></ruby>は<ruby>銀行<rt>ぎんこう</rt></ruby>に<u>つとめて</u>います。',
      options: [{ jp: "勤めて" }, { jp: "働めて" }, { jp: "仕めて" }, { jp: "労めて" }],
      answer: 0,
      explain: "「つとめる」(làm việc tại cơ quan) viết là「勤める」. Phân biệt: 働く(はたらく) lao động · 努める(つとめる) cố gắng.",
      translate: "Bố tôi làm việc ở ngân hàng."
    },
    {
      cat: "lang", instruct: "問題2 · Cách viết chữ Hán", pts: 1,
      prompt: 'ポケットが<u>さゆう</u>にあるんですね。',
      options: [{ jp: "裏表" }, { jp: "右左" }, { jp: "表裏" }, { jp: "左右" }],
      answer: 3,
      explain: "「さゆう」viết là「左右」(trái phải) — đúng thứ tự 左 (trái) trước, 右 (phải) sau.",
      translate: "Túi áo có ở cả hai bên trái phải nhỉ."
    },
    {
      cat: "lang", instruct: "問題2 · Cách viết chữ Hán", pts: 1,
      prompt: '<ruby>昨日<rt>きのう</rt></ruby>の<ruby>試合<rt>しあい</rt></ruby>は<u>まけて</u>しまいました。',
      options: [{ jp: "退けて" }, { jp: "負けて" }, { jp: "失けて" }, { jp: "欠けて" }],
      answer: 1,
      explain: "「まける」(thua) viết là「負ける」. Phân biệt: 退ける(しりぞける) đẩy lui · 欠ける(かける) thiếu, sứt.",
      translate: "Trận đấu hôm qua đã thua mất rồi."
    },
    {
      cat: "lang", instruct: "問題2 · Cách viết chữ Hán", pts: 1,
      prompt: '<u>かこ</u>の<ruby>例<rt>れい</rt></ruby>も<ruby>調<rt>しら</rt></ruby>べてみましょう。',
      options: [{ jp: "適去" }, { jp: "過古" }, { jp: "過去" }, { jp: "適古" }],
      answer: 2,
      explain: "「かこ」viết là「過去」(quá khứ). 過 (qua) + 去 (đi). Cảnh giác chữ nhiễu 適・古.",
      translate: "Hãy thử tra cứu cả những ví dụ trong quá khứ."
    },
    {
      cat: "lang", instruct: "問題2 · Cách viết chữ Hán", pts: 1,
      prompt: 'この<ruby>資料<rt>しりょう</rt></ruby>はページが<u>ぎゃく</u>になっていますよ。',
      options: [{ jp: "違" }, { jp: "変" }, { jp: "逆" }, { jp: "別" }],
      answer: 2,
      explain: "「ぎゃく」viết là「逆」(ngược, đảo). Phân biệt: 違(ちが)う khác · 変(へん) lạ · 別(べつ) riêng.",
      translate: "Tài liệu này bị ngược trang (lộn trang) đấy."
    }
    /* … 問題3–5 (文字・語彙), 文法, 読解, 聴解 sẽ bổ sung tiếp … */
  ]
};
