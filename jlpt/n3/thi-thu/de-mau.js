/* ════════════════════════════════════════════════════════════
   Trí Lữ Nihongo — Thi thử N3 · Dữ liệu đề
   Mọi câu tiếng Nhật dùng <ruby>漢字<rt>かな</rt></ruby> để hiển thị furigana.
   cat: 'lang' (言語知識 文字・語彙・文法) · 'read' (読解) · 'listen' (聴解)
   Mỗi cat quy đổi về thang 0–60. answer = chỉ số đáp án đúng (0-based).
   ════════════════════════════════════════════════════════════ */

window.EXAM = {
  meta: {
    level: "N3",
    term: "Tháng 7 · 2025",
    minutes: 40,            // thời lượng demo (đếm ngược)
    passEach: 19,           // điểm liệt mỗi phần
    passTotal: 95           // mốc đỗ tổng
  },

  sections: [
    {
      id: "lang",
      kick: "Phần 1 · 言語知識",
      title: "Ngôn ngữ — Từ vựng · Hán tự · Ngữ pháp",
      sub: "Chọn đáp án đúng nhất cho mỗi câu. Phần này quy đổi về thang 0–60 điểm."
    },
    {
      id: "read",
      kick: "Phần 2 · 読解",
      title: "Đọc hiểu",
      sub: "Đọc kỹ đoạn văn rồi chọn đáp án đúng. Phần này quy đổi về thang 0–60 điểm."
    },
    {
      id: "listen",
      kick: "Phần 3 · 聴解",
      title: "Nghe hiểu",
      sub: "Nghe đoạn hội thoại (bấm ▶) rồi chọn đáp án đúng. Phần này quy đổi về thang 0–60 điểm."
    }
  ],

  questions: [
    /* ───── 言語知識 ───── */
    {
      cat: "lang",
      instruct: "Cách đọc · 読み方",
      prompt: 'Chọn cách đọc đúng của từ <span class="ul">約束</span> trong câu:<br><span class="jp"><ruby>友達<rt>ともだち</rt></ruby>との<span class="ul">約束</span>を<ruby>守<rt>まも</rt></ruby>る。</span>',
      options: [
        { jp: "やくそく" },
        { jp: "やくぞく" },
        { jp: "やくそぐ" },
        { jp: "わくそく" }
      ],
      answer: 0,
      explain: "約 đọc âm On là「やく」, 束 đọc âm On là「そく」. Ghép lại thành「やくそく」(ước thúc) — nghĩa là lời hứa, lời hẹn.",
      translate: "Giữ lời hứa với bạn bè."
    },
    {
      cat: "lang",
      instruct: "Từ vựng · 語彙",
      prompt: 'Chọn từ thích hợp điền vào chỗ trống:<br><span class="jp"><ruby>時間<rt>じかん</rt></ruby>に<span class="blank">　　　</span>から、<ruby>急<rt>いそ</rt></ruby>ぎましょう。</span>',
      options: [
        { jp: "<ruby>遅<rt>おく</rt></ruby>れる", vn: "muộn, trễ" },
        { jp: "<ruby>進<rt>すす</rt></ruby>む", vn: "tiến tới" },
        { jp: "<ruby>始<rt>はじ</rt></ruby>める", vn: "bắt đầu" },
        { jp: "<ruby>覚<rt>おぼ</rt></ruby>える", vn: "ghi nhớ" }
      ],
      answer: 0,
      explain: "Vế sau là「急ぎましょう」(hãy nhanh lên), nên vế trước phải mang nghĩa “sắp muộn giờ”. 「遅れる」= bị muộn, trễ giờ là hợp lý nhất.",
      translate: "Sắp muộn giờ rồi, chúng ta nhanh lên thôi."
    },
    {
      cat: "lang",
      instruct: "Ngữ pháp · 文法",
      prompt: 'Chọn dạng đúng điền vào chỗ trống:<br><span class="jp"><ruby>雨<rt>あめ</rt></ruby>が<span class="blank">　　　</span>、<ruby>試合<rt>しあい</rt></ruby>は<ruby>中止<rt>ちゅうし</rt></ruby>です。</span>',
      options: [
        { jp: "<ruby>降<rt>ふ</rt></ruby>ると", vn: "cứ mưa là…" },
        { jp: "<ruby>降<rt>ふ</rt></ruby>るので", vn: "vì mưa nên…" },
        { jp: "<ruby>降<rt>ふ</rt></ruby>っても", vn: "dù mưa cũng…" },
        { jp: "<ruby>降<rt>ふ</rt></ruby>るのに", vn: "mưa mà lại…" }
      ],
      answer: 0,
      explain: "「～と」diễn tả quan hệ tất yếu/điều kiện tự nhiên: hễ A xảy ra thì B luôn xảy ra. Ở đây “cứ mưa là trận đấu bị huỷ” nên dùng「降ると」.",
      translate: "Cứ mưa là trận đấu sẽ bị huỷ."
    },
    {
      cat: "lang",
      instruct: "Kính ngữ · 敬語",
      prompt: 'Chọn cách nói kính ngữ đúng:<br><span class="jp"><ruby>社長<rt>しゃちょう</rt></ruby>が そう<span class="blank">　　　</span>。</span>',
      options: [
        { jp: "おっしゃいました", vn: "đã nói (tôn kính)" },
        { jp: "<ruby>申<rt>もう</rt></ruby>しました", vn: "đã nói (khiêm nhường)" },
        { jp: "<ruby>言<rt>い</rt></ruby>いました", vn: "đã nói (thường)" },
        { jp: "<ruby>話<rt>はな</rt></ruby>しました", vn: "đã trò chuyện" }
      ],
      answer: 0,
      explain: "Chủ ngữ là「社長」(giám đốc) — người trên, nên động từ “nói” phải dùng tôn kính ngữ「おっしゃる」.「申す」là khiêm nhường ngữ, chỉ dùng cho bản thân.",
      translate: "Giám đốc đã nói như vậy."
    },

    /* ───── 読解 ───── */
    {
      cat: "read",
      instruct: "Đọc hiểu · 読解",
      passage: '<ruby>図書館<rt>としょかん</rt></ruby>からのお<ruby>知<rt>し</rt></ruby>らせ<br>　６<ruby>月<rt>がつ</rt></ruby>１５<ruby>日<rt>にち</rt></ruby>から２０<ruby>日<rt>にち</rt></ruby>まで、<ruby>工事<rt>こうじ</rt></ruby>のため<ruby>休<rt>やす</rt></ruby>みます。<ruby>本<rt>ほん</rt></ruby>を<ruby>借<rt>か</rt></ruby>りたい<ruby>方<rt>かた</rt></ruby>は１４<ruby>日<rt>にち</rt></ruby>までにおこしください。',
      prompt: 'Theo thông báo, người muốn mượn sách nên đến thư viện chậm nhất ngày nào?',
      options: [
        { jp: "６月１４日", vn: "ngày 14/6" },
        { jp: "６月１５日", vn: "ngày 15/6" },
        { jp: "６月２０日", vn: "ngày 20/6" },
        { jp: "６月２１日", vn: "ngày 21/6" }
      ],
      answer: 0,
      explain: "Thông báo viết「14日までにおこしください」— hãy đến trước (chậm nhất) ngày 14. Thư viện đóng cửa từ 15 đến 20 để thi công, nên phải mượn sách xong trước ngày 14.",
      translate: "Thông báo từ thư viện: Từ 15 đến 20/6, đóng cửa để thi công. Ai muốn mượn sách xin đến trước ngày 14."
    },
    {
      cat: "read",
      instruct: "Đọc hiểu · 読解",
      passage: '<ruby>私<rt>わたし</rt></ruby>は<ruby>毎朝<rt>まいあさ</rt></ruby><ruby>走<rt>はし</rt></ruby>っています。<ruby>最初<rt>さいしょ</rt></ruby>は１キロも<ruby>大変<rt>たいへん</rt></ruby>でしたが、<ruby>今<rt>いま</rt></ruby>は５キロ<ruby>走<rt>はし</rt></ruby>れるようになりました。<ruby>体<rt>からだ</rt></ruby>も<ruby>軽<rt>かる</rt></ruby>くなって、<ruby>気持<rt>きも</rt></ruby>ちがいいです。',
      prompt: 'Người viết muốn nói điều gì?',
      options: [
        { jp: "<ruby>走<rt>はし</rt></ruby>るのが<ruby>上手<rt>じょうず</rt></ruby>になった", vn: "đã chạy giỏi/khoẻ hơn" },
        { jp: "<ruby>走<rt>はし</rt></ruby>るのをやめたい", vn: "muốn bỏ chạy bộ" },
        { jp: "５キロは<ruby>遠<rt>とお</rt></ruby>すぎる", vn: "5km là quá xa" },
        { jp: "<ruby>朝<rt>あさ</rt></ruby>は<ruby>走<rt>はし</rt></ruby>りたくない", vn: "không muốn chạy buổi sáng" }
      ],
      answer: 0,
      explain: "Ban đầu 1km đã thấy vất vả, nay chạy được 5km, cơ thể nhẹ nhõm và thấy sảng khoái → ý chính là người viết đã tiến bộ, khoẻ hơn nhờ chạy bộ.",
      translate: "Sáng nào tôi cũng chạy. Lúc đầu 1km đã thấy vất vả, giờ đã chạy được 5km. Cơ thể nhẹ nhõm, tinh thần sảng khoái."
    },
    {
      cat: "read",
      instruct: "Đọc hiểu · 読解",
      passage: 'メール：<ruby>明日<rt>あした</rt></ruby>の<ruby>会議<rt>かいぎ</rt></ruby>は１０<ruby>時<rt>じ</rt></ruby>からですが、<ruby>資料<rt>しりょう</rt></ruby>の<ruby>準備<rt>じゅんび</rt></ruby>があるので、９<ruby>時半<rt>じはん</rt></ruby>に<ruby>来<rt>き</rt></ruby>てください。',
      prompt: 'Người nhận mail nên đến lúc mấy giờ?',
      options: [
        { jp: "９<ruby>時半<rt>じはん</rt></ruby>", vn: "9 giờ rưỡi" },
        { jp: "１０<ruby>時<rt>じ</rt></ruby>", vn: "10 giờ" },
        { jp: "１０<ruby>時半<rt>じはん</rt></ruby>", vn: "10 giờ rưỡi" },
        { jp: "９<ruby>時<rt>じ</rt></ruby>", vn: "9 giờ" }
      ],
      answer: 0,
      explain: "Cuộc họp bắt đầu lúc 10 giờ, nhưng vì cần chuẩn bị tài liệu nên người gửi yêu cầu đến sớm lúc「９時半」(9 giờ rưỡi).",
      translate: "Email: Cuộc họp ngày mai bắt đầu lúc 10 giờ, nhưng cần chuẩn bị tài liệu nên hãy đến lúc 9 giờ rưỡi."
    },

    /* ───── 聴解 ───── */
    {
      cat: "listen",
      instruct: "Nghe hiểu · 聴解",
      audio: { dur: "0:18" },
      prompt: 'Nghe đoạn hội thoại và chọn: Cuối tuần này hai người sẽ làm gì?',
      script: '<ruby>男<rt>おとこ</rt></ruby>：<ruby>週末<rt>しゅうまつ</rt></ruby>、<ruby>映画<rt>えいが</rt></ruby>を<ruby>見<rt>み</rt></ruby>に<ruby>行<rt>い</rt></ruby>かない？<br><ruby>女<rt>おんな</rt></ruby>：いいね。でも<ruby>天気<rt>てんき</rt></ruby>がよかったら<ruby>海<rt>うみ</rt></ruby>もいいなあ。<br><ruby>男<rt>おとこ</rt></ruby>：じゃあ、<ruby>晴<rt>は</rt></ruby>れたら<ruby>海<rt>うみ</rt></ruby>、<ruby>雨<rt>あめ</rt></ruby>なら<ruby>映画<rt>えいが</rt></ruby>にしよう。',
      options: [
        { jp: "<ruby>晴<rt>は</rt></ruby>れたら<ruby>海<rt>うみ</rt></ruby>へ<ruby>行<rt>い</rt></ruby>く", vn: "nắng thì đi biển" },
        { jp: "<ruby>必<rt>かなら</rt></ruby>ず<ruby>映画<rt>えいが</rt></ruby>を<ruby>見<rt>み</rt></ruby>る", vn: "nhất định xem phim" },
        { jp: "<ruby>海<rt>うみ</rt></ruby>には<ruby>行<rt>い</rt></ruby>かない", vn: "không đi biển" },
        { jp: "<ruby>何<rt>なに</rt></ruby>もしない", vn: "không làm gì" }
      ],
      answer: 0,
      explain: "Người nam chốt lại:「晴れたら海、雨なら映画」— nếu trời nắng thì đi biển, nếu mưa thì xem phim. Vì câu hỏi hỏi kế hoạch, đáp án có điều kiện “nắng thì đi biển” là đúng.",
      translate: "Nam: Cuối tuần đi xem phim không? — Nữ: Hay đấy. Nhưng trời đẹp thì đi biển cũng thích. — Nam: Vậy nắng thì đi biển, mưa thì xem phim nhé."
    },
    {
      cat: "listen",
      instruct: "Nghe hiểu · 聴解",
      audio: { dur: "0:15" },
      prompt: 'Nghe đoạn hội thoại và chọn: Người phụ nữ quên mang gì?',
      script: '<ruby>女<rt>おんな</rt></ruby>：あ、<ruby>大変<rt>たいへん</rt></ruby>！<ruby>傘<rt>かさ</rt></ruby>を<ruby>電車<rt>でんしゃ</rt></ruby>に<ruby>忘<rt>わす</rt></ruby>れちゃった。<br><ruby>男<rt>おとこ</rt></ruby>：<ruby>財布<rt>さいふ</rt></ruby>は？<br><ruby>女<rt>おんな</rt></ruby>：<ruby>財布<rt>さいふ</rt></ruby>とスマホは<ruby>大丈夫<rt>だいじょうぶ</rt></ruby>。<ruby>傘<rt>かさ</rt></ruby>だけ。',
      options: [
        { jp: "<ruby>傘<rt>かさ</rt></ruby>", vn: "cái ô" },
        { jp: "<ruby>財布<rt>さいふ</rt></ruby>", vn: "cái ví" },
        { jp: "スマホ", vn: "điện thoại" },
        { jp: "<ruby>鞄<rt>かばん</rt></ruby>", vn: "cái cặp" }
      ],
      answer: 0,
      explain: "Người nữ nói để quên「傘」(ô) trên tàu, còn xác nhận ví và điện thoại vẫn ổn「財布とスマホは大丈夫。傘だけ」— chỉ mỗi cái ô.",
      translate: "Nữ: Ôi chết, tôi để quên ô trên tàu rồi. — Nam: Thế còn ví? — Nữ: Ví với điện thoại thì không sao. Chỉ mỗi cái ô thôi."
    }
  ]
};
