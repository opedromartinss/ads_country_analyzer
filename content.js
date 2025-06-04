(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function ensureYesterday() {
    const btn = [...document.querySelectorAll('button')]
                .find(b => /(Qualquer horário|Hoje|Ontem|dias atrás)/.test(b.textContent));
    if (!btn || btn.textContent.trim() === 'Ontem') return;
    btn.click();
    await sleep(500);
    const yOpt = [...document.querySelectorAll('div,span,li')]
                 .find(e => e.textContent.trim() === 'Ontem');
    if (yOpt) {
      yOpt.click();
      await sleep(200);
    }
    const okBtn = [...document.querySelectorAll('button')]
                  .find(b => b.textContent.trim() === 'OK');
    if (okBtn) {
      okBtn.click();
      await sleep(1500);
    }
  }

  async function openRegion() {
    const regionBtn = [...document.querySelectorAll('button')]
                      .find(b => b.textContent.includes('Onde aparecem'));
    if (regionBtn) {
      regionBtn.click();
      await sleep(500);
    }
  }

  function getCountryOptions() {
    const listbox = document.querySelector('[role="listbox"]');
    return listbox ? [...listbox.querySelectorAll('[role="option"]')] : [];
  }

  function parseCount(text) {
    text = text.toLowerCase();
    if (text.includes('nenhum anúncio')) return 0;
    const mil = text.match(/([\d,.]+)\s*mil/);
    if (mil) return parseFloat(mil[1].replace(',', '.')) * 1000;
    const num = text.match(/([\d\.]+)/);
    return num ? parseInt(num[1].replace(/\./g, '')) : 0;
  }

  function readCount() {
    const el = [...document.querySelectorAll('span,div')]
               .find(e => /anúncio/.test(e.textContent));
    return el ? parseCount(el.textContent.trim()) : 0;
  }

  const results = {};
  await ensureYesterday();
  await openRegion();
  let options = getCountryOptions();
  if (!options.length) {
    alert('Não foi possível localizar a lista de países.');
    return;
  }
  for (let i = 1; i < options.length; i++) {
    const opt = options[i];
    const country = opt.textContent.trim();
    opt.click();
    await sleep(2000);
    results[country] = readCount();
    await openRegion();
    options = getCountryOptions();
  }
  const total = Object.values(results).reduce((a, b) => a + b, 0);
  const perc = Object.fromEntries(
    Object.entries(results).map(([c, v]) => [
      c,
      total ? ((v / total) * 100).toFixed(2) + '%' : '0%'
    ])
  );
  console.table(perc);
  alert('Percentual de anúncios por país (Ontem):\n' + JSON.stringify(perc, null, 2));
})();
