/* Maths with Rex – the first "School" game, for Greek primary grades Β' and Γ' (ages ~7–9).
 * 10 multiple-choice questions per level. A wrong answer can be tried again; after two wrong
 * tries the right answer is shown with a short explanation. The score (right first time) is
 * shown at the end.
 *
 *   easy   = Β' Δημοτικού: + and − within 100, times tables 2,3,4,5,10, half/double, word problems
 *   medium = Γ' Δημοτικού: carrying, all tables, division, simple fractions of a number, missing numbers
 *   hard   = Γ' challenge: 3-digit numbers, 2-digit × 1-digit, any fraction n/d of a number, word problems */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;

  A.TILES.math = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<rect x="8" y="8" width="104" height="70" rx="10" fill="#2f5d50" stroke="#a16207" stroke-width="5"/>' +
    '<g fill="#fff" font-family="sans-serif" font-weight="bold" text-anchor="middle">' +
    '<text x="34" y="34" font-size="15">3</text><rect x="27" y="38" width="14" height="2.5"/><text x="34" y="54" font-size="15">4</text>' +
    '<text x="70" y="49" font-size="17">× ÷ +</text></g>' +
    '<rect x="20" y="78" width="80" height="6" rx="3" fill="#a16207"/>' +
    '<svg x="68" y="52" width="48" height="43" viewBox="0 0 200 180">' + A.dinoInner('trex') + '</svg></svg>';

  /* ---------- texts (Greek / English) ---------- */
  var T = {
    el: {
      howMuch: 'Πόσο κάνει', isWhat: 'Πόσο είναι', of: 'του', half: 'το μισό του', double: 'το διπλάσιο του',
      missing: 'Ποιος αριθμός λείπει;',
      plus: 'συν', minus: 'μείον', times: 'επί', div: 'διά', box: 'πόσο', equals: 'ίσον',
      ordS: { 2: 'δεύτερο', 3: 'τρίτο', 4: 'τέταρτο', 5: 'πέμπτο', 6: 'έκτο', 7: 'έβδομο', 8: 'όγδοο', 9: 'ένατο', 10: 'δέκατο' },
      ordP: { 2: 'δεύτερα', 3: 'τρίτα', 4: 'τέταρτα', 5: 'πέμπτα', 6: 'έκτα', 7: 'έβδομα', 8: 'όγδοα', 9: 'ένατα', 10: 'δέκατα' },
      w: {
        add: 'Στη λίμνη πίνουν νερό {a} δεινόσαυροι και έρχονται άλλοι {b}. Πόσοι δεινόσαυροι είναι τώρα;',
        sub: 'Ο Βροντόσαυρος είχε {a} φύλλα και έφαγε τα {b}. Πόσα φύλλα του έμειναν;',
        mul: 'Σε κάθε φωλιά υπάρχουν {a} αυγά. Πόσα αυγά έχουν {b} φωλιές;',
        div: 'Ο Ρεξ μοιράζει {N} καρύδες εξίσου σε {a} φίλους. Πόσες καρύδες παίρνει ο καθένας;',
        frac: 'Ο Ρεξ μάζεψε {N} μούρα και έφαγε {F}. Πόσα μούρα έφαγε;'
      },
      fracArt: function (n) { return n === 1 ? 'το' : 'τα'; },
      score: 'Σωστές με την πρώτη: {s} από {n}',
      next: 'Επόμενη',
      inst: 'Διάλεξε τη σωστή απάντηση!'
    },
    en: {
      howMuch: 'What is', isWhat: 'What is', of: 'of', half: 'half of', double: 'double',
      missing: 'Which number is missing?',
      plus: 'plus', minus: 'minus', times: 'times', div: 'divided by', box: 'what number', equals: 'equals',
      ordS: { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth' },
      ordP: { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths' },
      w: {
        add: '{a} dinosaurs are drinking at the lake and {b} more arrive. How many dinosaurs are there now?',
        sub: 'The Brontosaurus had {a} leaves and ate {b} of them. How many leaves are left?',
        mul: 'Each nest has {a} eggs. How many eggs are there in {b} nests?',
        div: 'Rex shares {N} coconuts equally between {a} friends. How many coconuts does each friend get?',
        frac: 'Rex picked {N} berries and ate {F} of them. How many berries did he eat?'
      },
      fracArt: function () { return ''; },
      score: 'Right first time: {s} out of {n}',
      next: 'Next',
      inst: 'Choose the right answer!'
    }
  };

  function fill(s, v) { return s.replace(/\{(\w+)\}/g, function (m, k) { return v[k]; }); }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function fracHtml(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }

  D.games.math = {
    id: 'math', color: '#0288d1', dark: '#01579b', cat: 'school',
    levelNames: ['grade2', 'grade3', 'grade3plus'],

    start: function (ctx) {
      var L = T[D.i18n.lang] || T.en;
      var N_Q = 10;
      var rand = ctx.rand;
      var stage = ctx.stage;
      var qn = 0, firstTry = 0, tries, q, lock, seen = {};
      var QM = D.i18n.lang === 'el' ? ';' : '?'; // the Greek question mark is ;

      /* ---- speech helpers ---- */
      function sayFrac(n, d) {
        if (D.i18n.lang === 'el') {
          if (n === 1 && d === 2) return 'το μισό';
          return L.fracArt(n) + ' ' + D.i18n.number(n) + ' ' + (n === 1 ? L.ordS[d] : L.ordP[d]);
        }
        if (n === 1 && d === 2) return 'half';
        return D.i18n.number(n) + ' ' + (n === 1 ? L.ordS[d] : L.ordP[d]);
      }
      function sayOp(s) {
        return s.replace(/×/g, ' ' + L.times + ' ').replace(/:/g, ' ' + L.div + ' ').replace(/\+/g, ' ' + L.plus + ' ')
          .replace(/−/g, ' ' + L.minus + ' ').replace(/□/g, ' ' + L.box + ' ').replace(/=/g, ' ' + L.equals + ' ');
      }

      /* ---- question makers: each returns { html, say, a, alts, why, frac } ---- */
      function add(max, carry) {
        var a, b;
        do { a = rand(10, max - 10); b = rand(2, max - a); } while (carry !== undefined && (((a % 10) + (b % 10)) >= 10) !== carry);
        var s = a + ' + ' + b;
        return { html: s + ' = ?', say: L.howMuch + ' ' + sayOp(s) + QM, a: a + b,
          alts: [a + b + 1, a + b - 1, a + b + 10, a + b - 10, (a % 10 + b % 10 >= 10) ? a + b - 10 : a + b + 9], why: s + ' = ' + (a + b) };
      }
      function sub(max, borrow) {
        var a, b;
        do { a = rand(20, max); b = rand(3, a - 2); } while (borrow !== undefined && ((a % 10) < (b % 10)) !== borrow);
        var s = a + ' − ' + b, r = a - b;
        // typical mistake: subtracting the smaller digit from the bigger one
        var wrongUnits = Math.abs(a % 10 - b % 10), mistake = (Math.floor(a / 10) - Math.floor(b / 10)) * 10 + wrongUnits;
        return { html: s + ' = ?', say: L.howMuch + ' ' + sayOp(s) + QM, a: r,
          alts: [r + 1, r - 1, r + 10, r - 10, mistake], why: s + ' = ' + r };
      }
      function mul(tables, maxB) {
        var a = tables[rand(0, tables.length - 1)], b = rand(2, maxB || 10);
        if (Math.random() < 0.5) { var x = a; a = b; b = x; }
        var s = a + ' × ' + b, r = a * b;
        return { html: s + ' = ?', say: L.howMuch + ' ' + sayOp(s) + QM, a: r,
          alts: [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, a + b, r + 1], why: s + ' = ' + r };
      }
      function mul2x1() {
        var a = rand(12, 49), b = rand(2, 9), r = a * b;
        var s = a + ' × ' + b;
        var tens = Math.floor(a / 10) * 10, ones = a % 10;
        return { html: s + ' = ?', say: L.howMuch + ' ' + sayOp(s) + QM, a: r,
          alts: [r + 10, r - 10, tens * b + ones, r + b, r - b, Math.floor(a / 10) * b * 10 + ones * b + 1],
          why: tens + ' × ' + b + ' = ' + tens * b + ',  ' + ones + ' × ' + b + ' = ' + ones * b + ',  ' + tens * b + ' + ' + ones * b + ' = ' + r };
      }
      function div(maxDivisor) {
        var a = rand(2, maxDivisor || 10), r = rand(2, 10), N = a * r;
        var s = N + ' : ' + a;
        return { html: s + ' = ?', say: L.howMuch + ' ' + sayOp(s) + QM, a: r,
          alts: [r + 1, r - 1, r + 2, a, r * 2], why: a + ' × ' + r + ' = ' + N + '  →  ' + s + ' = ' + r };
      }
      function frac(dens, maxN, unitOnly, word) {
        var d = dens[rand(0, dens.length - 1)];
        var n = 1;
        if (!unitOnly) { do { n = rand(1, d - 1); } while (gcd(n, d) !== 1); } // only fractions in simplest form (no 2/6)
        var k = rand(2, Math.max(2, Math.floor(maxN / d)));
        var N = d * k, r = k * n;
        var shown = fracHtml(n, d);
        var html, say;
        if (word) {
          html = fill(L.w.frac, { N: N, F: (D.i18n.lang === 'el' ? L.fracArt(n) + ' ' : '') + shown });
          say = fill(L.w.frac, { N: N, F: sayFrac(n, d) });
        } else if (D.i18n.lang === 'el') {
          html = L.isWhat + ' ' + L.fracArt(n) + ' ' + shown + ' ' + L.of + ' ' + N + QM;
          say = L.isWhat + ' ' + sayFrac(n, d) + ' ' + L.of + ' ' + N + QM;
        } else {
          html = L.isWhat + ' ' + shown + ' ' + L.of + ' ' + N + '?';
          say = L.isWhat + ' ' + sayFrac(n, d) + ' ' + L.of + ' ' + N + '?';
        }
        return { html: html, say: say, a: r, frac: [n, d],
          alts: [k, N - r, r + k, r - k, N * n, r + 1, Math.round(N / n)],
          why: N + ' : ' + d + ' = ' + k + (n > 1 ? ',  ' + k + ' × ' + n + ' = ' + r : '') };
      }
      function halfDouble() {
        if (Math.random() < 0.5) {
          var N = rand(3, 25) * 2;
          return { html: L.isWhat + ' ' + L.half + ' ' + N + (D.i18n.lang === 'el' ? ';' : '?'), say: L.isWhat + ' ' + L.half + ' ' + N + QM,
            a: N / 2, alts: [N / 2 + 1, N / 2 - 1, N * 2, N - 2, N / 2 + 10], why: N + ' : 2 = ' + N / 2, frac: [1, 2] };
        }
        var M = rand(6, 45);
        return { html: L.isWhat + ' ' + L.double + ' ' + M + (D.i18n.lang === 'el' ? ';' : '?'), say: L.isWhat + ' ' + L.double + ' ' + M + QM,
          a: M * 2, alts: [M * 2 + 1, M * 2 - 1, M + 2, M * 2 + 10, Math.floor(M / 2)], why: M + ' + ' + M + ' = ' + M * 2 };
      }
      function missing(kind, max) {
        var a, b, s, r, why;
        if (kind === 'add') { a = rand(5, max - 10); b = rand(3, max - a); s = '□ + ' + b + ' = ' + (a + b); r = a; why = (a + b) + ' − ' + b + ' = ' + a; }
        else if (kind === 'sub') { a = rand(20, max); b = rand(3, a - 3); s = a + ' − □ = ' + (a - b); r = b; why = a + ' − ' + (a - b) + ' = ' + b; }
        else { a = rand(2, 10); b = rand(2, 10); s = '□ × ' + b + ' = ' + a * b; r = a; why = (a * b) + ' : ' + b + ' = ' + a; }
        return { html: '<small>' + L.missing + '</small><br>' + s, say: L.missing + ' ' + sayOp(s), a: r,
          alts: [r + 1, r - 1, r + 10, r + 2, r * 2], why: why };
      }
      function word(kind, hard) {
        var a, b, N, txt, r, why;
        if (kind === 'add') { a = rand(12, hard ? 480 : 60); b = rand(5, hard ? 400 : 35); txt = fill(L.w.add, { a: a, b: b }); r = a + b; why = a + ' + ' + b + ' = ' + r; }
        else if (kind === 'sub') { a = rand(25, hard ? 900 : 90); b = rand(5, a - 5); txt = fill(L.w.sub, { a: a, b: b }); r = a - b; why = a + ' − ' + b + ' = ' + r; }
        else if (kind === 'mul') { a = rand(2, 9); b = rand(2, hard ? 12 : 9); txt = fill(L.w.mul, { a: a, b: b }); r = a * b; why = b + ' × ' + a + ' = ' + r; }
        else { a = rand(2, 9); r = rand(2, 10); N = a * r; txt = fill(L.w.div, { N: N, a: a }); why = N + ' : ' + a + ' = ' + r; }
        return { html: '<span class="word">' + txt + '</span>', say: txt, a: r, alts: [r + 1, r - 1, r + 10, r - 2, r * 2], why: why };
      }

      var MAKERS = {
        easy: [
          function () { return add(99, false); }, function () { return add(99, true); },
          function () { return sub(99, false); }, function () { return sub(99, true); },
          function () { return mul([2, 3, 4, 5, 10]); }, function () { return mul([2, 5, 10]); },
          halfDouble, function () { return word(Math.random() < 0.5 ? 'add' : 'sub'); },
          function () { return word('mul'); }, function () { return missing('add', 60); }
        ],
        medium: [
          function () { return add(99, true); }, function () { return sub(99, true); },
          function () { return add(900); }, function () { return mul([3, 4, 6, 7, 8, 9]); },
          function () { return div(10); }, function () { return frac([2, 3, 4, 5, 10], 50, true); },
          function () { return frac([3, 4], 40, false); }, function () { return missing(Math.random() < 0.5 ? 'add' : 'mul', 99); },
          function () { return word('div'); }, function () { return word('mul'); }
        ],
        hard: [
          function () { return add(999, true); }, function () { return sub(999, true); },
          mul2x1, function () { return div(10); },
          function () { return frac([2, 3, 4, 5, 6, 8, 10], 100, false); }, function () { return frac([3, 4, 5, 6], 60, false, true); },
          function () { return missing('mul'); }, function () { return missing('sub', 500); },
          function () { return word('div', true); }, function () { return word(Math.random() < 0.5 ? 'add' : 'sub', true); }
        ]
      }[ctx.level];
      var order = ctx.shuffle(MAKERS);

      function makeQuestion() {
        for (var tryN = 0; tryN < 20; tryN++) {
          var x = order[qn % order.length]();
          if (!seen[x.html] && x.a > 0) { seen[x.html] = 1; break; }
        }
        // 3 different, positive, believable wrong answers
        var alts = ctx.shuffle(x.alts.filter(function (v, i, arr) { return v > 0 && v !== x.a && arr.indexOf(v) === i && Number.isInteger(v); }));
        while (alts.length < 3) { var v = x.a + rand(-12, 12); if (v > 0 && v !== x.a && alts.indexOf(v) < 0) alts.push(v); }
        x.choices = ctx.shuffle([x.a].concat(alts.slice(0, 3)));
        return x;
      }

      // read-only snapshot used by the automated tests
      stage._debug = function () { return q; };

      ctx.progress(0, N_Q);
      next();

      function next() {
        if (qn >= N_Q) {
          ctx.complete(fill(L.score, { s: firstTry, n: N_Q }));
          return;
        }
        q = makeQuestion();
        tries = 0; lock = false;
        stage.innerHTML = '';
        var bar = '';
        if (q.frac) {
          bar = '<div class="frac-bar">';
          for (var i = 0; i < q.frac[1]; i++) bar += '<i class="' + (i < q.frac[0] ? 'on' : '') + '"></i>';
          bar += '</div>';
        }
        var wrap = ctx.h('<div class="math-wrap"><div class="math-card"><div class="math-q">' + q.html + '</div>' + bar + '</div>' +
          '<div class="math-answers"></div><div class="math-why"></div></div>');
        var box = wrap.querySelector('.math-answers');
        q.choices.forEach(function (v) {
          var b = ctx.h('<button class="math-ans">' + v + '</button>');
          b._v = v;
          ctx.on(b, 'click', function () { answer(b); });
          box.appendChild(b);
        });
        stage.appendChild(wrap);
        ctx.instructText(q.say);
      }

      function answer(b) {
        if (lock || b.classList.contains('no')) return;
        if (b._v === q.a) {
          lock = true;
          if (tries === 0) firstTry++;
          b.classList.add('yes');
          ctx.sfx.match();
          ctx.praise(b);
          showWhy(false);
          qn++;
          ctx.progress(qn, N_Q);
          ctx.timeout(next, tries === 0 ? 1500 : 2600);
          return;
        }
        tries++;
        b.classList.add('no');
        ctx.sfx.oops();
        b.classList.remove('wobble'); void b.offsetWidth; b.classList.add('wobble');
        if (tries < 2) { ctx.tryAgain(); return; }
        // second miss: show the right answer and how to get it, then a "Next" button
        lock = true;
        stage.querySelectorAll('.math-ans').forEach(function (x) { if (x._v === q.a) x.classList.add('yes', 'reveal'); });
        showWhy(true);
      }

      function showWhy(withButton) {
        var w = stage.querySelector('.math-why');
        w.innerHTML = '<span>' + q.why + '</span>';
        w.classList.add('show');
        if (!withButton) return;
        D.speech.say(q.why.replace(/,\s+/g, '. ').replace(/→/g, '. ').replace(/×|:|\+|−|=/g, function (m) { return sayOp(m); }), { noCaption: true });
        var nb = ctx.h('<button class="text-btn primary math-next">' + L.next + ' ' + A.ICONS.next + '</button>');
        ctx.on(nb, 'click', function () { qn++; ctx.progress(qn, N_Q); next(); });
        w.appendChild(nb);
      }
    }
  };
})(window.Dino);
