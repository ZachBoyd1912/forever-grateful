/* Roobet Tracker — bookmarklet source (NOT minified).
 *
 * Setup:
 *  1. Set API_URL to your deployed ingest endpoint.
 *  2. Set API_KEY to your BOOKMARKLET_API_KEY.
 *  3. Open Roobet bet history, press F12, inspect a bet row, and update
 *     ROW_SELECTOR + CELLS below to match Roobet's current DOM.
 *  4. Minify this file, prefix with `javascript:`, save as a bookmark
 *     named "Import Roobet Bets".
 *  5. Click it at least weekly — your DB is the permanent record, because
 *     Roobet states no public bet-history retention period.
 */
(function () {
  var API_URL = 'https://www.private.forevergrateful.ie/api/ingest';
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

  var rows = document.querySelectorAll(ROW_SELECTOR);
  if (!rows.length) {
    alert("No bet rows found. Update ROW_SELECTOR in the bookmarklet to match Roobet's current DOM.");
    return;
  }

  var bets = [];
  Array.prototype.forEach.call(rows, function (row) {
    var stake = parseMoney(text(row, CELLS.stake));
    var payout = parseMoney(text(row, CELLS.payout));
    var gameName = text(row, CELLS.game);
    var tsRaw = text(row, CELLS.timestamp);
    if (!tsRaw) return;
    var d = new Date(tsRaw);
    if (isNaN(d.getTime())) return;

    var mult = parseMultiplier(text(row, CELLS.multiplier));
    var extId = text(row, CELLS.id) || undefined;

    bets.push({
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
    });
  });

  if (!bets.length) {
    alert('Found rows but could not parse any bets. Check CELLS selectors.');
    return;
  }

  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(bets),
  })
    .then(function (r) {
      return r.json().then(function (data) {
        return { ok: r.ok, status: r.status, data: data };
      });
    })
    .then(function (res) {
      console.log('Ingest result:', res);
      if (!res.ok) {
        alert('Import failed (' + res.status + '). See console for details.');
        return;
      }
      alert('Imported ' + res.data.imported + ' / ' + res.data.received + ' bets. Check console for details.');
    })
    .catch(function (err) {
      console.error(err);
      alert('Import failed: ' + err.message);
    });
})();
