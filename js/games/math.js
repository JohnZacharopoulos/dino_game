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
      ordS: { 2: 'δεύτερο', 3: 'τρίτο', 4: 'τέταρτο', 5: 'πέμπτο', 6: 'έκτο', 7: 'έβδομο', 8: 'όγδοο', 9: 'ένατο', 10: 'δέκατο', 11: 'ενδέκατο', 12: 'δωδέκατο' },
      ordP: { 2: 'δεύτερα', 3: 'τρίτα', 4: 'τέταρτα', 5: 'πέμπτα', 6: 'έκτα', 7: 'έβδομα', 8: 'όγδοα', 9: 'ένατα', 10: 'δέκατα', 11: 'ενδέκατα', 12: 'δωδέκατα' },
      w: {
        add: 'Στη λίμνη πίνουν νερό {a} δεινόσαυροι και έρχονται άλλοι {b}. Πόσοι δεινόσαυροι είναι τώρα;',
        sub: 'Ο Βροντόσαυρος είχε {a} φύλλα και έφαγε τα {b}. Πόσα φύλλα του έμειναν;',
        mul: 'Σε κάθε φωλιά υπάρχουν {a} αυγά. Πόσα αυγά έχουν {b} φωλιές;',
        div: 'Ο Ρεξ μοιράζει {N} καρύδες εξίσου σε {a} φίλους. Πόσες καρύδες παίρνει ο καθένας;',
        frac: 'Ο Ρεξ μάζεψε {N} μούρα και έφαγε {F}. Πόσα μούρα έφαγε;'
      },
      fracArt: function (n) { return n === 1 ? 'το' : 'τα'; },
      score: 'Σωστές με την πρώτη: {s} από {n}',
      over: 'προς', pow: { 2: 'στη δευτέρα', 3: 'στην τρίτη', 4: 'στην τετάρτη', 5: 'στην πέμπτη', 6: 'στην έκτη' },
      x: {
        eqFrac: 'Ποιος αριθμός λείπει από το κλάσμα;',
        multipleOf: 'Ποιος αριθμός είναι πολλαπλάσιο του {n};',
        perim: 'Ένα ορθογώνιο έχει μήκος {a} εκ. και πλάτος {b} εκ. Πόση είναι η περίμετρός του σε εκ.;',
        hoursMin: 'Πόσα λεπτά είναι {h} ώρες και {m} λεπτά;',
        money: 'Ένα βιβλίο με δεινόσαυρους κοστίζει {p} €. Πόσα € κοστίζουν {n} βιβλία;',
        percent: 'Πόσο είναι το {p}% του {N};',
        area: 'Ένα ορθογώνιο έχει μήκος {a} μ. και πλάτος {b} μ. Πόσα τετραγωνικά μέτρα είναι το εμβαδόν του;',
        tri: 'Ένα τρίγωνο έχει βάση {a} εκ. και ύψος {b} εκ. Πόσα τετραγωνικά εκατοστά είναι το εμβαδόν του;',
        lcm: 'Ποιο είναι το Ε.Κ.Π. των {a} και {b};', lcmSay: 'Ποιο είναι το ελάχιστο κοινό πολλαπλάσιο των {a} και {b};',
        gcd: 'Ποιος είναι ο Μ.Κ.Δ. των {a} και {b};', gcdSay: 'Ποιος είναι ο μέγιστος κοινός διαιρέτης των {a} και {b};',
        simplify: 'Απλοποίησε όσο γίνεται το κλάσμα', simplifySay: 'Απλοποίησε όσο γίνεται το κλάσμα {F}',
        discount: 'Ένα παιχνίδι κοστίζει {p} € και έχει έκπτωση {d}%. Πόσα € θα πληρώσεις;',
        eq: 'Λύσε την εξίσωση:', eqSay: 'Λύσε την εξίσωση {e}',
        ratio: 'Αν {a} τετράδια κοστίζουν {p} €, πόσα € κοστίζουν {b} τετράδια;',
        avg: 'Ποιος είναι ο μέσος όρος των αριθμών {list};',
        circle: 'Ένας κύκλος έχει ακτίνα {r} εκ. Πόσα τετραγωνικά εκατοστά είναι το εμβαδόν του; (π = 3,14)',
        circum: 'Ένας κύκλος έχει ακτίνα {r} εκ. Πόσα εκατοστά είναι το μήκος του; (π = 3,14)',
        speed: 'Ο Ρεξ τρέχει {v} χιλιόμετρα την ώρα. Πόσα χιλιόμετρα θα τρέξει σε {t} ώρες;'
      },
      next: 'Επόμενη',
      inst: 'Διάλεξε τη σωστή απάντηση!'
    },
    en: {
      howMuch: 'What is', isWhat: 'What is', of: 'of', half: 'half of', double: 'double',
      missing: 'Which number is missing?',
      plus: 'plus', minus: 'minus', times: 'times', div: 'divided by', box: 'what number', equals: 'equals',
      ordS: { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 11: 'eleventh', 12: 'twelfth' },
      ordP: { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths', 11: 'elevenths', 12: 'twelfths' },
      w: {
        add: '{a} dinosaurs are drinking at the lake and {b} more arrive. How many dinosaurs are there now?',
        sub: 'The Brontosaurus had {a} leaves and ate {b} of them. How many leaves are left?',
        mul: 'Each nest has {a} eggs. How many eggs are there in {b} nests?',
        div: 'Rex shares {N} coconuts equally between {a} friends. How many coconuts does each friend get?',
        frac: 'Rex picked {N} berries and ate {F} of them. How many berries did he eat?'
      },
      fracArt: function () { return ''; },
      score: 'Right first time: {s} out of {n}',
      over: 'over', pow: { 2: 'squared', 3: 'cubed', 4: 'to the power of 4', 5: 'to the power of 5', 6: 'to the power of 6' },
      x: {
        eqFrac: 'Which number is missing from the fraction?',
        multipleOf: 'Which number is a multiple of {n}?',
        perim: 'A rectangle is {a} cm long and {b} cm wide. What is its perimeter in cm?',
        hoursMin: 'How many minutes are {h} hours and {m} minutes?',
        money: 'A dinosaur book costs €{p}. How many euros do {n} books cost?',
        percent: 'What is {p}% of {N}?',
        area: 'A rectangle is {a} m long and {b} m wide. What is its area in square metres?',
        tri: 'A triangle has a base of {a} cm and a height of {b} cm. What is its area in square cm?',
        lcm: 'What is the LCM of {a} and {b}?', lcmSay: 'What is the least common multiple of {a} and {b}?',
        gcd: 'What is the GCD of {a} and {b}?', gcdSay: 'What is the greatest common divisor of {a} and {b}?',
        simplify: 'Simplify the fraction as much as possible', simplifySay: 'Simplify the fraction {F} as much as possible',
        discount: 'A toy costs €{p} with a {d}% discount. How many euros will you pay?',
        eq: 'Solve the equation:', eqSay: 'Solve the equation {e}',
        ratio: 'If {a} notebooks cost €{p}, how many euros do {b} notebooks cost?',
        avg: 'What is the average of the numbers {list}?',
        circle: 'A circle has a radius of {r} cm. What is its area in square cm? (π = 3.14)',
        circum: 'A circle has a radius of {r} cm. What is its circumference in cm? (π = 3.14)',
        speed: 'Rex runs {v} kilometres an hour. How many kilometres will he run in {t} hours?'
      },
      next: 'Next',
      inst: 'Choose the right answer!'
    }
  };

  function fill(s, v) { return s.replace(/\{(\w+)\}/g, function (m, k) { return v[k]; }); }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function fracHtml(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }

  D.games.math = {
    id: 'math', color: '#0288d1', dark: '#01579b', cat: 'school',
    levels: ['easy', 'medium', 'hard', 'g4', 'g5', 'g6'],
    levelNames: ['grade2', 'grade3', 'grade3plus', 'grade4', 'grade5', 'grade6'],
    levelBadges: { el: ['Β΄', 'Γ΄', 'Γ΄+', 'Δ΄', 'Ε΄', 'ΣΤ΄'], en: ['2', '3', '3+', '4', '5', '6'] },

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

      /* ---- values: whole numbers, decimals (2.5) and fractions ('3/4') ---- */
      var EL = D.i18n.lang === 'el';
      function r3(v) { return Math.round(v * 1000) / 1000; }
      function isFrac(v) { return typeof v === 'string'; }
      function fparts(v) { var p = v.split('/'); return [+p[0], +p[1]]; }
      function reduce(n, d) { var g = gcd(n, d); return [n / g, d / g]; }
      function fracVal(n, d) { var r = reduce(n, d); return r[1] === 1 ? r[0] : r[0] + '/' + r[1]; } // reduced; whole if possible
      function key(v, exact) {
        if (isFrac(v)) { if (exact) return v; var p = fparts(v), r = reduce(p[0], p[1]); return r[1] === 1 ? String(r[0]) : r[0] + '/' + r[1]; }
        return String(r3(v));
      }
      function valid(v) { return isFrac(v) ? fparts(v)[0] > 0 && fparts(v)[1] > 0 : (typeof v === 'number' && isFinite(v) && v > 0); }
      function fmtNum(v) {
        var s = String(r3(v)).split('.'), ip = s[0];
        if (ip.length >= 5) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, EL ? '.' : ',');
        return ip + (s[1] ? (EL ? ',' : '.') + s[1] : '');
      }
      function show(v) { if (isFrac(v)) { var p = fparts(v); return fracHtml(p[0], p[1]); } return fmtNum(v); }
      function plain(v) { return isFrac(v) ? v : fmtNum(v); }
      function sayF(n, d) {
        var name = (n === 1 ? L.ordS : L.ordP)[d];
        if (!name) return n + ' ' + L.over + ' ' + d;
        return (n <= 10 ? D.i18n.number(n) : n) + ' ' + name;
      }
      function F(n, d) { return fracHtml(n, d); }
      function Q(html, say, a, alts, why, extra) {
        var o = { html: html, say: say, a: a, alts: alts, why: why };
        for (var k in extra || {}) o[k] = extra[k];
        return o;
      }
      function pick(arr) { return arr[rand(0, arr.length - 1)]; }
      function expr(s) { return s.replace(/\d+(\.\d+)?/g, function (m) { return fmtNum(+m); }); } // 2.5 -> 2,5 in Greek
      function calc(s) { return Q(expr(s) + ' = ?', L.howMuch + ' ' + sayOp(expr(s)) + QM); }

      /* ---- Δ΄ Δημοτικού ---- */
      function add4() { var a = rand(1000, 8999), b = rand(120, 9999 - a), r = a + b, q = calc(a + ' + ' + b);
        q.a = r; q.alts = [r + 10, r - 10, r + 100, r - 100, r + 1000, r - 1]; q.why = a + ' + ' + b + ' = ' + r; return q; }
      function sub4() { var a = rand(2000, 9999), b = rand(150, a - 100), r = a - b, q = calc(a + ' − ' + b);
        q.a = r; q.alts = [r + 10, r - 10, r + 100, r - 100, r + 1000, r + 1]; q.why = a + ' − ' + b + ' = ' + r; return q; }
      function mul2x2() { var a = rand(12, 39), b = rand(11, 25), bt = b - b % 10, bo = b % 10, r = a * b, q = calc(a + ' × ' + b);
        q.a = r; q.alts = [a * bt + bo, a * bt + a * bo + 10, r - a, r + a, r + 100, r - 10];
        q.why = a + ' × ' + bt + ' = ' + a * bt + ',  ' + a + ' × ' + bo + ' = ' + a * bo + ',  ' + a * bt + ' + ' + a * bo + ' = ' + r; return q; }
      function div3by1() { var d = rand(2, 9), r = rand(12, 99), N = d * r, q = calc(N + ' : ' + d);
        q.a = r; q.alts = [r + 1, r - 1, r + 10, r - 10, r + 2]; q.why = d + ' × ' + r + ' = ' + N + '  →  ' + N + ' : ' + d + ' = ' + r; return q; }
      function eqFrac() {
        var b = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5]]), k = rand(2, 5), n = b[0], d = b[1];
        return Q('<small>' + L.x.eqFrac + '</small><br>' + F(n, d) + ' = ' + F('?', d * k), L.x.eqFrac + ' ' + sayF(n, d) + ' ' + L.equals + ' ' + L.box + ' ' + L.over + ' ' + d * k,
          n * k, [n + k, d * k - n, n * k + 1, n * k - 1, k, n * k + d], d + ' × ' + k + ' = ' + d * k + ',  ' + n + ' × ' + k + ' = ' + n * k, { frac: [n, d] });
      }
      function fracAddSame() {
        var d = rand(5, 12), n1 = rand(1, d - 2), n2 = rand(1, d - 1 - n1), s = n1 + n2;
        return Q(F(n1, d) + ' + ' + F(n2, d) + ' = ?', L.howMuch + ' ' + sayF(n1, d) + ' ' + L.plus + ' ' + sayF(n2, d) + QM,
          s + '/' + d, [s + '/' + 2 * d, (s + 1) + '/' + d, (s > 1 ? s - 1 : s + 2) + '/' + d, n1 * n2 + '/' + d],
          n1 + '/' + d + ' + ' + n2 + '/' + d + ' = ' + s + '/' + d, { exact: true });
      }
      function dec1() {
        var a = rand(11, 89) / 10, b = rand(11, 59) / 10, r = r3(a + b), q = calc(a + ' + ' + b);
        q.a = r; q.alts = [r3(r + 0.1), r3(r - 0.1), r3(r + 1), r3(r * 10), r3(r - 1)]; q.why = expr(a + ' + ' + b + ' = ' + r); return q;
      }
      function multipleOf() {
        var n = rand(3, 9), m = n * rand(3, 12), alts = [];
        for (var v = m - 4; v <= m + 7; v++) if (v > 0 && v % n !== 0) alts.push(v);
        return Q(fill(L.x.multipleOf, { n: n }), fill(L.x.multipleOf, { n: n }), m, alts, n + ' × ' + m / n + ' = ' + m);
      }
      function perim() { var a = rand(6, 25), b = rand(3, a - 1), r = 2 * (a + b), t = fill(L.x.perim, { a: a, b: b });
        return Q('<span class="word">' + t + '</span>', t, r, [a + b, a * b, 2 * a + b, r + 2, r - 2], '2 × (' + a + ' + ' + b + ') = ' + r); }
      function hoursMin() { var h = rand(1, 4), m = pick([5, 10, 15, 20, 30, 45]), r = 60 * h + m, t = fill(L.x.hoursMin, { h: h, m: m });
        return Q('<span class="word">' + t + '</span>', t, r, [100 * h + m, 60 * h, r + 10, h + m, r - 15], h + ' × 60 + ' + m + ' = ' + r); }
      function money() { var p = rand(3, 15), n = rand(4, 12), r = p * n, t = fill(L.x.money, { p: p, n: n });
        return Q('<span class="word">' + t + '</span>', t, r, [p + n, r + p, r - p, r + 10], n + ' × ' + p + ' = ' + r); }

      /* ---- Ε΄ Δημοτικού ---- */
      function decAdd2() {
        var a = rand(101, 899) / 100, b = rand(11, 99) / 10, r = r3(a + b), q = calc(a + ' + ' + b);
        q.a = r; q.alts = [r3(a + b / 10), r3(r + 0.1), r3(r - 0.1), r3(r + 1), r3(r + 0.01)]; q.why = expr(a + ' + ' + b + ' = ' + r); return q;
      }
      function decMul() {
        var a = pick([1.2, 1.5, 2.5, 0.5, 3.5, 0.25, 1.25, 0.8, 0.6, 2.4]), n = rand(2, 9), r = r3(a * n), q = calc(a + ' × ' + n);
        q.a = r; q.alts = [r3(r * 10), r3(r / 10), r3(r + n), r3(r + 0.5), r3(r - 0.5)]; q.why = expr(a + ' × ' + n + ' = ' + r); return q;
      }
      function mul10() {
        var f = pick([10, 100, 1000]), q, r, v;
        if (Math.random() < 0.5) { v = rand(101, 999) / 100; r = r3(v * f); q = calc(v + ' × ' + f); q.alts = [r3(r * 10), r3(r / 10), r3(v / f), r3(r / 100)]; }
        else { f = pick([10, 100]); v = rand(12, 980); r = r3(v / f); q = calc(v + ' : ' + f); q.alts = [r3(r * 10), r3(r / 10), v * f, r3(r * 100)]; }
        q.a = r; q.why = expr(q.html.replace(' = ?', '') + ' = ' + r); return q;
      }
      function fracAddDiff() {
        var n1, d1, n2, d2, sn, sd;
        do {
          var pr = pick([[2, 4], [2, 6], [3, 6], [2, 8], [4, 8], [3, 12], [4, 12], [2, 3], [3, 4], [2, 5], [4, 6]]);
          d1 = pr[0]; d2 = pr[1]; n1 = rand(1, d1 - 1); n2 = rand(1, d2 - 1);
          sn = n1 * d2 + n2 * d1; sd = d1 * d2;
        } while (sn >= sd || gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1);
        var ans = fracVal(sn, sd), ap = fparts(String(ans).indexOf('/') > 0 ? ans : ans + '/1');
        return Q(F(n1, d1) + ' + ' + F(n2, d2) + ' = ?', L.howMuch + ' ' + sayF(n1, d1) + ' ' + L.plus + ' ' + sayF(n2, d2) + QM,
          ans, [(n1 + n2) + '/' + (d1 + d2), (n1 + n2) + '/' + Math.max(d1, d2), (ap[0] + 1) + '/' + ap[1], ap[0] + '/' + (ap[1] + 1)],
          n1 + '/' + d1 + ' + ' + n2 + '/' + d2 + ' = ' + sn + '/' + sd + (String(ans) === sn + '/' + sd ? '' : ' = ' + ans));
      }
      function simplify() {
        var b = pick([[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [1, 3], [5, 6], [3, 7], [4, 9], [3, 8]]), k = pick([2, 3, 4, 6]);
        var n = b[0] * k, d = b[1] * k, ans = b[0] + '/' + b[1];
        var half = k % 2 === 0 && k > 2 ? (n / 2) + '/' + (d / 2) : (b[0] + 1) + '/' + b[1];
        return Q(L.x.simplify + ': ' + F(n, d), fill(L.x.simplifySay, { F: sayF(n, d) }), ans,
          [half, b[0] + '/' + (b[1] + 1), (b[1]) + '/' + (b[0] + b[1]), (b[0] + 1) + '/' + (b[1] + 1)],
          n + ' : ' + k + ' = ' + b[0] + ',  ' + d + ' : ' + k + ' = ' + b[1] + '  →  ' + ans, { exact: true });
      }
      function percent(ps) {
        var p = pick(ps || [10, 20, 25, 50, 75]), unit = 100 / gcd(p, 100), N = unit * rand(1, Math.max(1, Math.floor(400 / unit))), r = N * p / 100;
        if (N < 20) { N *= 4; r *= 4; }
        var t = fill(L.x.percent, { p: p, N: N });
        return Q(t, t, r, [N - r, r + 10, r * 2, Math.round(N / p), r + p], N + ' : 100 × ' + p + ' = ' + r);
      }
      function orderOps() {
        var a = rand(2, 9), b = rand(2, 9), c = rand(2, 9), s, r, wrong;
        var k = rand(0, 2);
        if (k === 0) { s = a + ' + ' + b + ' × ' + c; r = a + b * c; wrong = (a + b) * c; }
        else if (k === 1) { a = rand(20, 60); s = a + ' − ' + b + ' × ' + c; r = a - b * c; wrong = (a - b) * c; if (r <= 0) { a += b * c; s = a + ' − ' + b + ' × ' + c; r = a - b * c; wrong = (a - b) * c; } }
        else { s = '(' + a + ' + ' + b + ') × ' + c; r = (a + b) * c; wrong = a + b * c; }
        var q = calc(s); q.a = r; q.alts = [wrong, r + 1, r - 1, r + c, r + 10];
        q.why = (k === 2 ? (a + b) + ' × ' + c : (k === 0 ? a + ' + ' + b * c : a + ' − ' + b * c)) + ' = ' + r; return q;
      }
      function area() {
        var a, b, t, r;
        if (Math.random() < 0.5) { a = rand(4, 20); b = rand(3, 15); r = a * b; t = fill(L.x.area, { a: a, b: b });
          return Q('<span class="word">' + t + '</span>', t, r, [2 * (a + b), a + b, r + a, r - b], a + ' × ' + b + ' = ' + r); }
        do { a = rand(4, 20); b = rand(3, 14); } while ((a * b) % 2);
        r = a * b / 2; t = fill(L.x.tri, { a: a, b: b });
        return Q('<span class="word">' + t + '</span>', t, r, [a * b, a + b, r + a, 2 * r + a], a + ' × ' + b + ' : 2 = ' + r);
      }
      function lcmGcd() {
        var a, b;
        if (Math.random() < 0.5) {
          do { a = rand(2, 12); b = rand(2, 12); } while (a === b || a % b === 0 || b % a === 0);
          var l = a * b / gcd(a, b);
          return Q(fill(L.x.lcm, { a: a, b: b }), fill(L.x.lcmSay, { a: a, b: b }), l, [a * b, gcd(a, b), Math.max(a, b), l * 2, a + b],
            fill(EL ? 'Πολλαπλάσια: {a} × {x} = {l}, {b} × {y} = {l}' : 'Multiples: {a} × {x} = {l}, {b} × {y} = {l}', { a: a, b: b, x: l / a, y: l / b, l: l }));
        }
        var g = rand(2, 9), x, y;
        do { x = rand(2, 7); y = rand(2, 7); } while (x === y || gcd(x, y) !== 1);
        a = g * x; b = g * y;
        return Q(fill(L.x.gcd, { a: a, b: b }), fill(L.x.gcdSay, { a: a, b: b }), g, [g * 2, a * b / g, Math.min(a, b), g + 1, x + y],
          a + ' = ' + g + ' × ' + x + ',  ' + b + ' = ' + g + ' × ' + y + '  →  ' + g);
      }
      function longDiv() { var d = rand(11, 25), r = rand(12, 45), N = d * r, q = calc(N + ' : ' + d);
        q.a = r; q.alts = [r + 1, r - 1, r + 10, r - 10, r * 10]; q.why = d + ' × ' + r + ' = ' + N + '  →  ' + N + ' : ' + d + ' = ' + r; return q; }

      /* ---- ΣΤ΄ Δημοτικού ---- */
      function discount() {
        var d = pick([10, 20, 25, 50]), p = rand(2, 10) * 20, pay = p * (100 - d) / 100, t = fill(L.x.discount, { p: p, d: d });
        return Q('<span class="word">' + t + '</span>', t, pay, [p * d / 100, p - d, p, pay + 10, pay - 5],
          p + ' × ' + d + ' : 100 = ' + p * d / 100 + ',  ' + p + ' − ' + p * d / 100 + ' = ' + pay);
      }
      function equation() {
        var x = rand(2, 12), a = rand(2, 9), b = rand(3, 25), k = rand(0, 2), e, alts;
        if (k === 0) { e = 'x + ' + b + ' = ' + (x + b); alts = [x + 2 * b, b, x + 1, x - 1]; }
        else if (k === 1) { e = a + 'x = ' + a * x; alts = [a * x - a, a * a * x, x + 1, a + x]; }
        else { e = a + 'x + ' + b + ' = ' + (a * x + b); alts = [(a * x + 2 * b) / a, a * x, x + 1, x + b]; }
        var why = k === 0 ? 'x = ' + (x + b) + ' − ' + b + ' = ' + x : k === 1 ? 'x = ' + a * x + ' : ' + a + ' = ' + x
          : a + 'x = ' + (a * x + b) + ' − ' + b + ' = ' + a * x + ',  x = ' + a * x + ' : ' + a + ' = ' + x;
        return Q('<small>' + L.x.eq + '</small><br>' + e.replace(/x/g, '<i>x</i>'), fill(L.x.eqSay, { e: sayOp(e).replace(/(\d)x/g, '$1 x') }), x, alts, why);
      }
      function power() {
        var b = pick([2, 2, 3, 4, 5, 10]), maxE = { 2: 6, 3: 4, 4: 3, 5: 3, 10: 5 }[b], e = rand(2, maxE), r = Math.pow(b, e);
        var steps = []; for (var i = 0; i < e; i++) steps.push(b);
        return Q(b + '<sup>' + e + '</sup> = ?', L.howMuch + ' ' + b + ' ' + L.pow[e] + QM, r,
          [b * e, Math.pow(b, e - 1), Math.pow(b, e + 1), b + e, r + b], steps.join(' × ') + ' = ' + fmtNum(r));
      }
      function orderParen() {
        var a = rand(2, 9), b = rand(2, 9), c = rand(2, 6), e = rand(2, 5), d = e * rand(1, 6);
        var r = (a + b) * c - d / e;
        var s = '(' + a + ' + ' + b + ') × ' + c + ' − ' + d + ' : ' + e, q = calc(s);
        q.a = r; q.alts = [((a + b) * c - d) / e, a + b * c - d / e, r + 1, r - d, (a + b) * (c - d) / e];
        q.why = (a + b) + ' × ' + c + ' − ' + d / e + ' = ' + (a + b) * c + ' − ' + d / e + ' = ' + r; return q;
      }
      function fracMul() {
        var n1 = rand(1, 4), d1 = rand(n1 + 1, 6), n2 = rand(1, 5), d2 = rand(n2 + 1, 8);
        if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) return fracMul();
        var ans = fracVal(n1 * n2, d1 * d2);
        return Q(F(n1, d1) + ' × ' + F(n2, d2) + ' = ?', L.howMuch + ' ' + sayF(n1, d1) + ' ' + L.times + ' ' + sayF(n2, d2) + QM, ans,
          [(n1 + n2) + '/' + (d1 + d2), (n1 * d2) + '/' + (d1 * n2), (n1 * n2) + '/' + (d1 + d2), (n1 * n2 + 1) + '/' + (d1 * d2)],
          n1 + ' × ' + n2 + ' = ' + n1 * n2 + ',  ' + d1 + ' × ' + d2 + ' = ' + d1 * d2 + '  →  ' + ans);
      }
      function fracDiv() {
        var n1 = rand(1, 5), d1 = rand(n1 + 1, 8), n2 = rand(1, 5), d2 = rand(n2 + 1, 10);
        if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1 || (n1 === n2 && d1 === d2)) return fracDiv();
        var ans = fracVal(n1 * d2, d1 * n2);
        return Q(F(n1, d1) + ' : ' + F(n2, d2) + ' = ?', L.howMuch + ' ' + sayF(n1, d1) + ' ' + L.div + ' ' + sayF(n2, d2) + QM, ans,
          [fracVal(n1 * n2, d1 * d2), fracVal(d1 * n2, n1 * d2), (n1 * d2 + 1) + '/' + (d1 * n2), fracVal(n1 * d2, d1 * n2 * 2)],
          n1 + '/' + d1 + ' × ' + d2 + '/' + n2 + ' = ' + (n1 * d2) + '/' + (d1 * n2) + (String(ans) === (n1 * d2) + '/' + (d1 * n2) ? '' : ' = ' + ans));
      }
      function ratio() { var a = rand(2, 5), u = rand(2, 9), p = a * u, b = rand(6, 12), r = b * u, t = fill(L.x.ratio, { a: a, p: p, b: b });
        return Q('<span class="word">' + t + '</span>', t, r, [p + b - a, b * p, r + u, r - u, p * 2], p + ' : ' + a + ' = ' + u + ',  ' + u + ' × ' + b + ' = ' + r); }
      function average() {
        // m ≥ 8 keeps every number positive
        var n = pick([3, 4]), m = rand(8, 30), devs = n === 3 ? pick([[-2, 0, 2], [-3, 1, 2], [-4, -1, 5], [-5, 2, 3]]) : pick([[-3, -1, 1, 3], [-4, 0, 1, 3], [-6, 2, 2, 2]]);
        var nums = ctx.shuffle(devs.map(function (dv) { return m + dv; })), sum = n * m, t = fill(L.x.avg, { list: nums.join(', ') });
        return Q(t, t, m, [sum, m + 1, m - 1, Math.max.apply(null, nums), m + 2], '(' + nums.join(' + ') + ') : ' + n + ' = ' + sum + ' : ' + n + ' = ' + m);
      }
      function decDiv() {
        var q, r;
        if (Math.random() < 0.5) { r = rand(11, 99) / 10; var d = rand(2, 9), N = r3(r * d); q = calc(N + ' : ' + d); q.why = expr(d + ' × ' + r + ' = ' + N + '  →  ' + N + ' : ' + d + ' = ' + r); }
        else { r = rand(2, 15); var dv = rand(2, 9) / 10, M = r3(r * dv); q = calc(M + ' : ' + dv); q.why = expr(M + ' : ' + dv + ' = ' + r3(M * 10) + ' : ' + r3(dv * 10) + ' = ' + r); }
        q.a = r; q.alts = [r3(r * 10), r3(r / 10), r3(r + 1), r3(r + 0.5), r3(r - 0.1)]; return q;
      }
      function circle() {
        var rr = pick([1, 2, 3, 4, 5, 10]), t, r;
        if (Math.random() < 0.5) { r = r3(3.14 * rr * rr); t = fill(L.x.circle, { r: rr });
          return Q('<span class="word">' + t + '</span>', t, r, [r3(2 * 3.14 * rr), r3(3.14 * rr), r3(r * 2), r3(r + 3.14)], expr('3.14 × ' + rr + ' × ' + rr + ' = ' + r)); }
        r = r3(2 * 3.14 * rr); t = fill(L.x.circum, { r: rr });
        return Q('<span class="word">' + t + '</span>', t, r, [r3(3.14 * rr * rr), r3(3.14 * rr), r3(r + 2), r3(r * 2)], expr('2 × 3.14 × ' + rr + ' = ' + r));
      }
      function speed() { var v = rand(4, 12), tt = rand(2, 5), r = v * tt, t = fill(L.x.speed, { v: v, t: tt });
        return Q('<span class="word">' + t + '</span>', t, r, [v + tt, r + v, r - v, r * 2], v + ' × ' + tt + ' = ' + r); }

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
        ],
        g4: [add4, sub4, mul2x2, div3by1, eqFrac, fracAddSame, dec1, multipleOf, perim, function () { return Math.random() < 0.5 ? hoursMin() : money(); }],
        g5: [decAdd2, decMul, mul10, fracAddDiff, simplify, function () { return percent(); }, orderOps, area, lcmGcd, longDiv],
        g6: [function () { return percent([5, 15, 30, 35, 40, 60]); }, discount, equation, power, orderParen, fracMul, fracDiv,
          ratio, average, decDiv, circle, speed]
      }[ctx.level];
      var order = ctx.shuffle(MAKERS);

      function makeQuestion() {
        for (var tryN = 0; tryN < 20; tryN++) {
          var x = order[qn % order.length]();
          if (!seen[x.html] && valid(x.a)) { seen[x.html] = 1; break; }
        }
        // 3 different, positive, believable wrong answers (never equal in value to the right one)
        var used = {}, alts = [], whole = typeof x.a === 'number' && Number.isInteger(x.a);
        used[key(x.a, x.exact)] = 1;
        function tryAdd(v) {
          if (!valid(v)) return;
          if (whole && typeof v === 'number' && !Number.isInteger(v)) return;
          var k = key(v, x.exact);
          if (used[k]) return;
          if (!x.exact && isFrac(v) === false && isFrac(x.a) && key(v) === key(x.a)) return;
          used[k] = 1; alts.push(v);
        }
        ctx.shuffle(x.alts).forEach(tryAdd);
        for (var guard = 0; alts.length < 3 && guard < 200; guard++) {
          if (isFrac(x.a)) { var p = fparts(x.a); tryAdd((p[0] + rand(-2, 3)) + '/' + (p[1] + rand(-1, 3))); }
          else if (whole) tryAdd(x.a + rand(-12, 12));
          else tryAdd(r3(x.a + rand(-9, 9) * (String(x.a).split('.')[1].length > 1 ? 0.01 : 0.1)));
        }
        x.choices = ctx.shuffle([x.a].concat(alts.slice(0, 3)));
        x.aKey = key(x.a, x.exact);
        x.aText = plain(x.a);
        return x;
      }

      // read-only snapshot used by the automated tests
      stage._debug = function () { return q; };
      stage._gen = function (i) { qn = i; seen = {}; var x = makeQuestion(); qn = 0; return x; };

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
          var b = ctx.h('<button class="math-ans">' + show(v) + '</button>');
          b._v = key(v, q.exact);
          ctx.on(b, 'click', function () { answer(b); });
          box.appendChild(b);
        });
        stage.appendChild(wrap);
        ctx.instructText(q.say);
      }

      function answer(b) {
        if (lock || b.classList.contains('no')) return;
        if (b._v === q.aKey) {
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
        stage.querySelectorAll('.math-ans').forEach(function (x) { if (x._v === q.aKey) x.classList.add('yes', 'reveal'); });
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
