/* Roobet Tracker — bookmarklet source (NOT minified).
 *
 * Setup:
 *  1. Set API_URL to your ingest endpoint (local dev or deployed app).
 *  2. Set API_KEY to your BOOKMARKLET_API_KEY.
 *  3. Open Roobet bet history, press F12, inspect a bet row, and update
 *     ROW_SELECTOR + CELLS below to match Roobet's current DOM.
 *  4. Minify this file, prefix with `javascript:`, save as a bookmark
 *     named "Import Roobet Bets".
 *  5. Click it at least weekly — your DB is the permanent record, because
 *     Roobet states no public bet-history retention period.
 *
 * Auto-scroll backfill (default ON):
 *  One click now walks the whole history by itself: it scrolls to the
 *  bottom, waits for more rows to load, collects them incrementally
 *  (safe even if the page virtualizes rows out of the DOM), and repeats
 *  until nothing new loads. Set AUTO_SCROLL = false to restore the old
 *  behavior (scrape only what is currently on screen).
 */
(function () {
  var API_URL = 'https://private.forevergrateful.ie/api/ingest';
  var API_KEY = 'PASTE_YOUR_BOOKMARKLET_API_KEY_HERE';

  // ---- ADAPT THESE SELECTORS TO ROOBET'S CURRENT DOM ----
  var ROW_SELECTOR = '[data-testid="bet-history-row"], .bet-history-row, tr[class*="bet"]';
  var CELLS = {
    timestamp: '[data-testid="bet-time"], .bet-time, td:nth-child(1)',
    game: '[data-testid="bet-game"], .bet-game, td:nth-child(2)',
    stake: '[data-testid="bet-stake"], .bet-stake, td:nth-child(3)',
    payout: '[data-testid="bet-payout"], .bet-payout, td:nth-child(4)',
    multiplier: '[data-testid="bet-multiplier"], .bet-multiplier, td:nth-child(5)',
    id: '[data-testid="bet-id"], .bet-id',
  };
  // -------------------------------------------------------

  // ---- AUTO-SCROLL TUNING ----
  var AUTO_SCROLL = true; // false = scrape visible rows only (legacy)
  var SCROLL_DELAY_MS = 1200; // wait after each scroll for rows to load
  var SETTLE_ROUNDS = 3; // stop after this many scrolls with nothing new
  var MAX_SCROLLS = 300; // hard safety cap (~6 min at default delay)
  var PER_REQUEST = 1500; // bets per POST (server cap is 2000)
  // ----------------------------

  function text(el, sel) {
    var node = el.querySelector(sel);
    return node ? node.textContent.trim() : null;
  }

  function parseMoney(s) {
    if (!s) return 0;
    var n = parseFloat(String(s).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function parseMultiplier(s) {
    if (!s) return null;
    var n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }

  function guessGameType(name) {
    if (!name) return 'unknown';
    var n = String(name).toLowerCase();
    if (n.indexOf('crash') !== -1) return 'crash';
    if (n.indexOf('dice') !== -1) return 'dice';
    if (n.indexOf('slot') !== -1) return 'slots';
    if (n.indexOf('roulette') !== -1) return 'roulette';
    if (n.indexOf('blackjack') !== -1) return 'blackjack';
    if (n.indexOf('sports') !== -1 || n.indexOf('bet') !== -1) return 'sports';
    return 'other';
  }

  // Stable in-memory key so re-seen rows (and virtualized re-renders)
  // never duplicate within one run. Server upserts by externalId anyway.
  function rowKey(b) {
    if (b.externalId) return 'id:' + b.externalId;
    return 'raw:' + b.timestamp + '|' + b.gameType + '|' +
      (b.gameName || '') + '|' + b.stake + '|' + b.payout;
  }

  function parseRow(row) {
    var stake = parseMoney(text(row, CELLS.stake));
    var payout = parseMoney(text(row, CELLS.payout));
    var gameName = text(row, CELLS.game);
    var tsRaw = text(row, CELLS.timestamp);
    if (!tsRaw) return null;
    var d = new Date(tsRaw);
    if (isNaN(d.getTime())) return null;

    var mult = parseMultiplier(text(row, CELLS.multiplier));
    var extId = text(row, CELLS.id) || undefined;

    return {
      externalId: extId,
      timestamp: d.toISOString(),
      gameType: guessGameType(gameName),
      gameName: gameName || undefined,
      stake: stake,
      payout: payout,
      multiplier: mult === null ? undefined : mult,
      currency: 'USD',
      status: 'settled',
      rawData: { tsRaw: tsRaw, stakeRaw: text(row, CELLS.stake), payoutRaw: text(row, CELLS.payout) },
    };
  }

  // Collect every currently-rendered row into `seen` (key -> bet).
  // Returns how many *new* bets were added on this pass.
  function collectPass(seen) {
    var added = 0;
    var rows = document.querySelectorAll(ROW_SELECTOR);
    for (var i = 0; i < rows.length; i++) {
      var b = parseRow(rows[i]);
      if (!b) continue;
      var k = rowKey(b);
      if (!seen[k]) {
        seen[k] = b;
        added++;
      }
    }
    return { total: rows.length, added: added };
  }

  // Find what actually scrolls: nearest scrollable ancestor of a row,
  // else the document scroller. Covers page-scroll and inner-list layouts.
  function findScroller() {
    var probe = document.querySelector(ROW_SELECTOR);
    var el = probe ? probe.parentElement : null;
    while (el && el !== document.body) {
      var st = window.getComputedStyle(el);
      var oy = st.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 10) {
        return el;
      }
      el = el.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  function scrollerBottom(sc) {
    if (sc === document.scrollingElement || sc === document.documentElement || sc === document.body) {
      return Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.documentElement.scrollHeight
      );
    }
    return sc.scrollHeight;
  }

  function scrollToBottom(sc) {
    if (sc === document.scrollingElement || sc === document.documentElement || sc === document.body) {
      window.scrollTo(0, scrollerBottom(sc));
    } else {
      sc.scrollTop = sc.scrollHeight;
    }
  }

  function wait(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  // Tiny fixed progress pill so long backfills don't look frozen.
  function makeStatus() {
    var box = document.createElement('div');
    box.setAttribute('style', 'position:fixed;right:16px;bottom:16px;z-index:2147483647;' +
      'background:#101014;color:#f4f4f5;font:13px/1.4 system-ui,sans-serif;' +
      'border:1px solid #3b82f6;border-radius:10px;padding:10px 14px;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.5);max-width:min(420px,90vw);');
    box.textContent = 'Roobet Tracker: starting…';
    document.body.appendChild(box);
    return {
      set: function (t) { box.textContent = 'Roobet Tracker: ' + t; },
      done: function (t) {
        box.textContent = 'Roobet Tracker: ' + t;
        setTimeout(function () { box.remove(); }, 8000);
      },
      fail: function (t) {
        box.style.borderColor = '#ef4444';
        box.textContent = 'Roobet Tracker: ' + t;
      },
    };
  }

  function postChunk(chunk) {
    return fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(chunk),
    }).then(function (r) {
      return r.json().then(function (data) {
        return { ok: r.ok, status: r.status, data: data };
      });
    });
  }

  async function run() {
    var status = makeStatus();
    var seen = {};
    var first = collectPass(seen);
    if (first.total === 0 && !AUTO_SCROLL) {
      status.fail("No bet rows found. Update ROW_SELECTOR to match Roobet's current DOM.");
      alert("No bet rows found. Update ROW_SELECTOR in the bookmarklet to match Roobet's current DOM.");
      return;
    }

    if (AUTO_SCROLL) {
      var sc = findScroller();
      var still = 0;
      var rounds = 0;
      status.set('Auto-scroll on — collecting (pass 1: ' + first.added + ' bets)…');
      while (still < SETTLE_ROUNDS && rounds < MAX_SCROLLS) {
        var before = scrollerBottom(sc);
        scrollToBottom(sc);
        await wait(SCROLL_DELAY_MS);
        var pass = collectPass(seen);
        rounds++;
        var grew = scrollerBottom(sc) > before + 10 || pass.added > 0;
        still = grew ? 0 : still + 1;
        var n = Object.keys(seen).length;
        status.set('Scrolling… pass ' + (rounds + 1) + ', ' + n + ' bets so far.');
        console.log('[roobet-tracker] scroll pass ' + rounds + ': +' + pass.added + ' bets (' + n + ' total)');
      }
      try { window.scrollTo(0, 0); } catch { /* page has no window scroller */ }
      if (rounds >= MAX_SCROLLS) {
        console.log('[roobet-tracker] hit MAX_SCROLLS, stopping with what we have.');
      }
    }

    var bets = Object.keys(seen).map(function (k) { return seen[k]; });
    if (!bets.length) {
      var msg = AUTO_SCROLL
        ? 'Scrolled the whole history but could not parse any bets. Check CELLS selectors.'
        : 'Found rows but could not parse any bets. Check CELLS selectors.';
      status.fail(msg);
      alert(msg);
      return;
    }

    // Oldest-first keeps the dashboard + dedupe story sane on big backfills.
    bets.sort(function (a, b) { return a.timestamp < b.timestamp ? -1 : 1; });

    var imported = 0;
    var failed = 0;
    for (var i = 0; i < bets.length; i += PER_REQUEST) {
      var chunk = bets.slice(i, i + PER_REQUEST);
      status.set('Uploading ' + Math.min(i + PER_REQUEST, bets.length) + ' / ' + bets.length + ' bets…');
      try {
        var res = await postChunk(chunk);
        console.log('Ingest result:', res);
        if (!res.ok) {
          failed += chunk.length;
          console.error('[roobet-tracker] chunk failed (' + res.status + ')', res.data);
        } else {
          imported += res.data.imported || 0;
          failed += chunk.length - (res.data.imported || 0);
        }
      } catch (err) {
        console.error(err);
        failed += chunk.length;
      }
    }

    if (imported === 0 && failed > 0) {
      status.fail('Import failed for all ' + bets.length + ' bets. See console (F12) for details.');
      alert('Import failed for all ' + bets.length + ' bets. See console for details.');
      return;
    }
    status.done('Imported ' + imported + ' / ' + bets.length + ' bets.');
    alert('Imported ' + imported + ' / ' + bets.length + ' bets. Check console for details.');
  }

  run().catch(function (err) {
    console.error(err);
    alert('Import failed: ' + (err && err.message ? err.message : err));
  });
})();
