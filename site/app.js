/* Lab Scholar Dashboard — reads data/data.json (+ data/history.json) built by scripts/fetch.py */
(() => {
  "use strict";
  // ISO 3166 alpha-2 -> [numeric code used by the world map, short name]
  const COUNTRIES = {"AW":["533","Aruba"],"AF":["004","Afghanistan"],"AO":["024","Angola"],"AI":["660","Anguilla"],"AX":["248","Åland Islands"],"AL":["008","Albania"],"AD":["020","Andorra"],"AE":["784","United Arab Emirates"],"AR":["032","Argentina"],"AM":["051","Armenia"],"AS":["016","American Samoa"],"AQ":["010","Antarctica"],"TF":["260","French Southern Territories"],"AG":["028","Antigua and Barbuda"],"AU":["036","Australia"],"AT":["040","Austria"],"AZ":["031","Azerbaijan"],"BI":["108","Burundi"],"BE":["056","Belgium"],"BJ":["204","Benin"],"BQ":["535","Bonaire, Sint Eustatius and Saba"],"BF":["854","Burkina Faso"],"BD":["050","Bangladesh"],"BG":["100","Bulgaria"],"BH":["048","Bahrain"],"BS":["044","Bahamas"],"BA":["070","Bosnia and Herzegovina"],"BL":["652","Saint Barthélemy"],"BY":["112","Belarus"],"BZ":["084","Belize"],"BM":["060","Bermuda"],"BO":["068","Bolivia"],"BR":["076","Brazil"],"BB":["052","Barbados"],"BN":["096","Brunei"],"BT":["064","Bhutan"],"BV":["074","Bouvet Island"],"BW":["072","Botswana"],"CF":["140","Central African Republic"],"CA":["124","Canada"],"CC":["166","Cocos (Keeling) Islands"],"CH":["756","Switzerland"],"CL":["152","Chile"],"CN":["156","China"],"CI":["384","Côte d'Ivoire"],"CM":["120","Cameroon"],"CD":["180","DR Congo"],"CG":["178","Congo"],"CK":["184","Cook Islands"],"CO":["170","Colombia"],"KM":["174","Comoros"],"CV":["132","Cabo Verde"],"CR":["188","Costa Rica"],"CU":["192","Cuba"],"CW":["531","Curaçao"],"CX":["162","Christmas Island"],"KY":["136","Cayman Islands"],"CY":["196","Cyprus"],"CZ":["203","Czechia"],"DE":["276","Germany"],"DJ":["262","Djibouti"],"DM":["212","Dominica"],"DK":["208","Denmark"],"DO":["214","Dominican Republic"],"DZ":["012","Algeria"],"EC":["218","Ecuador"],"EG":["818","Egypt"],"ER":["232","Eritrea"],"EH":["732","Western Sahara"],"ES":["724","Spain"],"EE":["233","Estonia"],"ET":["231","Ethiopia"],"FI":["246","Finland"],"FJ":["242","Fiji"],"FK":["238","Falkland Islands (Malvinas)"],"FR":["250","France"],"FO":["234","Faroe Islands"],"FM":["583","Micronesia"],"GA":["266","Gabon"],"GB":["826","United Kingdom"],"GE":["268","Georgia"],"GG":["831","Guernsey"],"GH":["288","Ghana"],"GI":["292","Gibraltar"],"GN":["324","Guinea"],"GP":["312","Guadeloupe"],"GM":["270","Gambia"],"GW":["624","Guinea-Bissau"],"GQ":["226","Equatorial Guinea"],"GR":["300","Greece"],"GD":["308","Grenada"],"GL":["304","Greenland"],"GT":["320","Guatemala"],"GF":["254","French Guiana"],"GU":["316","Guam"],"GY":["328","Guyana"],"HK":["344","Hong Kong"],"HM":["334","Heard Island and McDonald Islands"],"HN":["340","Honduras"],"HR":["191","Croatia"],"HT":["332","Haiti"],"HU":["348","Hungary"],"ID":["360","Indonesia"],"IM":["833","Isle of Man"],"IN":["356","India"],"IO":["086","British Indian Ocean Territory"],"IE":["372","Ireland"],"IR":["364","Iran"],"IQ":["368","Iraq"],"IS":["352","Iceland"],"IL":["376","Israel"],"IT":["380","Italy"],"JM":["388","Jamaica"],"JE":["832","Jersey"],"JO":["400","Jordan"],"JP":["392","Japan"],"KZ":["398","Kazakhstan"],"KE":["404","Kenya"],"KG":["417","Kyrgyzstan"],"KH":["116","Cambodia"],"KI":["296","Kiribati"],"KN":["659","Saint Kitts and Nevis"],"KR":["410","South Korea"],"KW":["414","Kuwait"],"LA":["418","Laos"],"LB":["422","Lebanon"],"LR":["430","Liberia"],"LY":["434","Libya"],"LC":["662","Saint Lucia"],"LI":["438","Liechtenstein"],"LK":["144","Sri Lanka"],"LS":["426","Lesotho"],"LT":["440","Lithuania"],"LU":["442","Luxembourg"],"LV":["428","Latvia"],"MO":["446","Macao"],"MF":["663","Saint Martin (French part)"],"MA":["504","Morocco"],"MC":["492","Monaco"],"MD":["498","Moldova"],"MG":["450","Madagascar"],"MV":["462","Maldives"],"MX":["484","Mexico"],"MH":["584","Marshall Islands"],"MK":["807","North Macedonia"],"ML":["466","Mali"],"MT":["470","Malta"],"MM":["104","Myanmar"],"ME":["499","Montenegro"],"MN":["496","Mongolia"],"MP":["580","Northern Mariana Islands"],"MZ":["508","Mozambique"],"MR":["478","Mauritania"],"MS":["500","Montserrat"],"MQ":["474","Martinique"],"MU":["480","Mauritius"],"MW":["454","Malawi"],"MY":["458","Malaysia"],"YT":["175","Mayotte"],"NA":["516","Namibia"],"NC":["540","New Caledonia"],"NE":["562","Niger"],"NF":["574","Norfolk Island"],"NG":["566","Nigeria"],"NI":["558","Nicaragua"],"NU":["570","Niue"],"NL":["528","Netherlands"],"NO":["578","Norway"],"NP":["524","Nepal"],"NR":["520","Nauru"],"NZ":["554","New Zealand"],"OM":["512","Oman"],"PK":["586","Pakistan"],"PA":["591","Panama"],"PN":["612","Pitcairn"],"PE":["604","Peru"],"PH":["608","Philippines"],"PW":["585","Palau"],"PG":["598","Papua New Guinea"],"PL":["616","Poland"],"PR":["630","Puerto Rico"],"KP":["408","North Korea"],"PT":["620","Portugal"],"PY":["600","Paraguay"],"PS":["275","Palestine"],"PF":["258","French Polynesia"],"QA":["634","Qatar"],"RE":["638","Réunion"],"RO":["642","Romania"],"RU":["643","Russia"],"RW":["646","Rwanda"],"SA":["682","Saudi Arabia"],"SD":["729","Sudan"],"SN":["686","Senegal"],"SG":["702","Singapore"],"GS":["239","South Georgia and the South Sandwich Islands"],"SH":["654","Saint Helena, Ascension and Tristan da Cunha"],"SJ":["744","Svalbard and Jan Mayen"],"SB":["090","Solomon Islands"],"SL":["694","Sierra Leone"],"SV":["222","El Salvador"],"SM":["674","San Marino"],"SO":["706","Somalia"],"PM":["666","Saint Pierre and Miquelon"],"RS":["688","Serbia"],"SS":["728","South Sudan"],"ST":["678","Sao Tome and Principe"],"SR":["740","Suriname"],"SK":["703","Slovakia"],"SI":["705","Slovenia"],"SE":["752","Sweden"],"SZ":["748","Eswatini"],"SX":["534","Sint Maarten (Dutch part)"],"SC":["690","Seychelles"],"SY":["760","Syria"],"TC":["796","Turks and Caicos Islands"],"TD":["148","Chad"],"TG":["768","Togo"],"TH":["764","Thailand"],"TJ":["762","Tajikistan"],"TK":["772","Tokelau"],"TM":["795","Turkmenistan"],"TL":["626","Timor-Leste"],"TO":["776","Tonga"],"TT":["780","Trinidad and Tobago"],"TN":["788","Tunisia"],"TR":["792","Türkiye"],"TV":["798","Tuvalu"],"TW":["158","Taiwan"],"TZ":["834","Tanzania"],"UG":["800","Uganda"],"UA":["804","Ukraine"],"UM":["581","United States Minor Outlying Islands"],"UY":["858","Uruguay"],"US":["840","United States"],"UZ":["860","Uzbekistan"],"VA":["336","Holy See (Vatican City State)"],"VC":["670","Saint Vincent and the Grenadines"],"VE":["862","Venezuela"],"VG":["092","Virgin Islands, British"],"VI":["850","Virgin Islands, U.S."],"VN":["704","Vietnam"],"VU":["548","Vanuatu"],"WF":["876","Wallis and Futuna"],"WS":["882","Samoa"],"YE":["887","Yemen"],"ZA":["710","South Africa"],"ZM":["894","Zambia"],"ZW":["716","Zimbabwe"]};
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => (n == null ? "–" : Number(n).toLocaleString("en-US"));
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  let D, H = [], THIS_YEAR, LAST_YEAR;
  const byId = {}, members = {}, charts = {};
  const rendered = {};

  // ------------------------------------------------------------ load
  // The 'since' view (data-since.json) is built when lab.yaml sets lab -> since. ?from=2020 asks for it,
  // ?from=all for every year; with neither, lab -> since -> default decides which one opens.
  const QP = new URLSearchParams(location.search).get("from");
  let FROM = null, DEFAULT_FROM = null;
  const sinceCfg = (d) => { const c = (d?.lab || {}).since; return c && typeof c === "object" ? c : { year: c }; };
  const getJson = (f) => fetch(f, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  (async () => {
    // the two small history files load alongside the main data instead of after it
    const hist = { all: getJson("data/history.json"), since: QP === "all" ? null : getJson("data/history-since.json") };
    let d = QP === "all" ? null : await getJson("data/data-since.json");
    if (d && sinceCfg(d).default) DEFAULT_FROM = d.period?.from || Number(sinceCfg(d).year) || null;
    if (d && (Number(QP) || DEFAULT_FROM)) FROM = d.period?.from || Number(QP);
    else d = null;
    if (QP && QP !== "all" && !FROM) history.replaceState(null, "", location.pathname + location.hash);  // not built yet
    const h = await (FROM ? hist.since : hist.all);
    d = d || await getJson("data/data.json");
    if (!d) throw new Error("data.json not found");
    return [d, h || []];
  })().then(([d, h]) => {
    D = d; H = h;
    if (sinceCfg(D).default) DEFAULT_FROM = Number(sinceCfg(D).year) || DEFAULT_FROM;
    THIS_YEAR = Number((D.generated_at || "").slice(0, 4)) || new Date().getFullYear();
    LAST_YEAR = THIS_YEAR - 1;
    D.works.forEach((w) => (byId[w.id] = w));
    D.members.forEach((m) => (members[m.slug] = m));
    init();
  }).catch((e) => {
    document.body.classList.remove("loading");
    $("main").innerHTML = `<div class="card"><h3>No data yet</h3><p class="muted">${esc(e.message)}. Run <code>python scripts/fetch.py</code> (or the GitHub Action) to generate it.</p></div>`;
  });

  function init() {
    document.body.classList.remove("loading");
    const lab = D.lab || {};
    document.title = lab.name ? `${lab.name} · Publications` : document.title;
    const [main, ...rest] = String(lab.name || "Lab dashboard").split(/,\s*/);
    $("#lab-name").innerHTML = esc(main) + (rest.length ? `<span class="sub">${esc(rest.join(", "))}</span>` : "");
    $("#lab-inst").textContent = lab.institution || "";
    $("#lab-desc").textContent = lab.description || "";
    if (lab.expert) { $("#lab-expert").href = lab.expert; $("#lab-expert").hidden = false; }
    $("#lab-updated").textContent = `Updated ${new Date(D.generated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
    const nGs = D.members.filter((m) => m.source === "Google Scholar").length;
    const stale = D.members.filter((m) => m.scholar_outdated).map((m) => m.name);
    $("#foot").innerHTML = FROM && nGs + stale.length === D.members.length
      ? `Citation numbers from each member's Google Scholar profile${stale.length ? ` (except ${esc(stale.join(", "))}: the Scholar profile lists nothing from ${FROM} on, so OpenAlex is used, with a co-author's Scholar count where there is one)` : ""}; venues and the collaboration network from <a href="https://openalex.org">OpenAlex</a>. Updated ${esc(D.generated_at.slice(0, 10))}.`
      : nGs === D.members.length
      ? `Citation numbers from each member's Google Scholar profile; venues and the collaboration network from <a href="https://openalex.org">OpenAlex</a>. Updated ${esc(D.generated_at.slice(0, 10))}.`
      : nGs
      ? `Members marked <span class="tag">GS</span> show their Google Scholar numbers; everyone else, and the lab totals, use <a href="https://openalex.org">OpenAlex</a>, which usually counts fewer citations. Add a Scholar link to a member in lab.yaml to switch them over. Updated ${esc(D.generated_at.slice(0, 10))}.`
      : `Data from <a href="https://openalex.org">OpenAlex</a>, updated ${esc(D.generated_at.slice(0, 10))}. ` +
        `Citation counts are usually somewhat lower than Google Scholar's, which also counts preprints, theses and some duplicates. ` +
        `Per-year citations cover roughly the last ten years.`;
    // a one-line summary under the title, from the data (unless lab.yaml sets a description)
    if (!lab.description && D.themes?.items?.length) {
      const s = D.summary, nCountries = D.citing ? new Set(Object.values(D.citing.by_year).flatMap(Object.keys)).size : null;
      const th = D.themes.items.slice().sort((a, b) => b.m.length - a.m.length || b.n - a.n).slice(0, 2).map((t, i) => (i ? t.label.charAt(0).toLowerCase() + t.label.slice(1) : t.label));
      $("#lab-desc").textContent = `${D.members.length} academics publishing on ${th.join(" and ")}, and more: ${fmt(s.works)} papers${FROM ? ` since ${FROM}` : ""}, ${fmt(s.citations)} citations${nCountries ? `, cited in ${nCountries} countries` : ""}.`;
    }
    renderPeriod();
    // lab.yaml: lab -> maintainer: {name, email}
    const mt = lab.maintainer;
    if (mt && (mt.name || mt.email)) {
      const who = mt.email ? `<a href="mailto:${esc(mt.email)}">${esc(mt.name || mt.email)}</a>` : esc(mt.name);
      $("#lab-contact").innerHTML = `Maintained by ${who}${mt.name && mt.email ? ` (${esc(mt.email)})` : ""}. ` +
        `Please get in touch with any questions or requests to update this page.`;
      $("#lab-contact").hidden = false;
    }
    if (FROM) $("#foot").insertAdjacentHTML("beforeend", ` <br>${FROM} onwards: only papers published in or after ${FROM}, with their citations. ` +
      `Citations per year are estimated from OpenAlex's yearly pattern for each paper, scaled to its Google Scholar count. ` +
      `Papers that OpenAlex dates ${FROM} or later but that were already being cited years before (usually a later repository copy) count as older work.`);
    window.addEventListener("hashchange", route);
    route();
  }

  // ------------------------------------------------------------ all years / since <year>
  function renderPeriod() {
    const cfg = (D.lab || {}).since;
    const y = FROM || Number(typeof cfg === "object" ? cfg?.year : cfg) || null;
    const el = $("#lab-period");
    if (!y || !el) return;
    const why = (typeof cfg === "object" && cfg?.reason) || "";
    el.innerHTML = `<span class="seg" role="group" aria-label="Which papers to count">` +
      `<button type="button" data-from="" class="${FROM ? "" : "on"}" aria-pressed="${!FROM}">All years</button>` +
      `<button type="button" data-from="${y}" class="${FROM ? "on" : ""}" aria-pressed="${!!FROM}">${y} onwards</button></span>` +
      `<span class="period-note">${FROM
        ? `Showing only work published from ${y} onwards${why ? `, ${esc(why)}` : ""}. Switch to <b>All years</b> for everyone's full publication record.`
        : `Showing all work published by the individuals listed here. To see only work published from ${y} onwards${why ? `, ${esc(why)}` : ""}, switch to <b>${y} onwards</b>.`}</span>`;
    el.hidden = false;
    el.querySelectorAll("button").forEach((b) => (b.onclick = () => {
      const want = Number(b.dataset.from) || null;
      if (want === FROM) return;
      // the default view gets the plain address; the other one says so in the link (?from=2020 or ?from=all)
      const q = want === DEFAULT_FROM ? "" : `?from=${want || "all"}`;
      location.href = location.pathname + q + location.hash;
    }));
  }

  // ------------------------------------------------------------ routing
  function route() {
    const [tab, arg] = (location.hash.slice(1) || "overview").split("/");
    const t0 = tab === "network" ? "analytics" : tab;   // old links keep working
    const t = ["overview", "member", "analytics", "venues", "papers"].includes(t0) ? t0 : "overview";
    document.querySelectorAll(".tab").forEach((s) => (s.hidden = s.id !== `tab-${t}`));
    document.querySelectorAll("#tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === t));
    if (t === "overview" && !rendered.overview) renderOverview();
    if (t === "member") renderMember(arg ? decodeURIComponent(arg) : null);
    if (t === "analytics") { renderNetwork(arg ? decodeURIComponent(arg) : null); renderSankey(); }
    else NET?.pause();
    if (t === "venues" && !rendered.venues) renderVenues();
    if (t === "papers" && !rendered.papers) renderPapers();
    rendered[t] = true;
  }

  // ------------------------------------------------------------ small components
  function kpis(el, items) {
    el.innerHTML = items.map(([v, l, s]) =>
      `<div class="kpi"><div class="v">${v}</div><div class="l">${esc(l)}</div>${s ? `<div class="s">${s}</div>` : ""}</div>`).join("");
  }

  function hbars(el, rows, max = 10) {
    rows = rows.slice(0, max);
    if (!rows.length) { el.innerHTML = `<p class="empty">Nothing to show yet.</p>`; return; }
    const top = Math.max(...rows.map((r) => r.count));
    el.innerHTML = `<div class="hbars">${rows.map((r) => `
      <div class="hbar" title="${esc(r.name)}: ${r.count} paper${r.count === 1 ? "" : "s"}">
        <div class="name">${esc(r.name)} ${r.type ? `<span class="tag">${esc(r.type)}</span>` : ""}</div>
        <div class="n">${fmt(r.count)}</div>
        <div class="track"><span style="width:${(100 * r.count) / top}%"></span></div>
      </div>`).join("")}</div>`;
  }

  // Sortable table. cols: {key,label,num,html(row),val(row)}
  function table(el, cols, rows, opts = {}) {
    let sortKey = opts.sort || cols[0].key, dir = opts.dir || "desc", limit = opts.limit || 0, showAll = false;
    const val = (c, r) => (c.val ? c.val(r) : r[c.key]);
    function draw() {
      const c = cols.find((x) => x.key === sortKey);
      const sorted = rows.slice().sort((a, b) => {
        const x = val(c, a), y = val(c, b);
        const cmp = typeof x === "string" ? x.localeCompare(y) : (x ?? -1) - (y ?? -1);
        return dir === "asc" ? cmp : -cmp;
      });
      const shown = limit && !showAll ? sorted.slice(0, limit) : sorted;
      el.innerHTML = `<thead><tr>${cols.map((c) =>
        `<th data-k="${c.key}" class="${c.num ? "num" : ""}" ${c.key === sortKey ? `data-dir="${dir}"` : ""}>${esc(c.label)}</th>`).join("")}</tr></thead>
        <tbody>${shown.map((r, i) => `<tr data-i="${i}" class="${opts.onClick ? "click" : ""}">${cols.map((c) =>
          `<td class="${c.num ? "num" : ""} ${c.cls || ""}">${c.html ? c.html(r) : esc(r[c.key])}</td>`).join("")}</tr>`).join("") ||
          `<tr><td colspan="${cols.length}" class="empty">No matching rows.</td></tr>`}</tbody>`;
      if (limit && sorted.length > limit) {
        el.insertAdjacentHTML("beforeend", `<tfoot><tr><td colspan="${cols.length}"><a href="#" class="more">${showAll ? "Show fewer" : `Show all ${fmt(sorted.length)}`}</a></td></tr></tfoot>`);
        el.querySelector(".more").onclick = (e) => { e.preventDefault(); showAll = !showAll; draw(); };
      }
      el.querySelectorAll("th").forEach((th) => (th.onclick = () => {
        if (sortKey === th.dataset.k) dir = dir === "asc" ? "desc" : "asc";
        else { sortKey = th.dataset.k; dir = cols.find((c) => c.key === sortKey).num ? "desc" : "asc"; }
        draw();
      }));
      if (opts.onClick) el.querySelectorAll("tbody tr[data-i]").forEach((tr) => (tr.onclick = () => opts.onClick(shown[tr.dataset.i])));
    }
    draw();
    return { update(newRows) { rows = newRows; draw(); } };
  }

  // ------------------------------------------------------------ charts
  function yearLabels(years) { return years.map((y) => (Number(y) === THIS_YEAR ? `${y} (so far)` : String(y))); }

  function chart(id, type, labels, values, opts = {}) {
    if (!window.Chart) return;
    charts[id]?.destroy();
    const accent = css("--accent"), soft = css("--accent-soft"), grid = css("--grid"), muted = css("--muted");
    const ds = type === "bar"
      ? { data: values, backgroundColor: labels.map((l) => (String(l).includes("so far") ? soft : accent)),
          borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: "bottom", maxBarThickness: 32, categoryPercentage: 0.8, barPercentage: 0.9 }
      : { data: values, borderColor: accent, backgroundColor: accent, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.25, fill: false };
    charts[id] = new Chart(document.getElementById(id), {
      type, data: { labels, datasets: [{ label: opts.label || "", ...ds }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false },
          tooltip: { displayColors: false, callbacks: { label: (c) => `${fmt(c.parsed.y)} ${opts.unit || ""}`.trim() } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: muted, maxRotation: 0, autoSkip: true }, border: { color: grid } },
          y: { beginAtZero: true, grid: { color: grid }, border: { display: false }, ticks: { color: muted, precision: 0, callback: (v) => fmt(v) } },
        },
      },
    });
  }

  // Citations this year so far vs all of last year, plus the pace this year is on (projected to a full
  // year from today's date). Pace is only shown once a fifth of the year has passed.
  function momentum(cby) {
    const now = cby[String(THIS_YEAR)] || 0, last = cby[String(LAST_YEAR)] || 0;
    const d = new Date(D.generated_at), start = Date.UTC(THIS_YEAR, 0, 1);
    const frac = Math.min(1, Math.max(0, (d - start) / (365.25 * 864e5)));
    const projected = frac > 0 ? Math.round(now / frac) : null;
    const pace = frac >= 0.2 && last >= 10 ? Math.round(((projected - last) / last) * 100) : null;  // tiny bases swing wildly
    return { now, last, projected, pace };
  }
  const paceHtml = (k) => (k.pace == null ? "" :
    `<span class="${k.pace >= 0 ? "pos" : ""}" title="On pace for about ${fmt(k.projected)} citations in ${THIS_YEAR}">${k.pace >= 0 ? "+" : ""}${k.pace}%</span>`);

  function fillYears(obj, years) { return years.map((y) => obj[String(y)] || 0); }

  // ------------------------------------------------------------ overview
  function renderOverview() {
    const s = D.summary;
    const mo = momentum(s.cites_by_year);
    const nt = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const papersIn = (yr) => { const t = new Set(); D.works.forEach((w) => w.year === yr && t.add(nt(w.title)));
      D.members.forEach((m) => (m.scholar_papers || []).forEach((p) => p.year === yr && t.add(nt(p.title)))); return t.size; };
    const nCountries = D.citing ? new Set(Object.values(D.citing.by_year).flatMap(Object.keys)).size : null;
    const box = (v, l, s2) => `<div class="kpi"><div class="v">${v}</div><div class="l">${l}</div><div class="s2">${s2}</div></div>`;
    $("#lab-kpis").innerHTML = [
      box(fmt(s.works), "Papers", `<b>${fmt(papersIn(THIS_YEAR))}</b> in ${THIS_YEAR} so far · ${fmt(papersIn(LAST_YEAR))} in ${LAST_YEAR}`),
      box(fmt(s.citations), "Citations", `<b>+${fmt(mo.now)}</b> in ${THIS_YEAR} so far${mo.pace == null ? "" : ` · on pace for ${paceHtml(mo)}`}`),
      box(fmt(s.h), "h-index", `i10-index <b>${fmt(s.i10)}</b>`),
      nCountries != null ? box(fmt(nCountries), "Countries citing us", FROM ? `${FROM} onwards` : "all time") : box(fmt(s.external_collaborators), "Outside collaborators", FROM ? `${FROM} onwards` : "all time"),
      box(fmt(D.members.length), "Members", `<b>${fmt(s.external_collaborators)}</b> outside co-authors`),
    ].join("");
    renderHighlights();
    renderCitations();
    renderOutput();
    renderTogether();
    if (H.length >= 2) {
      $("#history-card").hidden = false;
      chart("c-history", "line", H.map((h) => h.date), H.map((h) => h.lab.citations), { unit: "citations" });
    }
    const kinds = {};
    D.works.forEach((w) => w.lab.forEach((sl) => { const k = (kinds[sl] ||= {}); k[w.kind] = (k[w.kind] || 0) + 1; }));
    const kindN = (m, k) => (kinds[m.slug] || {})[k] || 0;
    const y3 = `’${String(THIS_YEAR - 2).slice(2)}–’${String(THIS_YEAR).slice(2)}`;
    const cols = [
      { key: "name", label: "Name", html: (m) => `<a href="#member/${m.slug}">${esc(m.name)}</a> ${m.source === "Google Scholar" ? '<span class="tag" title="Numbers from Google Scholar">GS</span>' : ""}<div class="sub">${esc(m.role || "")}</div>` },
      { key: "works", label: "Papers", num: true, html: (m) => fmt(m.works) },
      { key: "jn", label: "Journal", num: true, val: (m) => kindN(m, "Journal"), html: (m) => `<span title="Journal papers (OpenAlex plus papers only on Google Scholar), types checked against venues.yaml">${fmt(kindN(m, "Journal"))}</span>` },
      { key: "cf", label: "Conf.", num: true, val: (m) => kindN(m, "Conference"), html: (m) => `<span title="Conference papers (OpenAlex plus papers only on Google Scholar), types checked against venues.yaml">${fmt(kindN(m, "Conference"))}</span>` },
      { key: "citations", label: "Citations", num: true, html: (m) => fmt(m.citations) },
      { key: "h", label: "h-index", num: true },
      { key: "i10", label: "i10", num: true },
      { key: "p3", label: `Papers ${y3}`, num: true, val: (m) => last3(m.pubs_by_year), html: (m) => fmt(last3(m.pubs_by_year)) },
      { key: "c3", label: `Cites ${y3}`, num: true, val: (m) => last3(m.cites_by_year), html: (m) => fmt(last3(m.cites_by_year)) },
      { key: "pace", label: "Pace", num: true, val: (m) => momentum(m.cites_by_year).pace ?? -1e9,
        html: (m) => { const k = momentum(m.cites_by_year); return `<span title="${fmt(k.last)} citations in ${LAST_YEAR}, ${fmt(k.now)} so far in ${THIS_YEAR}">${paceHtml(k) || "–"}</span>`; } },
      { key: "next", label: "To next h", num: true, val: (m) => -(m.h_watch.citations_needed || 999),
        html: (m) => !m.works ? "–" : m.h_watch.papers.length < m.h_watch.papers_needed
          ? `<span class="muted" title="Needs another paper: h=${m.h_watch.target} takes ${m.h_watch.target} papers">new paper</span>`
          : `<span title="${m.h_watch.papers_needed} paper(s) need ${m.h_watch.citations_needed} more citations to reach h=${m.h_watch.target}">${m.h_watch.citations_needed} cite${m.h_watch.citations_needed === 1 ? "" : "s"}</span>` },
    ];
    table($("#members-table"), cols, D.members, { sort: "c3", onClick: (m) => (location.hash = `member/${m.slug}`) });
    renderThemes();
    renderHeatmap();
    renderMap();
  }

  function last3(by) { return [0, 1, 2].reduce((t, i) => t + ((by || {})[String(THIS_YEAR - i)] || 0), 0); }

  // ------------------------------------------------------------ this year so far
  function renderThisYear(mo) {
    const nt = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    // papers: Scholar lists plus OpenAlex (stale Scholar profiles miss recent papers), each title once
    const papersIn = (yr) => {
      const titles = new Set();
      D.members.forEach((m) => (m.scholar_papers || []).forEach((p) => p.year === yr && titles.add(nt(p.title))));
      D.works.forEach((w) => w.year === yr && titles.add(nt(w.title)));
      return titles.size;
    };
    const papersNow = papersIn(THIS_YEAR), papersLast = papersIn(LAST_YEAR);
    // first-time collaborators and team partnerships this year
    const firstYear = (y) => Math.min(...Object.keys(y || {}).map(Number));
    const newCo = D.network.nodes.filter((n) => !n.lab && firstYear(n.y) === THIS_YEAR).length;
    const pairFirst = {};
    D.works.forEach((w) => { const ks = w.lab.slice().sort(); for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
      const k = `${ks[i]}|${ks[j]}`; pairFirst[k] = Math.min(pairFirst[k] || 9999, w.year || 9999); } });
    const newPairs = Object.values(pairFirst).filter((y) => y === THIS_YEAR).length;
    const items = [
      [fmt(mo.now), "Citations received", `${fmt(mo.last)} in all of ${LAST_YEAR}${mo.pace == null ? "" : ` · on pace for ${paceHtml(mo)}`}`],
      [fmt(papersNow), "Papers published", `${fmt(papersLast)} in all of ${LAST_YEAR}`],
      [fmt(newCo), "New outside co-authors", "first paper with the team this year"],
      [fmt(newPairs), "New team partnerships", "members publishing together for the first time"],
    ];
    const cy = D.citing?.by_year?.[String(THIS_YEAR)];
    if (cy) items.push([fmt(Object.keys(cy).length), "Countries citing us", `this year`]);
    $("#year-title").textContent = `${THIS_YEAR} so far`;
    $("#year-sub").textContent = `Up to ${new Date(D.generated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
    kpis($("#year-kpis"), items);
  }

  // ------------------------------------------------------------ overview: new sections
  const isTopRank = (r) => /^(Q1|Q2|A\*|A)$/.test(r || "");
  function rankBadge(w) {
    if (w.rank !== undefined) {   // set for this one paper in venues.yaml
      return w.rank ? `<span class="badge ${isTopRank(w.rank) ? "hi" : ""}" title="${esc(w.rank)} · set for this paper in venues.yaml">${esc(w.rank)}</span>`
        : `<span class="badge none" title="Unranked (set for this paper in venues.yaml)">—</span>`;
    }
    const v = (D.venues || {})[w.vkey] || {};
    if (!v.rank) return `<span class="badge none" title="Unranked venue">—</span>`;
    const label = (v.src || "").startsWith("CORE journals") ? `CORE ${v.rank}` : v.rank;
    return `<span class="badge ${isTopRank(v.rank) && !label.startsWith("CORE") ? "hi" : ""} ${v.verified ? "" : "uv"}" title="${esc(label)} · ${esc(v.src || "")}${v.verified ? "" : " (not yet verified)"}">${esc(label)}</span>`;
  }
  const wCites = (w) => (w.gs_c ?? w.cited_by_count) || 0;
  const oaNum = (w) => { const m = /^W(\d+)/.exec(w.id || ""); return m ? +m[1] : 0; };

  function renderHighlights() {
    const item = (w, showC) => `<li><div>${rankBadge(w)}</div><div><div class="t">${paperLink(w)}</div>
      <div class="m">${esc(w.lab.map((s) => members[s]?.name || s).join(", "))}${w.venue ? ` · <i>${esc(w.venue)}</i>` : ""} · ${w.year}${showC ? ` · <span class="c">${fmt(wCites(w))} citation${wCites(w) === 1 ? "" : "s"}</span>` : ""}</div></div></li>`;
    // 'older' = an older paper with a later date (e.g. a repository copy), as in the 2020-onwards view
    const latest = D.works.filter((w) => w.year && !w.older).sort((a, b) => b.year - a.year || oaNum(b) - oaNum(a)).slice(0, 8);
    $("#hl-latest").innerHTML = latest.map((w) => item(w, false)).join("");
    const top = D.works.filter((w) => w.year >= THIS_YEAR - 2 && !w.older).sort((a, b) => wCites(b) - wCites(a)).slice(0, 6);
    $("#hl-top-title").textContent = `Most cited recent work (${THIS_YEAR - 2}–${THIS_YEAR})`;
    $("#hl-top").innerHTML = top.map((w) => item(w, true)).join("");
  }

  const d3tip = (ev, html) => { const t = $("#tooltip"); t.hidden = false; t.innerHTML = html; t.style.left = `${Math.min(ev.clientX + 14, innerWidth - 300)}px`; t.style.top = `${ev.clientY + 14}px`; };
  const d3untip = () => ($("#tooltip").hidden = true);

  function renderCitations() {
    const s = D.summary, host = $("#cit-chart");
    if (!window.d3) return;
    const yrs = (s.years || D.years).map(Number);
    const cNow = s.cites_by_year[String(THIS_YEAR)] || 0, cLast = s.cites_by_year[String(LAST_YEAR)] || 0;
    const W = Math.max(320, host.clientWidth || 900), H = 260, M = { t: 10, r: 10, b: 26, l: 52 };
    host.innerHTML = "";
    const svg = d3.select(host).append("svg").attr("viewBox", [0, 0, W, H]);
    const x = d3.scaleBand().domain(yrs).range([M.l, W - M.r]).padding(0.22), y = d3.scaleLinear().range([H - M.b, M.t]);
    const step = Math.ceil(yrs.length / Math.max(4, Math.floor(W / 90)));
    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).tickValues(yrs.filter((v) => (THIS_YEAR - v) % step === 0)).tickFormat((v) => (v === THIS_YEAR ? `${v} (so far)` : v)).tickSizeOuter(0));
    const gy = svg.append("g").attr("class", "axis").attr("transform", `translate(${M.l},0)`);
    const bars = svg.append("g"), line = svg.append("path").attr("fill", "none").attr("stroke-width", 2), dots = svg.append("g");
    function draw(mode) {
      const vals = yrs.map((v) => (mode === "new" ? s.cites_by_year[String(v)] || 0 : s.cumulative[String(v)] ?? null));
      y.domain([0, (d3.max(vals) || 1) * 1.08]).nice();
      gy.transition().duration(500).call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",")).tickSize(-(W - M.l - M.r))).call((g) => g.select(".domain").remove());
      const T = d3.transition().duration(600);
      bars.selectAll("rect").data(yrs).join("rect").attr("x", (v) => x(v)).attr("width", x.bandwidth()).attr("rx", 3)
        .attr("fill", (v) => (v === THIS_YEAR ? css("--accent-soft") : css("--accent")))
        .transition(T).attr("y", (v, i) => (mode === "new" ? y(vals[i]) : H - M.b)).attr("height", (v, i) => (mode === "new" ? H - M.b - y(vals[i]) : 0));
      const pts = yrs.map((v, i) => [x(v) + x.bandwidth() / 2, vals[i]]).filter((p) => p[1] != null);
      line.attr("stroke", css("--accent")).transition(T).attr("d", d3.line()(pts.map((p) => [p[0], y(p[1])]))).style("opacity", mode === "total" ? 1 : 0);
      dots.selectAll("circle").data(pts).join("circle").attr("r", 4).attr("fill", css("--accent")).attr("stroke", css("--surface")).attr("stroke-width", 2)
        .transition(T).attr("cx", (p) => p[0]).attr("cy", (p) => y(p[1])).style("opacity", mode === "total" ? 1 : 0);
      $("#cit-note").textContent = mode === "new"
        ? `Citations received each year: ${fmt(cNow)} so far in ${THIS_YEAR}, ${fmt(cLast)} in all of ${LAST_YEAR}.${FROM ? ` Citations to papers from ${FROM} on, per year estimated (see the note at the bottom).` : s.source === "Google Scholar" ? " Sum of members' Scholar profiles." : ""}`
        : `Total citations at the end of each year: ${fmt(s.citations)} today.`;
    }
    svg.selectAll(".hit").data(yrs).join("rect").attr("class", "hit").attr("x", (v) => x(v) - (x.step() * x.paddingInner()) / 2).attr("width", x.step())
      .attr("y", M.t).attr("height", H - M.t - M.b).attr("fill", "transparent")
      .on("mousemove", (ev, v) => d3tip(ev, `<b>${v}${v === THIS_YEAR ? " (so far)" : ""}</b><br>${fmt(s.cites_by_year[String(v)] || 0)} new citations${s.cumulative[String(v)] != null ? `<br>${fmt(s.cumulative[String(v)])} in total` : ""}`))
      .on("mouseleave", d3untip);
    let mode = "new";
    draw(mode);
    document.querySelectorAll("#cit-mode button").forEach((b) => (b.onclick = () => {
      mode = b.dataset.m; document.querySelectorAll("#cit-mode button").forEach((x) => x.classList.toggle("on", x === b)); draw(mode);
    }));
  }

  function renderOutput() {
    if (!window.d3) return;
    const K = ["Journal", "Conference", "Book / chapter", "Preprint / repository"];
    const yrs = d3.range(Math.max(THIS_YEAR - 9, FROM || 0), THIS_YEAR + 1);
    const mix = Object.fromEntries(yrs.map((v) => [v, Object.fromEntries(K.map((k) => [k, 0]))]));
    D.works.forEach((w) => { if (mix[w.year] && mix[w.year][w.kind] != null) mix[w.year][w.kind]++; });
    $("#mix-legend").innerHTML = K.map((k) => `<span><i class="sw" style="background:var(${KIND_COL[k]})"></i>${k}</span>`).join("");
    const host = $("#mix-chart"), W = Math.max(320, host.clientWidth || 760), H = 240, M = { t: 10, r: 8, b: 26, l: 40 };
    host.innerHTML = "";
    const svg = d3.select(host).append("svg").attr("viewBox", [0, 0, W, H]);
    const x = d3.scaleBand().domain(yrs).range([M.l, W - M.r]).padding(0.25), y = d3.scaleLinear().range([H - M.b, M.t]);
    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).tickFormat((v) => (v === THIS_YEAR ? `${v}*` : W < 500 ? `’${String(v).slice(2)}` : v)).tickSizeOuter(0));
    const gy = svg.append("g").attr("class", "axis").attr("transform", `translate(${M.l},0)`), g = svg.append("g");
    function draw(mode) {
      const rows = yrs.map((v) => { const t = d3.sum(K, (k) => mix[v][k]); return { year: v, tot: t, ...Object.fromEntries(K.map((k) => [k, mode === "n" ? mix[v][k] : t ? mix[v][k] / t : 0])) }; });
      y.domain([0, mode === "n" ? (d3.max(rows, (r) => r.tot) || 1) * 1.08 : 1]).nice();
      gy.transition().duration(500).call(d3.axisLeft(y).ticks(5).tickFormat(mode === "n" ? d3.format("d") : d3.format(".0%")).tickSize(-(W - M.l - M.r))).call((s) => s.select(".domain").remove());
      g.selectAll("g.l").data(d3.stack().keys(K)(rows)).join("g").attr("class", "l").attr("fill", (d) => css(KIND_COL[d.key]))
        .selectAll("rect").data((d) => d).join("rect").attr("x", (d) => x(d.data.year)).attr("width", x.bandwidth()).attr("rx", 2)
        .on("mousemove", (ev, d) => d3tip(ev, `<b>${d.data.year}${d.data.year === THIS_YEAR ? " (so far)" : ""}</b><br>${K.map((k) => `${k}: ${fmt(mix[d.data.year][k])}`).join("<br>")}`))
        .on("mouseleave", d3untip)
        .transition().duration(600).attr("y", (d) => y(d[1]) + 1).attr("height", (d) => Math.max(0, y(d[0]) - y(d[1]) - 2));
    }
    draw("n");
    document.querySelectorAll("#mix-mode button").forEach((b) => (b.onclick = () => {
      document.querySelectorAll("#mix-mode button").forEach((x) => x.classList.toggle("on", x === b)); draw(b.dataset.m);
    }));
    // venue quality (last 5 years)
    const from = THIS_YEAR - 4, R = D.works.filter((w) => w.year >= from);
    const jn = R.filter((w) => w.kind === "Journal"), cf = R.filter((w) => w.kind === "Conference");
    const ranked = (ws) => ws.filter((w) => !/^Unranked/.test(w.tier || "Unranked"));
    const jR = ranked(jn), cR = ranked(cf);
    const jTop = jn.filter((w) => ["Q1 journals", "Q2 journals"].includes(w.tier)).length, cTop = cf.filter((w) => ["A* conferences", "A conferences"].includes(w.tier)).length;
    $("#q-note").textContent = `Papers since ${from}. SCImago quartiles for journals, ICORE ranks for conferences.`;
    const row = (lbl, top, rk, all, col) => `<div class="qrow"><div class="big">${rk ? Math.round((100 * top) / rk) + "%" : "–"}</div><div class="lbl">${lbl}</div>
      <div class="qbar"><span style="width:${all ? (100 * top) / all : 0}%;background:var(${col})"></span><span style="width:${all ? (100 * (rk - top)) / all : 0}%;background:var(${col});opacity:.4"></span><span style="flex:1;background:var(--grid)"></span></div>
      <div class="sub">${top} top-tier · ${rk - top} other ranked · ${all - rk} not ranked (of ${all})</div></div>`;
    $("#qual").innerHTML = row("of ranked journal papers are Q1–Q2", jTop, jR.length, jn.length, "--s1") + row("of ranked conference papers are A* or A", cTop, cR.length, cf.length, "--s2");
  }

  function renderTogether() {
    if (!window.d3) return;
    const yrs = d3.range(Math.max(THIS_YEAR - 9, FROM || 0), THIS_YEAR + 1);
    const joint = Object.fromEntries(yrs.map((v) => [v, 0])), all = Object.fromEntries(yrs.map((v) => [v, 0]));
    D.works.forEach((w) => { if (all[w.year] != null) { all[w.year]++; if (w.lab.length >= 2) joint[w.year]++; } });
    const host = $("#joint-chart"), W = Math.max(320, host.clientWidth || 760), H = 200, M = { t: 16, r: 8, b: 26, l: 32 };
    host.innerHTML = "";
    const svg = d3.select(host).append("svg").attr("viewBox", [0, 0, W, H]);
    const x = d3.scaleBand().domain(yrs).range([M.l, W - M.r]).padding(0.3), y = d3.scaleLinear().domain([0, (d3.max(yrs, (v) => joint[v]) || 1) * 1.15]).nice().range([H - M.b, M.t]);
    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - M.b})`).call(d3.axisBottom(x).tickFormat((v) => (v === THIS_YEAR ? `${v}*` : W < 500 ? `’${String(v).slice(2)}` : v)).tickSizeOuter(0));
    svg.append("g").attr("class", "axis").attr("transform", `translate(${M.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d3.format("d")).tickSize(-(W - M.l - M.r))).call((s) => s.select(".domain").remove());
    svg.append("g").selectAll("rect").data(yrs).join("rect").attr("x", (v) => x(v)).attr("width", x.bandwidth()).attr("rx", 3).attr("fill", css("--accent")).attr("y", H - M.b).attr("height", 0)
      .on("mousemove", (ev, v) => d3tip(ev, `<b>${v}${v === THIS_YEAR ? " (so far)" : ""}</b><br>${joint[v]} joint paper${joint[v] === 1 ? "" : "s"} · ${all[v] ? Math.round((100 * joint[v]) / all[v]) : 0}% of the team's papers`))
      .on("mouseleave", d3untip)
      .transition().duration(700).delay((v, i) => i * 40).attr("y", (v) => y(joint[v])).attr("height", (v) => H - M.b - y(joint[v]));
    svg.append("g").selectAll("text").data(yrs.filter((v) => joint[v])).join("text").attr("x", (v) => x(v) + x.bandwidth() / 2).attr("y", (v) => y(joint[v]) - 5)
      .attr("text-anchor", "middle").attr("font-size", 11).attr("fill", css("--text-2")).text((v) => joint[v]);
    const from = THIS_YEAR - 4, pairs = {};
    D.works.forEach((w) => { if (w.year >= from) { const ks = w.lab.slice().sort(); for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) { const k = ks[i] + "|" + ks[j]; pairs[k] = (pairs[k] || 0) + 1; } } });
    const top = Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 5);
    $("#pairs-note").textContent = `Papers written together since ${from}.`;
    $("#pairs").innerHTML = top.length ? top.map(([k, n]) => { const [a, b] = k.split("|"); return `<li><span>${esc(members[a]?.name || a)} &amp; ${esc(members[b]?.name || b)}</span><b>${n}</b></li>`; }).join("")
      : `<li class="muted">No joint papers yet.</li>`;
  }

  // ------------------------------------------------------------ themes: what the group works on
  // Size and order = how many members work on a theme (so the biggest words are where the group as a
  // whole works); only themes at least two members share; each paper counts once.
  function renderThemes() {
    const TH = D.themes;
    if (!TH || !TH.items?.length || !window.d3 || !d3.layout?.cloud) return;
    $("#themes-card").hidden = false;
    const T = TH.items.map((t) => ({ ...t, w: t.m.length })).sort((a, b) => b.w - a.w || b.n - a.n);
    const shared = T.filter((t) => t.w >= 2);
    const words = (shared.length >= 12 ? shared : T).slice(0, 45);
    $("#themes-note").textContent = `Themes in the team's papers, ${TH.from}–${TH.to}. Bigger = more members working on it; ` +
      `${shared.length >= 12 ? "showing themes at least two members share; " : ""}each paper counts once.` +
      (TH.source === "titles" ? " Built from paper titles until OpenAlex keywords arrive with the next run." : "");
    // colour by research field when known (top 4 fields get the categorical slots, the rest grey)
    const fieldCount = d3.rollup(words.filter((t) => t.field), (v) => v.length, (t) => t.field);
    const fields = [...fieldCount].sort((a, b) => b[1] - a[1]).map(([f]) => f).slice(0, 4);
    const byField = fields.length >= 2;
    const slot = (f) => (fields.indexOf(f) >= 0 ? `--s${fields.indexOf(f) + 1}` : "--s0");
    const shade = d3.scaleQuantize().domain(d3.extent(words, (t) => t.w)).range(["--w1", "--w2", "--w3", "--w4", "--w5"]);
    const colour = (t) => css(byField ? slot(t.field) : shade(t.w));
    $("#cloud-legend").innerHTML = byField ? fields.map((f, i) => `<span><i class="sw" style="background:var(--s${i + 1})"></i>${esc(f)}</span>`).join("") + `<span><i class="sw" style="background:var(--s0)"></i>Other fields</span>` : "";
    const top = T.slice(0, 10), max = top[0].w;
    $("#top10").innerHTML = top.map((t, i) => `<li data-k="${esc(t.k)}" title="${esc(t.m.map((s) => members[s]?.name || s).join(", "))}"><span class="r">${i + 1}</span><span class="nm">${esc(t.label)}</span><span class="n">${t.w}</span>
      <span class="bar"><span style="width:${(100 * t.w) / max}%"></span></span><span class="sub">${t.w} member${t.w === 1 ? "" : "s"} · ${t.n} paper${t.n === 1 ? "" : "s"}</span></li>`).join("");
    const host = $("#cloud"); host.innerHTML = "";
    const W = host.clientWidth || 800, H = host.clientHeight || 400;
    const size = d3.scaleSqrt().domain(d3.extent(words, (t) => t.w)).range(W < 500 ? [13, 38] : [16, 68]);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const FONT = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    d3.layout.cloud().size([W, H]).words(words.map((t) => ({ ...t, text: t.label, size: size(t.w) })))
      .padding(3).rotate(0).font(FONT).fontWeight((d) => (d.w >= 3 ? 650 : 500)).fontSize((d) => d.size)
      .spiral("archimedean").random(rnd).on("end", draw).start();
    const tipEl = $("#tooltip");
    function draw(placed) {
      const svg = d3.select(host).append("svg").attr("viewBox", [-W / 2, -H / 2, W, H]).attr("role", "img").attr("aria-label", "Word cloud of the team's research themes");
      const sel = svg.selectAll("text").data(placed).join("text").attr("text-anchor", "middle").style("font-family", FONT)
        .attr("font-weight", (d) => (d.w >= 3 ? 650 : 500)).style("font-size", (d) => d.size + "px").style("fill", colour)
        .attr("transform", "scale(0.2)").style("opacity", 0).text((d) => d.text);
      sel.transition().delay((d, i) => i * 30).duration(700).ease(d3.easeCubicOut).attr("transform", (d) => `translate(${d.x},${d.y})`).style("opacity", 1);
      const focus = (k) => { sel.classed("dim", (d) => k && d.k !== k); document.querySelectorAll("#top10 li").forEach((li) => li.classList.toggle("hot", li.dataset.k === k)); };
      sel.on("mousemove", (ev, d) => {
        focus(d.k); tipEl.hidden = false;
        const names = d.m.map((s) => members[s]?.name || s);
        tipEl.innerHTML = `<b>${esc(d.label)}</b><br>${d.w} member${d.w === 1 ? "" : "s"} · ${d.n} paper${d.n === 1 ? "" : "s"}${d.field ? ` · ${esc(d.field)}` : ""}<br><span style="opacity:.8">${esc(names.slice(0, 6).join(", "))}${names.length > 6 ? ` +${names.length - 6}` : ""}</span>`;
        tipEl.style.left = `${Math.min(ev.clientX + 14, innerWidth - 300)}px`; tipEl.style.top = `${ev.clientY + 14}px`;
      }).on("mouseleave", () => { focus(null); tipEl.hidden = true; }).on("click", (ev, d) => papers(d));
      document.querySelectorAll("#top10 li").forEach((li) => {
        const t = T.find((x) => x.k === li.dataset.k);
        li.onmouseenter = () => focus(t.k); li.onmouseleave = () => focus(null); li.onclick = () => papers(t);
      });
    }
    function papers(t) {
      const el = $("#cloud-papers"); el.hidden = false;
      el.innerHTML = `<h3>${esc(t.label)} — ${t.n} paper${t.n === 1 ? "" : "s"}, ${t.w} member${t.w === 1 ? "" : "s"}</h3><ul>${t.p.map((i) => { const p = TH.papers[i];
        return `<li>${paperLink({ title: p.t, link: p.u })} <span class="muted">(${p.y}) · ${esc(p.m.map((s) => members[s]?.name || s).join(", "))}</span></li>`; }).join("")}</ul>`;
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // ------------------------------------------------------------ Sankey: where the work goes
  // Type of output -> venue quality tier -> venue, for the whole team or the person picked above.
  const KIND_COL = { "Journal": "--s1", "Conference": "--s2", "Book / chapter": "--s3", "Preprint / repository": "--s4", "Other": "--s0" };
  const KINDS = ["Journal", "Conference", "Book / chapter", "Preprint / repository", "Other"];
  let skMetric = "n", skInit = false;
  function renderSankey() {
    if (!window.d3 || !d3.sankey || !D.venues) { $("#sankey-card").hidden = true; return; }
    const years = [...new Set(D.works.map((w) => w.year).filter(Boolean))].sort((a, b) => a - b);
    if (!skInit) {
      skInit = true;
      $("#sk-from").innerHTML = years.map((y) => `<option>${y}</option>`).join("");
      $("#sk-to").innerHTML = years.slice().reverse().map((y) => `<option>${y}</option>`).join("");
      $("#sk-from").value = Math.max(years[0], THIS_YEAR - 4); $("#sk-to").value = THIS_YEAR;
      $("#sk-from").onchange = $("#sk-to").onchange = () => drawSankey(true);
      document.querySelectorAll("#sk-metric button").forEach((b) => (b.onclick = () => {
        skMetric = b.dataset.m; document.querySelectorAll("#sk-metric button").forEach((x) => x.classList.toggle("on", x === b)); drawSankey(true);
      }));
      $("#sk-legend").innerHTML = KINDS.slice(0, 4).map((k) => `<span><i class="sw" style="background:var(${KIND_COL[k]})"></i>${k}</span>`).join("") + `<span class="muted">Flows are coloured by type of output</span>`;
    }
    drawSankey(false);
  }
  function drawSankey(animate) {
    const host = $("#sankey");
    const sel = $("#net-member").value, mem = members[sel] ? sel : "";
    $("#sk-title").textContent = mem ? `Where ${members[mem].name.split(" ")[0]}'s work goes` : "Where the team's work goes";
    const from = Math.min(+$("#sk-from").value, +$("#sk-to").value), to = Math.max(+$("#sk-from").value, +$("#sk-to").value);
    const cites = (w) => (w.gs_c ?? w.cited_by_count) || 0;
    const val = (w) => (skMetric === "n" ? 1 : cites(w));
    const ws = D.works.filter((w) => w.year >= from && w.year <= to && (!mem || w.lab.includes(mem)) && val(w) > 0);
    const TIERS = D.tier_order || [];
    const byVenue = d3.rollup(ws.filter((w) => w.vkey), (v) => d3.sum(v, val), (w) => w.vkey);
    const topV = new Set([...byVenue].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([v]) => v));
    const OTHER = { "Journal": "Other journals", "Conference": "Other conferences", "Book / chapter": "Other books", "Preprint / repository": "Other preprints", "Other": "Other outputs " };
    const nodes = new Map(), links = new Map();
    for (const w of ws) {
      const k = w.kind || "Other", tier = w.tier || "Other outputs";
      const vk = w.vkey && topV.has(w.vkey) ? "v:" + w.vkey : "v:" + OTHER[k];
      if (!nodes.has("t:" + k)) nodes.set("t:" + k, { id: "t:" + k, name: k, col: 0, kind: k, order: KINDS.indexOf(k) });
      if (!nodes.has("r:" + tier)) nodes.set("r:" + tier, { id: "r:" + tier, name: tier, col: 1, kind: k, order: TIERS.indexOf(tier) });
      if (!nodes.has(vk)) {
        const v = D.venues[w.vkey] || {};
        nodes.set(vk, { id: vk, name: vk.slice(2), col: 2, kind: k, other: !topV.has(w.vkey), tierIdx: TIERS.indexOf(tier),
          verified: !!v.verified || !topV.has(w.vkey), info: topV.has(w.vkey) ? v : null });
      }
      for (const [s, t] of [["t:" + k, "r:" + tier], ["r:" + tier, vk]]) {
        const key = s + "→" + t, l = links.get(key) || { key, source: s, target: t, value: 0, kind: k, works: [] };
        l.value += val(w); l.works.push(w); links.set(key, l);
      }
    }
    const vSize = new Map(); links.forEach((l) => l.target.startsWith("v:") && vSize.set(l.target, (vSize.get(l.target) || 0) + l.value));
    [...nodes.values()].filter((n) => n.col === 2)
      .sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.other - b.other || a.tierIdx - b.tierIdx || vSize.get(b.id) - vSize.get(a.id))
      .forEach((n, i) => (n.order = i));
    // footnote: how much of what's shown rests on venues nobody has checked yet
    const unv = ws.filter((w) => w.vkey && !(D.venues[w.vkey] || {}).verified);
    const nUnvVenues = new Set(unv.map((w) => w.vkey)).size;
    $("#sk-foot").innerHTML = ws.length ? `${fmt(ws.length)} paper${ws.length === 1 ? "" : "s"}, ${from === to ? from : `${from}–${to}`}. ` +
      (unv.length ? `Hollow blocks: ${fmt(unv.length)} of them are in ${fmt(nUnvVenues)} venue${nUnvVenues === 1 ? "" : "s"} not yet reviewed in venues.yaml, so their type and tier are automatic.` : "All venues shown have been reviewed in venues.yaml.") +
      ` Ranks: SCImago quartiles for journals, ICORE for conferences.` : "No papers in this range.";
    $("#sk-unit").textContent = skMetric === "n" ? "papers" : "citations (Google Scholar where available)";
    const width = Math.max(760, host.clientWidth || 0), height = Math.max(320, Math.min(620, 160 + nodes.size * 16)), M = { t: 26, r: 300, b: 8, l: 4 };
    let svg = d3.select(host).select("svg");
    if (svg.empty() || +svg.attr("data-w") !== width) {
      host.innerHTML = "";
      svg = d3.select(host).append("svg").attr("data-w", width);
      svg.append("g").attr("class", "heads");
      svg.append("g").attr("class", "links"); svg.append("g").attr("class", "nodes");
    }
    svg.attr("viewBox", [0, 0, width, height]);
    svg.select(".heads").selectAll("text").data([["Type", M.l, "start"], ["Quality tier", (width - M.r) / 2, "middle"], ["Venue", width - M.r, "end"]])
      .join("text").attr("class", "colhead").attr("x", (d) => d[1]).attr("y", 14).attr("text-anchor", (d) => d[2]).text((d) => d[0]);
    if (!links.size) { svg.select(".links").selectAll("*").remove(); svg.select(".nodes").selectAll("*").remove(); return; }
    const layout = d3.sankey().nodeId((d) => d.id).nodeWidth(12).nodePadding(9).nodeAlign(d3.sankeyJustify)
      .extent([[M.l, M.t], [width - M.r, height - M.b]]).nodeSort((a, b) => a.order - b.order);
    const G = layout({ nodes: [...nodes.values()].map((d) => ({ ...d })), links: [...links.values()].map((d) => ({ ...d })) });
    const total = d3.sum(ws, val), unit = skMetric === "n" ? "paper" : "citation";
    const T = d3.transition().duration(animate ? 650 : 0).ease(d3.easeCubicInOut);
    const path = d3.sankeyLinkHorizontal();
    const ls = svg.select(".links").selectAll("path").data(G.links, (d) => d.key).join(
      (en) => en.append("path").attr("class", "link").attr("d", path).attr("stroke-width", 0),
      (up) => up, (ex) => ex.transition(T).attr("stroke-width", 0).remove());
    ls.style("stroke", (d) => css(KIND_COL[d.kind])).transition(T).attr("d", path).attr("stroke-width", (d) => Math.max(1, d.width));
    const ns = svg.select(".nodes").selectAll("g.node").data(G.nodes, (d) => d.id).join(
      (en) => { const e = en.append("g").attr("class", "node").style("opacity", 0); e.append("rect"); e.append("text"); return e; },
      (up) => up, (ex) => ex.transition(T).style("opacity", 0).remove());
    ns.transition(T).style("opacity", 1);
    ns.classed("uv", (d) => d.col === 2 && !d.verified);
    ns.select("rect").style("fill", (d) => (d.col === 0 ? css(KIND_COL[d.kind]) : css("--text-2")))
      .transition(T).attr("x", (d) => d.x0).attr("y", (d) => d.y0).attr("width", (d) => d.x1 - d.x0).attr("height", (d) => Math.max(1, d.y1 - d.y0));
    ns.select("text").attr("dy", "0.35em")
      .html((d) => `${esc(d.name.length > 44 ? d.name.slice(0, 42) + "…" : d.name)} <tspan class="v">${fmt(Math.round(d.value))}</tspan>`)
      .transition(T).attr("x", (d) => d.x1 + 6).attr("y", (d) => (d.y0 + d.y1) / 2);
    const tipEl = $("#tooltip");
    const showTip = (ev, html) => { tipEl.hidden = false; tipEl.innerHTML = html; tipEl.style.left = `${Math.min(ev.clientX + 14, innerWidth - 310)}px`; tipEl.style.top = `${ev.clientY + 14}px`; };
    const related = (d) => { const s = new Set([d.id]);
      const up = (n) => n.targetLinks.forEach((l) => { s.add(l.key); s.add(l.source.id); up(l.source); });
      const down = (n) => n.sourceLinks.forEach((l) => { s.add(l.key); s.add(l.target.id); down(l.target); }); up(d); down(d); return s; };
    const hl = (set) => { ls.classed("hot", (l) => set && set.has(l.key)).classed("dim", (l) => set && !set.has(l.key)); ns.classed("dim", (n) => set && !set.has(n.id)); };
    const venueInfo = (d) => { const v = d.info; if (!v) return "";
      return `<br>${esc(v.kind)}${v.rank ? ` · ${esc(v.rank)} (${esc(v.src || "")})` : " · unranked"}${v.impact ? ` · impact ${v.impact}` : ""}${v.verified ? "" : "<br><i>Not verified in venues.yaml yet</i>"}`; };
    ns.on("mousemove", (ev, d) => { hl(related(d)); showTip(ev, `<b>${esc(d.name)}</b><br>${fmt(Math.round(d.value))} ${unit}${Math.round(d.value) === 1 ? "" : "s"} · ${Math.round((100 * d.value) / total)}% of total${venueInfo(d)}`); })
      .on("mouseleave", () => { hl(null); tipEl.hidden = true; })
      .on("click", (ev, d) => skList(d.name, [...new Map([...d.targetLinks, ...d.sourceLinks].flatMap((l) => l.works).map((w) => [w.id, w])).values()]));
    ls.on("mousemove", (ev, d) => { hl(new Set([d.key, d.source.id, d.target.id])); showTip(ev, `<b>${esc(d.source.name)} → ${esc(d.target.name)}</b><br>${fmt(Math.round(d.value))} ${unit}${Math.round(d.value) === 1 ? "" : "s"}`); })
      .on("mouseleave", () => { hl(null); tipEl.hidden = true; }).on("click", (ev, d) => skList(`${d.source.name} → ${d.target.name}`, d.works));
  }
  function skList(title, ws) {
    const el = $("#sk-papers"); el.hidden = false;
    const c = (w) => (w.gs_c ?? w.cited_by_count) || 0;
    ws = ws.slice().sort((a, b) => c(b) - c(a) || b.year - a.year);
    el.innerHTML = `<h3>${esc(title)} — ${ws.length} paper${ws.length === 1 ? "" : "s"}</h3><ul>${ws.slice(0, 40).map((w) =>
      `<li>${paperLink(w)} <span class="muted">(${w.year}) · ${esc(w.venue || "")} · ${fmt(c(w))} citation${c(w) === 1 ? "" : "s"}</span></li>`).join("")}</ul>${ws.length > 40 ? `<p class="note">+ ${ws.length - 40} more</p>` : ""}`;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ------------------------------------------------------------ shared colour ramp (one hue, light -> dark)
  function ramp() {
    const dark = document.documentElement.dataset.theme === "dark" ||
      (document.documentElement.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    const stops = dark ? ["#184f95", "#256abf", "#3987e5", "#6da7ec", "#b7d3f6"] : ["#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#0d366b"];
    return d3.interpolateRgbBasis(stops);
  }

  // ------------------------------------------------------------ heatmap: members x years
  let heatMetric = "pubs", heatSort = "recent";
  const total = (m, k) => Object.values(m[k] || {}).reduce((a, b) => a + b, 0);
  const heatSorts = {
    first: (a, b) => (a.first_year || 9999) - (b.first_year || 9999) || a.name.localeCompare(b.name),
    name: (a, b) => a.name.localeCompare(b.name),
    total: (a, b) => total(b, heatMetric === "pubs" ? "pubs_by_year" : "cites_by_year") - total(a, heatMetric === "pubs" ? "pubs_by_year" : "cites_by_year") || a.name.localeCompare(b.name),
    recent: (a, b) => { const r = (m) => [0, 1, 2].reduce((t, i) => t + ((m[heatMetric === "pubs" ? "pubs_by_year" : "cites_by_year"] || {})[String(THIS_YEAR - i)] || 0), 0);
      return r(b) - r(a) || a.name.localeCompare(b.name); },
  };
  function renderHeatmap() {
    const el = $("#heatmap");
    if (!window.d3) return;
    const key = heatMetric === "pubs" ? "pubs_by_year" : "cites_by_year";
    const ms = D.members.slice()
      .sort(heatSorts[heatSort]);
    const first = Math.min(...ms.flatMap((m) => Object.keys(m[key] || {}).map(Number)).filter((y) => y > 1900), THIS_YEAR);
    const START = Math.max(first, THIS_YEAR - 19);
    const yrs = range(START, THIS_YEAR), early = first < START;
    const val = (m, y) => (m[key] || {})[String(y)] || 0;
    const before = (m) => Object.entries(m[key] || {}).reduce((t, [y, n]) => t + (+y < START ? n : 0), 0);
    const max = Math.max(1, ...ms.flatMap((m) => yrs.map((y) => val(m, y))));
    const scale = d3.scaleSqrt().domain([0, max]).range([0.08, 1]);
    const col = ramp();
    const unit = heatMetric === "pubs" ? "paper" : "citation";
    const cell = (m, y, n) => `<div class="cell" data-t="${esc(m.name)} · ${y}: ${fmt(n)} ${unit}${n === 1 ? "" : "s"}${y === THIS_YEAR ? " so far" : ""}" ${n ? `style="background:${col(scale(n))}"` : ""}></div>`;
    const cols = (early ? 1 : 0) + yrs.length;
    let html = `<div class="heat" style="grid-template-columns:minmax(110px,170px) repeat(${cols},26px) auto"><div></div>`;
    if (early) html += `<div class="yr" title="Before ${START}">earlier</div>`;
    html += yrs.map((y) => `<div class="yr">${y % 5 === 0 || y === THIS_YEAR || y === START ? `’${String(y).slice(2)}` : ""}</div>`).join("") + `<div class="yr">Total</div>`;
    for (const m of ms) {
      const tot = Object.values(m[key] || {}).reduce((a, b) => a + b, 0);
      html += `<div class="nm"><a href="#member/${m.slug}">${esc(m.name)}</a></div>`;
      if (early) { const b = before(m); html += `<div class="cell" data-t="${esc(m.name)} · before ${START}: ${fmt(b)} ${unit}${b === 1 ? "" : "s"}" ${b ? `style="background:${col(scale(Math.min(b, max)))}"` : ""}></div>`; }
      html += yrs.map((y) => cell(m, y, val(m, y))).join("") + `<div class="tot">${fmt(tot)}</div>`;
    }
    el.innerHTML = html + "</div>";
    const tipEl = $("#tooltip");
    el.onmousemove = (e) => {
      const t = e.target.closest(".cell")?.dataset.t;
      if (!t) { tipEl.hidden = true; return; }
      tipEl.hidden = false; tipEl.textContent = t;
      tipEl.style.left = `${Math.min(e.clientX + 14, innerWidth - 300)}px`; tipEl.style.top = `${e.clientY + 14}px`;
    };
    el.onmouseleave = () => (tipEl.hidden = true);
    const hs = $("#heat-sort"); hs.value = heatSort; hs.onchange = () => { heatSort = hs.value; renderHeatmap(); };
    document.querySelectorAll("#heat-metric button").forEach((b) => {
      b.classList.toggle("on", b.dataset.m === heatMetric);
      b.onclick = () => { heatMetric = b.dataset.m; renderHeatmap(); };
    });
  }

  // ------------------------------------------------------------ world map: where the lab is cited from
  let mapTimer = null;
  async function renderMap() {
    const C = D.citing;
    if (!C || !window.d3 || !window.topojson) return;
    let topo;
    try { topo = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json").then((r) => r.json()); }
    catch { return; }
    $("#map-card").hidden = false;
    const num2iso = {};
    for (const [iso, [num]] of Object.entries(COUNTRIES)) num2iso[num] = iso;
    const feats = topojson.feature(topo, topo.objects.countries).features.filter((f) => f.id !== "010");  // no Antarctica
    const years = Object.keys(C.by_year).map(Number).sort((a, b) => a - b);
    const FIRST = years[0], LAST = Math.max(THIS_YEAR, years[years.length - 1]);
    const cum = (upto) => {
      const t = {};
      for (const [y, cs] of Object.entries(C.by_year)) if (+y <= upto) for (const [c, n] of Object.entries(cs)) t[c] = (t[c] || 0) + n;
      return t;
    };
    const finalT = cum(LAST), MAX = Math.max(1, ...Object.values(finalT));
    const scale = d3.scaleLog().domain([1, MAX]).range([0.12, 1]).clamp(true);
    const col = ramp(), empty = css("--grid");
    const W = 960, H = 440;
    const proj = d3.geoEqualEarth().fitExtent([[4, 4], [W - 4, H - 4]], { type: "Sphere" });
    const path = d3.geoPath(proj);
    const host = $("#map"); host.innerHTML = "";
    const svg = d3.select(host).append("svg").attr("viewBox", [0, 0, W, H]).attr("role", "img").attr("aria-label", "World map of countries citing the lab's work");
    svg.append("path").attr("class", "sphere").attr("d", path({ type: "Sphere" }));
    const shapes = svg.append("g").selectAll("path").data(feats).join("path").attr("class", "country").attr("d", path).attr("fill", empty);
    $("#map-legend").innerHTML = `<span>1</span><span class="ramp" style="background:linear-gradient(90deg,${[0.12, 0.35, 0.6, 0.8, 1].map((t) => col(t)).join(",")})"></span><span>${fmt(MAX)} citing papers</span>`;
    const tipEl = $("#tooltip");
    let year = LAST, cur = finalT;
    shapes.on("mousemove", (ev, f) => {
      const iso = num2iso[f.id], n = cur[iso] || 0, name = COUNTRIES[iso]?.[1] || f.properties.name;
      tipEl.hidden = false;
      tipEl.innerHTML = `<b>${esc(name)}</b><br>${n ? `${fmt(n)} citing paper${n === 1 ? "" : "s"}` : "No citations yet"}${year < LAST ? ` by ${year}` : ""}`;
      tipEl.style.left = `${Math.min(ev.clientX + 14, innerWidth - 300)}px`; tipEl.style.top = `${ev.clientY + 14}px`;
    }).on("mouseleave", () => (tipEl.hidden = true));

    function update(upto, animate) {
      year = upto; cur = cum(upto);
      $("#map-year").value = upto;
      shapes.classed("on", (f) => cur[num2iso[f.id]] > 0)
        .transition().duration(animate ? 600 : 0)
        .attr("fill", (f) => { const n = cur[num2iso[f.id]] || 0; return n ? col(scale(n)) : empty; });
      const nC = Object.keys(cur).length, nP = Object.entries(C.papers_by_year).reduce((t, [y, n]) => t + (+y <= upto ? n : 0), 0);
      $("#map-title").textContent = `Cited from ${fmt(nC)} countr${nC === 1 ? "y" : "ies"}`;
      $("#map-note").textContent = `About ${fmt(nP)} papers cite the team's work${upto < LAST ? ` up to ${upto}` : ""}, counted by the countries of their authors (OpenAlex).`;
      $("#map-year-big").textContent = upto < LAST ? upto : "";
      $("#map-year-label").textContent = `${FIRST}–${upto}`;
      hbars($("#map-top"), Object.entries(cur).sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([c, n]) => ({ name: COUNTRIES[c]?.[1] || c, count: n })), 10);
    }
    const slider = $("#map-year"), btn = $("#map-play");
    slider.min = FIRST; slider.max = LAST; slider.value = LAST;
    const stop = (label = "▶ Play") => { clearInterval(mapTimer); mapTimer = null; btn.textContent = label; };
    stop();
    btn.onclick = () => {
      if (mapTimer) { stop(); return; }
      if (year >= LAST) update(FIRST, true);
      btn.textContent = "❚❚ Pause";
      mapTimer = setInterval(() => { if (year >= LAST) { stop("↻ Replay"); return; } update(year + 1, true); }, 1000);
    };
    slider.oninput = () => { stop(); update(Number(slider.value), true); };
    update(LAST, false);
  }


  // ------------------------------------------------------------ member
  function renderMember(slug) {
    const sel = $("#member-select");
    let first = false;
    if (!sel.options.length) {
      first = true;
      const sorted = D.members.slice().sort((a, b) => b.active - a.active || b.citations - a.citations);
      sel.innerHTML = sorted.map((m) => `<option value="${m.slug}">${esc(m.name)}${m.active ? "" : " (alumni)"}</option>`).join("");
      sel.onchange = () => (location.hash = `member/${sel.value}`);
    }
    // lab.yaml can name who is shown first: lab: default_member: "Jane Doe"
    const want = String((D.lab || {}).default_member || "").trim().toLowerCase();
    const preferred = want && D.members.find((x) => x.name.toLowerCase() === want || x.slug === want);
    const m = members[slug] || (first && preferred) || members[sel.value] || members[sel.options[0].value];
    sel.value = m.slug;
    const links = [];
    if (m.scholar) links.push(`<a href="${esc(m.scholar)}" target="_blank" rel="noopener">Google Scholar ↗</a>`);
    if (m.orcid) links.push(`<a href="https://orcid.org/${esc(m.orcid)}" target="_blank" rel="noopener">ORCID ↗</a>`);
    if (m.openalex.length) links.push(`<a href="https://openalex.org/authors/${esc(m.openalex[0])}" target="_blank" rel="noopener"${m.openalex.length > 1 ? ` title="OpenAlex has ${m.openalex.length} records for this person; this is the main one"` : ""}>OpenAlex ↗</a>`);
    $("#member-links").innerHTML = `<span class="muted">${esc(m.role || "")}</span>` + links.join("");

    const oa = m.openalex_counts || {};
    const srcNote = m.source === "Google Scholar" ? `Google Scholar · OpenAlex finds ${fmt(oa.citations)}`
      : m.scholar_outdated ? `OpenAlex · the Google Scholar profile lists nothing from ${FROM} on` : "OpenAlex";
    kpis($("#member-kpis"), [
      [fmt(m.works), "Papers", m.first_year ? `since ${m.first_year}` : ""],
      [fmt(m.citations), "Citations", srcNote],
      [fmt(m.h), "h-index", ""],
      [fmt(m.i10), "i10-index", ""],
      (() => { const mo = momentum(m.cites_by_year);
        return [fmt(mo.now), `Citations in ${THIS_YEAR} so far`, `${fmt(mo.last)} in all of ${LAST_YEAR}${mo.pace == null ? "" : ` · on pace for ${paceHtml(mo)}`}`]; })(),
    ]);

    // h-index watch
    const hw = m.h_watch;
    const pace = (p) => (p.eta_months == null ? "no citations recently" : p.eta_months <= 1 ? "likely within a month" : `~${p.eta_months} months at current pace`);
    $("#h-watch").innerHTML = !m.works ? `<h3>Next h-index</h3><p class="empty">No papers found yet.</p>` : `
      <h3>Next h-index: ${hw.h} → ${hw.target}</h3>
      <p class="big">${hw.papers.length < hw.papers_needed
        ? `An h-index of ${hw.target} needs ${hw.target} papers with ${hw.target}+ citations, so it takes ${hw.papers_needed - hw.papers.length} more paper${hw.papers_needed - hw.papers.length === 1 ? "" : "s"}${hw.citations_needed ? `, plus ${hw.citations_needed} citation${hw.citations_needed === 1 ? "" : "s"} on the papers below` : ""}.`
        : `${hw.papers_needed} paper${hw.papers_needed === 1 ? "" : "s"} need${hw.papers_needed === 1 ? "s" : ""} to reach ${hw.target} citations: <b>${hw.citations_needed}</b> more citation${hw.citations_needed === 1 ? "" : "s"} in total.`}</p>
      <ol>${hw.papers.map((p) => `<li>
        <div><div class="t">${paperLink(p)}</div><div class="meta">${p.year || ""} · ${fmt(p.c)} of ${hw.target} · ${pace(p)}</div>
        <div class="meter"><span style="width:${(100 * p.c) / hw.target}%"></span></div></div>
        <div class="need">+${p.need}</div></li>`).join("")}</ol>`;
    const iw = m.i10_watch;
    $("#i10-watch").innerHTML = `<h3>Close to 10 citations</h3>
      <p class="big">${iw.length ? `${iw.length} paper${iw.length === 1 ? "" : "s"} would raise the i10-index from ${m.i10}.` : "No papers sitting at 7–9 citations right now."}</p>
      <ol>${iw.slice(0, 6).map((p) => `<li>
        <div><div class="t">${paperLink(p)}</div><div class="meta">${p.year || ""} · ${fmt(p.c)} of 10</div>
        <div class="meter"><span style="width:${p.c * 10}%"></span></div></div>
        <div class="need">+${p.need}</div></li>`).join("")}</ol>`;

    const yrs = m.years || D.years;
    chart("c-m-cby", "bar", yearLabels(yrs), fillYears(m.cites_by_year, yrs), { unit: "citations" });
    chart("c-m-cum", "line", yearLabels(yrs), fillYears(m.cumulative, yrs), { unit: "citations in total" });
    const py = Object.keys(m.pubs_by_year).map(Number);
    const pyrs = py.length ? range(Math.min(...py), THIS_YEAR) : [THIS_YEAR];
    chart("c-m-pubs", "bar", yearLabels(pyrs), fillYears(m.pubs_by_year, pyrs), { unit: "papers" });
    const mv = {};
    D.works.filter((w) => w.lab.includes(m.slug) && w.vkey).forEach((w) => { const x = (mv[w.vkey] ||= { name: w.vkey, type: w.kind, count: 0 }); x.count++; });
    hbars($("#m-venues"), Object.values(mv).length ? Object.values(mv).sort((a, b) => b.count - a.count) : m.venues, 8);

    const collab = Object.entries(m.collab_lab);
    $("#m-collab").innerHTML = collab.length
      ? collab.map(([s, n]) => `<a class="chip" href="#member/${s}">${esc(members[s]?.name || s)}<b>${n}</b></a>`).join("") +
        `<span class="muted" style="font-size:13px;align-self:center">+ ${fmt(m.collab_external)} outside co-authors</span>`
      : `<p class="empty">No co-authored papers with other lab members yet. ${fmt(m.collab_external)} outside co-authors.</p>`;

    if (m.scholar_papers) {
      table($("#m-papers"), [
        { key: "title", label: "Title", cls: "title", html: (p) => `${paperLink(p)}<div class="sub">${esc(p.authors || "")}${p.venue ? ` · <i>${esc(p.venue)}</i>` : ""}</div>` },
        { key: "year", label: "Year", num: true },
        { key: "c", label: "Citations", num: true, html: (p) => fmt(p.c) },
      ], m.scholar_papers, { sort: "c", limit: 25 });
    } else {
      const mine = D.works.filter((w) => w.lab.includes(m.slug));
      table($("#m-papers"), paperCols(), mine, { sort: "cited_by_count", limit: 25 });
    }
    $("#m-net-link").href = `#analytics/${m.slug}`;
  }

  function paperLink(p) {
    const u = p.link || p.doi;
    return u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title);
  }

  function range(a, b) { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; }

  function paperCols() {
    return [
      { key: "title", label: "Title", cls: "title", html: (w) => `${w.doi ? `<a href="${esc(w.doi)}" target="_blank" rel="noopener">${esc(w.title)}</a>` : esc(w.title)}
          <div class="sub">${esc(shortAuthors(w))}${w.venue ? ` · <i>${esc(w.venue)}</i>` : ""}${w.versions > 1 ? ` · ${w.versions} versions merged` : ""}</div>` },
      { key: "year", label: "Year", num: true },
      { key: "cited_by_count", label: "Citations", num: true, html: (w) => fmt(w.cited_by_count) },
      { key: "last", label: `In ${LAST_YEAR}`, num: true, val: (w) => w.cby[String(LAST_YEAR)] || 0, html: (w) => fmt(w.cby[String(LAST_YEAR)] || 0) },
    ];
  }
  function shortAuthors(w) {
    const names = w.authors.map((a) => a.name);
    return names.length > 6 ? `${names.slice(0, 5).join(", ")} … ${names[names.length - 1]} (${names.length} authors)` : names.join(", ");
  }

  // ------------------------------------------------------------ network (one member at a time, D3)
  // The selected person sits in the centre; co-authors orbit around them, closer the more papers
  // they share. Circle size = papers with the selected person; line width = papers together.
  // Play replays it year by year; swiping sideways on a trackpad scrubs through the years.
  const cumY = (y, upto) => { let t = 0; for (const k in y || {}) if (+k <= upto) t += y[k]; return t; };
  let NET = null;

  function egoData(m) {
    const MAXA = D.network_max_authors || 25;
    const id2slug = {};
    D.members.forEach((x) => (x.openalex || []).forEach((i) => (id2slug[i] = x.slug)));
    const extInfo = Object.fromEntries(D.network.nodes.filter((n) => !n.lab).map((n) => [n.id, n]));
    const works = D.works.filter((w) => w.lab.includes(m.slug));
    const people = {}, pairs = {}, egoY = {}, instCount = {};
    for (const w of works) {
      const yr = String(w.year || THIS_YEAR);
      egoY[yr] = (egoY[yr] || 0) + 1;
      if (w.authors.length > MAXA) continue;  // consortium papers would connect everyone
      const keys = new Set([m.slug]);
      for (const a of w.authors) {
        const k = id2slug[a.id] || a.id;
        if (!k) continue;
        keys.add(k);
        if (k !== m.slug && !people[k]) {
          const lab = !!members[k];
          people[k] = { id: k, label: lab ? members[k].name : a.name, lab, active: lab ? members[k].active : true,
            inst: lab ? (D.lab.institution || "Lab member") : extInfo[k]?.inst, yrs: {}, papers: 0, works: [] };
        }
      }
      const insts = new Set([...keys].map((k) => people[k]).filter((p) => p && !p.lab && p.inst).map((p) => p.inst));
      insts.forEach((i) => (instCount[i] = (instCount[i] || 0) + 1));
      const ks = [...keys].sort();
      ks.forEach((k) => { if (k !== m.slug) { const p = people[k]; p.yrs[yr] = (p.yrs[yr] || 0) + 1; p.papers++; p.works.push(w); } });
      for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
        if (ks[i] === m.slug || ks[j] === m.slug) continue;          // ties to the centre are implied
        const id = `${ks[i]}|${ks[j]}`;
        const e = (pairs[id] ||= { id, a: ks[i], b: ks[j], yrs: {}, w: 0 });
        e.yrs[yr] = (e.yrs[yr] || 0) + 1; e.w++;
      }
    }
    return { m, works, people, pairs, egoY, instCount };
  }

  function renderNetwork(slug) {
    const sel = $("#net-member");
    if (!sel.options.length) {
      const sorted = D.members.slice().sort((a, b) => b.active - a.active || a.name.localeCompare(b.name));
      sel.innerHTML = `<option value="team">Whole team — who works with whom</option><optgroup label="One person and their co-authors">` +
        sorted.map((m) => `<option value="${m.slug}">${esc(m.name)}${m.active ? "" : " (alumni)"}</option>`).join("") + "</optgroup>";
      sel.onchange = () => (location.hash = `analytics/${sel.value}`);
    }
    const key = slug === "team" || (!slug && !members[sel.value]) ? "team" : (members[slug] ? slug : sel.value);
    sel.value = key;
    if (NET && NET.slug === key) { NET.resume(); return; }
    NET?.destroy();
    if (!window.d3) { $("#network").innerHTML = `<p class="empty" style="padding:16px">Network library failed to load.</p>`; return; }
    $("#net-min-wrap").hidden = key === "team";
    $("#net-hint").textContent = key === "team"
      ? "Each circle is a team member (size = papers); lines join members who have published together, thicker with more joint papers. Members on the outer ring haven't co-authored within the team yet. Drag circles to rearrange them; they stay where you drop them (double-click one to release it, ↺ to reset). Swipe sideways or use the slider to move through the years · pinch to zoom · drag the background to pan."
      : "Circles sit closer and grow larger the more papers someone shares with the selected person; lines thicken with papers written together. Drag circles to rearrange them; they stay where you drop them (double-click one to release it, ↺ to reset). Swipe sideways or use the slider to move through the years · pinch to zoom · drag the background to pan.";
    $(".net-card .legend").hidden = key === "team";
    NET = key === "team" ? teamNetwork() : egoNetwork(members[key]);
  }

  // ------------------------------------------------------------ moved circles stay put (per viewer)
  const PIN_KEY = "lab-dashboard-pins";
  function loadPins(view) { try { return JSON.parse(localStorage.getItem(PIN_KEY) || "{}")[view] || {}; } catch { return {}; } }
  function savePins(view, pins) {
    try { const all = JSON.parse(localStorage.getItem(PIN_KEY) || "{}"); all[view] = pins; localStorage.setItem(PIN_KEY, JSON.stringify(all)); } catch { /* storage unavailable */ }
  }

  // ------------------------------------------------------------ team network: members only
  // Circles = team members (size = papers); lines = papers two members wrote together.
  function teamNetwork() {
    const ms = D.members;
    const yrsOf = {}, pairs = {};
    for (const w of D.works) {
      const yr = String(w.year || THIS_YEAR);
      w.lab.forEach((s) => { const y = (yrsOf[s] ||= {}); y[yr] = (y[yr] || 0) + 1; });
      const ks = w.lab.slice().sort();
      for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
        const id = `${ks[i]}|${ks[j]}`;
        const e = (pairs[id] ||= { id, a: ks[i], b: ks[j], yrs: {}, w: 0, works: [] });
        e.yrs[yr] = (e.yrs[yr] || 0) + 1; e.w++; e.works.push(w);
      }
    }
    const E = Object.values(pairs);
    const allYears = Object.values(yrsOf).flatMap((y) => Object.keys(y).map(Number)).filter((y) => y > 1900);
    const FIRST = Math.max(allYears.length ? Math.min(...E.flatMap((e) => Object.keys(e.yrs).map(Number)), THIS_YEAR) : THIS_YEAR, 1990);
    const NMAX = Math.max(1, ...ms.map((m) => Object.values(yrsOf[m.slug] || {}).reduce((a, b) => a + b, 0)));
    const EMAX = Math.max(1, ...E.map((e) => e.w));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // side panels: partnerships + institutions
    $("#net-side-a").textContent = "Collaborating institutions (whole team)";
    hbars($("#inst-bars"), D.summary.institutions, 12);
    $("#net-side-b").textContent = "Strongest partnerships in the team";
    const pairRows = E.map((e) => ({ ...e, names: `${members[e.a]?.name} & ${members[e.b]?.name}`, since: Math.min(...Object.keys(e.yrs).map(Number)) }));
    table($("#ext-table"), [
      { key: "names", label: "Members", html: (e) => esc(e.names) },
      { key: "w", label: "Joint papers", num: true },
      { key: "since", label: "Since", num: true },
    ], pairRows, { sort: "w", limit: 15 });

    const host = $("#network"); host.innerHTML = "";
    const W = host.clientWidth || 800, H = host.clientHeight || 600;
    const R_ISO = Math.min(W, H) * 0.43;
    const rad = (n) => 7 + 20 * Math.sqrt(n / NMAX);
    const width = (w) => 1 + 7 * Math.sqrt(w / EMAX);
    const C = { accent: css("--accent"), alum: css("--alum"), surface: css("--surface") };
    const svg = d3.select(host).append("svg").attr("class", "ego-svg").attr("viewBox", [-W / 2, -H / 2, W, H]);
    const world = svg.append("g");
    world.append("circle").attr("class", "iso-ring").attr("r", R_ISO);
    const linkG = world.append("g").attr("class", "links team");
    const nodeG = world.append("g").attr("class", "nodes");
    const labelG = world.append("g").attr("class", "labels");
    const state = new Map();
    let nodes = [], links = [], year = THIS_YEAR, timer = null, hover = null, selected = null, paused = false, dragging = false;
    const pins = loadPins("team");

    const sim = d3.forceSimulation()
      .force("charge", d3.forceManyBody().strength(-260).distanceMax(400))
      .force("link", d3.forceLink().id((d) => d.id).distance((l) => 150 - 70 * Math.sqrt(l.w / EMAX)).strength((l) => 0.15 + 0.5 * Math.sqrt(l.w / EMAX)))
      .force("collide", d3.forceCollide((d) => d.r + 16).iterations(2))
      .force("x", d3.forceX(0).strength((d) => (d.deg ? 0.06 : 0)))
      .force("y", d3.forceY(0).strength((d) => (d.deg ? 0.06 : 0)))
      .force("iso", d3.forceRadial(R_ISO, 0, 0).strength((d) => (d.deg ? 0 : 0.5)))   // not yet connected: outer ring
      .velocityDecay(0.4).on("tick", ticked);
    if (!reduce) sim.alphaTarget(0.01);
    let linkSel = linkG.selectAll("line"), nodeSel = nodeG.selectAll("g"), labelSel = labelG.selectAll("text");
    function ticked() {
      if (!paused && !reduce && !timer && !hover && !dragging) {
        const t = performance.now() / 1000;
        for (const d of nodes) { d.vx += Math.cos(t * 0.5 + d.phase) * 0.02; d.vy += Math.sin(t * 0.4 + d.phase) * 0.02; }
      }
      linkSel.attr("x1", (l) => l.source.x).attr("y1", (l) => l.source.y).attr("x2", (l) => l.target.x).attr("y2", (l) => l.target.y);
      nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      labelSel.attr("x", (d) => d.x).attr("y", (d) => d.y + d.r + 13);
    }

    function update(upto, animate) {
      year = upto; $("#net-year").value = upto;
      const final = upto >= THIS_YEAR;
      const vis = [];
      let fresh = 0;
      for (const m of ms) {
        const n = cumY(yrsOf[m.slug], upto);
        if (n < 1 && !final) continue;
        let d = state.get(m.slug);
        if (!d) { const a = Math.random() * 6.28; d = { id: m.slug, label: m.name, active: m.active, phase: Math.random() * 6.28, x: Math.cos(a) * 30, y: Math.sin(a) * 30 };
          if (pins[m.slug]) { [d.fx, d.fy] = pins[m.slug]; d.x = d.fx; d.y = d.fy; }
          state.set(m.slug, d); }
        if (!d.on) { d.born = true; fresh++; }
        d.on = true; d.n = n; d.r = rad(Math.max(n, 1)); d.deg = 0;
        vis.push(d);
      }
      for (const d of state.values()) if (!vis.includes(d)) d.on = false;
      const ids = new Set(vis.map((d) => d.id));
      links = [];
      for (const e of E) {
        if (!ids.has(e.a) || !ids.has(e.b)) continue;
        const w = final ? e.w : cumY(e.yrs, upto);
        if (w > 0) { links.push({ id: e.id, source: state.get(e.a), target: state.get(e.b), w, e }); state.get(e.a).deg++; state.get(e.b).deg++; }
      }
      nodes = vis;
      const dur = animate ? 700 : 0;
      linkSel = linkG.selectAll("line").data(links, (l) => l.id).join(
        (en) => en.append("line").attr("stroke-width", 0).call((s) => s.transition().duration(dur).attr("stroke-width", (l) => width(l.w))),
        (up) => up.call((s) => s.transition().duration(dur).attr("stroke-width", (l) => width(l.w))),
        (ex) => ex.transition().duration(dur / 2).attr("stroke-width", 0).remove());
      nodeSel = nodeG.selectAll("g.nd").data(nodes, (d) => d.id).join(
        (en) => { const g = en.append("g").attr("class", "nd");
          g.append("circle").attr("class", "dot").attr("fill", (d) => (d.active ? C.accent : C.alum)).attr("r", 0)
            .transition().duration(animate ? 900 : 0).ease(d3.easeBackOut.overshoot(1.7)).attr("r", (d) => d.r);
          return g; },
        (up) => up.call((g) => g.select("circle.dot").transition().duration(dur).attr("r", (d) => d.r)),
        (ex) => ex.call((g) => g.select("circle.dot").transition().duration(dur / 2).attr("r", 0)).transition().duration(dur / 2).remove());
      if (animate) nodeSel.filter((d) => d.born).each(function (d) {
        d3.select(this).insert("circle", ":first-child").attr("class", "ripple").attr("r", d.r).attr("stroke", d.active ? C.accent : C.alum)
          .transition().duration(1400).ease(d3.easeCubicOut).attr("r", d.r + 30).style("opacity", 0).remove();
      });
      nodes.forEach((d) => (d.born = false));
      labelSel = labelG.selectAll("text").data(nodes, (d) => d.id).join(
        (en) => en.append("text").attr("class", "lab").text((d) => d.label).style("opacity", 0).call((s) => s.transition().delay(dur * 0.5).duration(dur).style("opacity", 1)),
        (up) => up, (ex) => ex.remove());
      nodeSel.on("mouseenter", (ev, d) => { hover = d; tip(d, ev); dim(); }).on("mousemove", (ev, d) => tip(d, ev))
        .on("mouseleave", () => { hover = null; $("#tooltip").hidden = true; dim(); })
        .on("click", (ev, d) => { ev.stopPropagation(); selected = d.id; side(d.id); dim(); })
        .on("dblclick", (ev, d) => { ev.stopPropagation(); d.fx = d.fy = null; delete pins[d.id]; savePins("team", pins); nodeSel.classed("pinned", (n) => !!pins[n.id]); sim.alpha(0.3).restart(); })
        .call(d3.drag().on("start", (ev, d) => { dragging = true; if (!ev.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
          .on("end", (ev, d) => { dragging = false; if (!ev.active) sim.alphaTarget(reduce ? 0 : 0.01);
            pins[d.id] = [Math.round(d.fx), Math.round(d.fy)]; savePins("team", pins); nodeSel.classed("pinned", (n) => !!pins[n.id]); }));
      nodeSel.classed("pinned", (n) => !!pins[n.id]);
      linkSel.on("mousemove", (ev, l) => {
        const t = $("#tooltip"); t.hidden = false;
        t.innerHTML = `<b>${esc(l.source.label)} & ${esc(l.target.label)}</b><br>${l.w} joint paper${l.w === 1 ? "" : "s"}${final ? "" : ` by ${upto}`}`;
        t.style.left = `${Math.min(ev.clientX + 14, innerWidth - 300)}px`; t.style.top = `${ev.clientY + 14}px`;
      }).on("mouseleave", () => ($("#tooltip").hidden = true));
      sim.nodes(nodes); sim.force("link").links(links); sim.alpha(animate ? 0.6 : 1).restart();
      dim();
      const connected = nodes.filter((d) => d.deg).length;
      $("#net-year-big").textContent = final ? "" : upto;
      $("#net-year-label").textContent = `${FIRST}–${final ? THIS_YEAR : upto}`;
      $("#net-stats").textContent = `${connected} of ${nodes.length} member${nodes.length === 1 ? "" : "s"} connected · ${links.length} partnership${links.length === 1 ? "" : "s"}`;
    }
    function nb(d) { const s = new Set([d.id]); links.forEach((l) => { if (l.source.id === d.id) s.add(l.target.id); if (l.target.id === d.id) s.add(l.source.id); }); return s; }
    function dim() {
      const f = hover || (selected && state.get(selected));
      const keep = f ? nb(f) : null;
      nodeSel.classed("dim", (d) => keep && !keep.has(d.id)).classed("sel", (d) => d.id === selected);
      labelSel.classed("dim", (d) => keep && !keep.has(d.id));
      linkSel.classed("hot", (l) => f && (l.source.id === f.id || l.target.id === f.id)).classed("dim", (l) => keep && !(l.source.id === f.id || l.target.id === f.id));
    }
    function tip(d, ev) {
      const t = $("#tooltip"); t.hidden = false;
      t.innerHTML = `<b>${esc(d.label)}</b><br>${d.n} paper${d.n === 1 ? "" : "s"}${year < THIS_YEAR ? ` by ${year}` : ""} · ${d.deg} team partner${d.deg === 1 ? "" : "s"}`;
      t.style.left = `${Math.min(ev.clientX + 14, innerWidth - 300)}px`; t.style.top = `${ev.clientY + 14}px`;
    }
    function side(id) {
      const m = members[id];
      if (!m) {
        const conn = new Set(E.flatMap((e) => [e.a, e.b]));
        $("#net-info").innerHTML = `<h3>The whole team</h3>
          <p class="muted" style="margin:0 0 8px;font-size:13px">${conn.size} of ${ms.length} members have published together · ${E.length} partnerships · ${fmt(D.works.filter((w) => w.lab.length > 1).length)} joint papers</p>
          <p class="muted" style="font-size:12px">Members on the outer ring haven't co-authored with anyone in the team yet. Hover to light up someone's partners; click to see the papers.</p>`;
        return;
      }
      const mine = E.filter((e) => e.a === id || e.b === id).sort((x, y) => y.w - x.w);
      $("#net-info").innerHTML = `<h3>${esc(m.name)}</h3>
        <p class="muted" style="margin:0 0 8px;font-size:13px">${esc(m.role || "")} · ${mine.length} team partner${mine.length === 1 ? "" : "s"}</p>
        <p style="margin:0 0 8px"><a href="#analytics/${id}">See ${esc(m.name.split(" ")[0])}'s full network →</a></p>
        ${mine.map((e) => { const o = members[e.a === id ? e.b : e.a]; return `<b style="font-size:13px">${esc(o.name)} — ${e.w}</b><ul>${e.works.slice().sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 4).map((w) => `<li>${paperLink(w)} <span class="muted">(${w.year || "n.d."})</span></li>`).join("")}</ul>`; }).join("") || `<p class="empty">No joint papers with the team yet.</p>`}
        <p style="font-size:12px"><a href="#" id="net-back">← Whole team</a></p>`;
      $("#net-back").onclick = (e) => { e.preventDefault(); selected = null; dim(); side(null); };
    }

    // camera + swipe + timeline (same controls as the individual view)
    const zoom = d3.zoom().scaleExtent([0.25, 5]).filter((ev) => (ev.type === "wheel" ? ev.ctrlKey : !ev.button && ev.type !== "dblclick"))
      .on("zoom", (ev) => world.attr("transform", ev.transform));
    const fit = () => d3.zoomIdentity.scale(Math.min(W, H) / (2 * (R_ISO + 50)));
    svg.call(zoom).call(zoom.transform, fit());
    svg.on("click", () => { selected = null; dim(); side(null); });
    let swipe = 0, lastStep = 0;
    const onWheel = (ev) => {
      if (ev.ctrlKey || Math.abs(ev.deltaX) <= Math.abs(ev.deltaY)) return;
      ev.preventDefault(); swipe += ev.deltaX;
      const now = performance.now();
      if (Math.abs(swipe) > 70 && now - lastStep > 160) {
        const next = Math.min(THIS_YEAR, Math.max(FIRST, year + Math.sign(swipe))); swipe = 0; lastStep = now;
        if (next !== year) { stop(); update(next, true); }
      }
    };
    host.addEventListener("wheel", onWheel, { passive: false });
    $("#net-zoom-in").onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1.35);
    $("#net-zoom-out").onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.35);
    $("#net-fit").onclick = () => svg.transition().duration(500).call(zoom.transform, fit());
    $("#net-unpin").onclick = () => { for (const k in pins) delete pins[k]; savePins("team", pins); state.forEach((d) => (d.fx = d.fy = null)); nodeSel.classed("pinned", false); sim.alpha(0.8).restart(); };
    const slider = $("#net-year"), playBtn = $("#net-play");
    slider.min = FIRST; slider.max = THIS_YEAR; slider.value = THIS_YEAR;
    $(".net-card .timeline").hidden = FIRST >= THIS_YEAR;
    function stop(label = "▶ Play") { clearInterval(timer); timer = null; playBtn.textContent = label; }
    playBtn.onclick = () => {
      if (timer) { stop(); return; }
      if (year >= THIS_YEAR) update(FIRST, true);
      playBtn.textContent = "❚❚ Pause";
      timer = setInterval(() => { if (year >= THIS_YEAR) { stop("↻ Replay"); return; } update(year + 1, true); }, 1500);
    };
    slider.oninput = () => { stop(); update(Number(slider.value), true); };
    $("#net-search").value = "";
    $("#net-search").onchange = $("#net-search").onkeydown = (e) => {
      if (e.type === "keydown" && e.key !== "Enter") return;
      const q = e.target.value.trim().toLowerCase();
      const hit = q && ms.find((m) => m.name.toLowerCase().includes(q));
      if (hit) { selected = hit.slug; side(hit.slug); dim(); }
    };
    update(THIS_YEAR, true);
    side(null);
    return {
      slug: "team",
      pause() { paused = true; stop(); sim.stop(); },
      resume() { if (paused) { paused = false; sim.alpha(0.2).restart(); } },
      destroy() { stop(); sim.stop(); host.removeEventListener("wheel", onWheel); $("#tooltip").hidden = true; host.innerHTML = ""; },
    };
  }

  function egoNetwork(m) {
    const G = egoData(m);
    const P = Object.values(G.people), E = Object.values(G.pairs);
    const egoYears = Object.keys(G.egoY).map(Number).filter((y) => y > 1900);
    const FIRST = egoYears.length ? Math.min(...egoYears) : THIS_YEAR;
    const PMAX = Math.max(1, ...P.map((p) => p.papers)), EMAX = Math.max(1, ...E.map((e) => e.w));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("#net-min").value = P.length > 200 ? "3" : P.length > 60 ? "2" : "1";

    // ---- side panels
    $("#net-side-a").textContent = "Collaborating institutions";
    $("#net-side-b").textContent = "Co-authors";
    hbars($("#inst-bars"), Object.entries(G.instCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count), 12);
    const since = (p) => Math.min(...Object.keys(p.yrs).map(Number));
    table($("#ext-table"), [
      { key: "label", label: "Name", html: (p) => `${esc(p.label)} ${p.lab ? '<span class="tag">lab</span>' : ""}<div class="sub">${esc(p.lab ? "" : p.inst || "")}</div>` },
      { key: "papers", label: "Joint papers", num: true },
      { key: "since", label: "Since", num: true, val: since, html: since },
    ], P, { sort: "papers", limit: 15 });

    // ---- geometry: orbit radius shrinks as the tie gets stronger
    const host = $("#network");
    host.innerHTML = "";
    const W = host.clientWidth || 800, H = host.clientHeight || 600;
    const R_IN = 95, R_OUT = 300;
    const orbit = (n) => (PMAX <= 1 ? R_OUT : R_IN + (R_OUT - R_IN) * (1 - Math.sqrt((n - 1) / (PMAX - 1))));
    const rad = (n) => 4.5 + 20 * Math.sqrt(n / PMAX);
    const EGO_R = 30;
    const width = (w) => 0.7 + 5 * Math.sqrt(w / EMAX);
    const C = { accent: css("--accent"), alum: css("--alum"), ext: css("--ext"), ego: css("--ego"), text: css("--text"),
      muted: css("--muted"), surface: css("--surface"), line: css("--border") };
    const fill = (d) => (d.ego ? C.ego : d.lab ? (d.active ? C.accent : C.alum) : C.ext);

    const svg = d3.select(host).append("svg").attr("class", "ego-svg").attr("viewBox", [-W / 2, -H / 2, W, H]);
    const defs = svg.append("defs");
    const glow = defs.append("radialGradient").attr("id", "ego-glow");
    glow.append("stop").attr("offset", "0%").attr("stop-color", C.ego).attr("stop-opacity", 0.35);
    glow.append("stop").attr("offset", "100%").attr("stop-color", C.ego).attr("stop-opacity", 0);
    const world = svg.append("g");
    const spin = world.append("g");                 // slowly rotating layer (rings stay still)
    const ringsG = world.insert("g", ":first-child").attr("class", "rings");
    const linkG = spin.append("g").attr("class", "links");
    const spokeG = spin.append("g").attr("class", "spokes");
    const nodeG = spin.append("g").attr("class", "nodes");
    const labelG = world.append("g").attr("class", "labels");

    // guide rings: "1 paper", "2", "5", "10"... together
    const ticks = [1, 2, 3, 5, 10, 20, 50, 100].filter((t) => t <= PMAX && (t === 1 || t === PMAX || t <= PMAX * 0.8));
    ringsG.selectAll("circle").data(ticks).join("circle").attr("r", orbit);
    ringsG.selectAll("text").data(ticks).join("text").attr("x", (t) => orbit(t) * 0.7071 + 4).attr("y", (t) => orbit(t) * 0.7071 + 3)
      .text((t) => `${t} paper${t === 1 ? "" : "s"}`);
    ringsG.append("circle").attr("r", EGO_R * 2.4).attr("class", "halo").attr("fill", "url(#ego-glow)");

    // ---- nodes kept across years so they glide instead of jumping
    const egoNode = { id: m.slug, label: m.name, ego: true, fx: 0, fy: 0, x: 0, y: 0, r: EGO_R, n: 0 };
    const pinView = "ego:" + m.slug, pins = loadPins(pinView);
    const state = new Map([[m.slug, egoNode]]);
    let nodes = [egoNode], links = [], year = THIS_YEAR, timer = null, hover = null, selected = null;

    const sim = d3.forceSimulation()
      .force("charge", d3.forceManyBody().strength((d) => (d.ego ? -400 : -30)).distanceMax(220))
      .force("collide", d3.forceCollide((d) => d.r + 3).iterations(2))
      .force("orbit", d3.forceRadial((d) => (d.ego ? 0 : orbit(d.n)), 0, 0).strength(0.32))
      .force("link", d3.forceLink().id((d) => d.id).distance(40).strength((l) => 0.02 + 0.05 * Math.sqrt(l.w / EMAX)))
      .alphaDecay(0.03).velocityDecay(0.38)
      .on("tick", ticked);
    const heavy = () => nodes.length > 180 || links.length > 1500;
    let t0 = performance.now(), angle = 0;

    function ticked() {
      if (!reduce && !heavy() && !timer && !hover) {     // gentle floating when idle
        const t = performance.now() / 1000;
        for (const d of nodes) if (!d.ego) { d.vx += Math.cos(t * 0.6 + d.phase) * 0.015; d.vy += Math.sin(t * 0.5 + d.phase) * 0.015; }
      }
      linkSel.attr("x1", (l) => l.source.x).attr("y1", (l) => l.source.y).attr("x2", (l) => l.target.x).attr("y2", (l) => l.target.y);
      spokeSel.attr("x2", (d) => d.x).attr("y2", (d) => d.y);
      nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      const rot = (angle * Math.PI) / 180, cos = Math.cos(rot), sin = Math.sin(rot);
      labelSel.attr("transform", (d) => `translate(${d.x * cos - d.y * sin},${d.x * sin + d.y * cos + d.r + 12})`);
    }
    // slow rotation of the whole constellation while idle
    const spinTimer = reduce ? null : d3.timer((ms) => {
      const now = performance.now(), dt = now - t0; t0 = now;
      if (!paused && !hover && !timer && !heavy() && !dragging && !Object.keys(pins).length) { angle = (angle + dt * 0.0016) % 360; spin.attr("transform", `rotate(${angle})`); ticked(); }
    });
    if (!reduce) sim.alphaTarget(0.012);

    let linkSel = linkG.selectAll("line"), spokeSel = spokeG.selectAll("line"), nodeSel = nodeG.selectAll("g"), labelSel = labelG.selectAll("text");
    let dragging = false, paused = false;

    function update(upto, animate) {
      year = upto;
      $("#net-year").value = upto;
      const min = Number($("#net-min").value), final = upto >= THIS_YEAR;
      const vis = [];
      let fresh = 0;
      for (const p of P) {
        const n = final ? p.papers : cumY(p.yrs, upto);
        if (n < Math.max(min, 1)) continue;
        let d = state.get(p.id);
        if (!d) {
          const a = Math.random() * 2 * Math.PI;
          d = { ...p, phase: Math.random() * 6.28, x: Math.cos(a) * 20, y: Math.sin(a) * 20, vx: Math.cos(a) * 6, vy: Math.sin(a) * 6 };
          if (pins[p.id]) { [d.fx, d.fy] = pins[p.id]; }
          state.set(p.id, d);
        }
        if (!d.on) { d.born = true; fresh++; }
        d.on = true; d.n = n; d.r = rad(n);
        vis.push(d);
      }
      for (const d of state.values()) if (!d.ego && !vis.includes(d)) { d.on = false; d.born = false; }
      egoNode.n = final ? G.works.length : cumY(G.egoY, upto);
      nodes = [egoNode, ...vis];
      const ids = new Set(nodes.map((d) => d.id));
      links = [];
      for (const e of E) {
        if (!ids.has(e.a) || !ids.has(e.b)) continue;
        const w = final ? e.w : cumY(e.yrs, upto);
        if (w > 0) links.push({ id: e.id, source: state.get(e.a), target: state.get(e.b), w });
      }

      const dur = animate ? 700 : 0;
      linkSel = linkG.selectAll("line").data(links, (l) => l.id).join(
        (en) => en.append("line").attr("stroke-width", 0).call((s) => s.transition().duration(dur).attr("stroke-width", (l) => width(l.w))),
        (up) => up.call((s) => s.transition().duration(dur).attr("stroke-width", (l) => width(l.w))),
        (ex) => ex.transition().duration(dur / 2).attr("stroke-width", 0).remove());
      spokeSel = spokeG.selectAll("line").data(vis, (d) => d.id).join(
        (en) => en.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 0).attr("stroke-width", 0)
          .call((s) => s.transition().duration(dur).attr("stroke-width", (d) => width(d.n))),
        (up) => up.call((s) => s.transition().duration(dur).attr("stroke-width", (d) => width(d.n))),
        (ex) => ex.transition().duration(dur / 2).attr("stroke-width", 0).remove());
      nodeSel = nodeG.selectAll("g.nd").data(nodes, (d) => d.id).join(
        (en) => {
          const g = en.append("g").attr("class", (d) => `nd${d.ego ? " ego" : ""}`);
          g.append("circle").attr("class", "dot").attr("fill", fill).attr("r", 0)
            .transition().duration(animate ? 900 : 0).ease(d3.easeBackOut.overshoot(1.7)).attr("r", (d) => d.r);
          return g;
        },
        (up) => up.call((g) => g.select("circle.dot").transition().duration(dur).ease(d3.easeCubicOut).attr("r", (d) => d.r)),
        (ex) => ex.call((g) => g.select("circle.dot").transition().duration(dur / 2).attr("r", 0)).transition().duration(dur / 2).remove());
      if (animate) nodeSel.filter((d) => d.born && !d.ego).each(function (d) {   // a ripple when someone new joins
        d3.select(this).insert("circle", ":first-child").attr("class", "ripple").attr("r", d.r).attr("stroke", fill(d))
          .transition().duration(1400).ease(d3.easeCubicOut).attr("r", d.r + 30).style("opacity", 0).remove();
      });
      nodes.forEach((d) => (d.born = false));
      const topK = new Set(vis.slice().sort((x, z) => z.n - x.n).slice(0, 24).map((d) => d.id));
      const showLabel = (d) => d.ego || d.lab || vis.length <= 30 || (topK.has(d.id) && d.n >= 2);
      labelSel = labelG.selectAll("text").data(nodes.filter(showLabel), (d) => d.id).join(
        (en) => en.append("text").attr("class", (d) => (d.ego ? "ego" : d.lab ? "lab" : "")).text((d) => d.label).style("opacity", 0)
          .call((s) => s.transition().delay(dur * 0.6).duration(dur).style("opacity", 1)),
        (up) => up,
        (ex) => ex.transition().duration(dur / 2).style("opacity", 0).remove());
      nodeSel.on("mouseenter", (ev, d) => focus(d, ev)).on("mousemove", (ev, d) => tip(d, ev)).on("mouseleave", () => focus(null))
        .on("click", (ev, d) => { ev.stopPropagation(); selected = d.ego ? null : d.id; showNode(selected); applyDim(); })
        .call(d3.drag().filter((ev) => !ev.button)
          .on("start", (ev, d) => { dragging = true; if (!ev.active) sim.alphaTarget(0.2).restart(); if (!d.ego) { d.fx = d.x; d.fy = d.y; } })
          .on("drag", (ev, d) => { if (!d.ego) { d.fx = ev.x; d.fy = ev.y; } })
          .on("end", (ev, d) => { dragging = false; if (!ev.active) sim.alphaTarget(reduce ? 0 : 0.012);
            if (!d.ego) { pins[d.id] = [Math.round(d.fx), Math.round(d.fy)]; savePins(pinView, pins); nodeSel.classed("pinned", (n) => !!pins[n.id]); } }));
      nodeSel.on("dblclick", (ev, d) => { ev.stopPropagation(); if (d.ego) return; d.fx = d.fy = null; delete pins[d.id]; savePins(pinView, pins);
        nodeSel.classed("pinned", (n) => !!pins[n.id]); sim.alpha(0.3).restart(); });
      nodeSel.classed("pinned", (n) => !!pins[n.id]);

      sim.nodes(nodes);
      sim.force("link").links(links);
      sim.alpha(animate ? 0.6 : 0.9).restart();
      applyDim();

      $("#net-year-big").textContent = final ? "" : upto;
      $("#net-year-label").textContent = `${FIRST}–${final ? THIS_YEAR : upto}`;
      $("#net-stats").textContent = final ? "" : `${vis.length} co-author${vis.length === 1 ? "" : "s"}${animate && fresh ? ` · +${fresh} new` : ""}`;
    }

    // ---- hover: light up a person and their direct ties
    function neighbours(d) {
      const s = new Set([d.id, m.slug]);
      links.forEach((l) => { if (l.source.id === d.id) s.add(l.target.id); if (l.target.id === d.id) s.add(l.source.id); });
      return s;
    }
    function applyDim() {
      const f = hover || (selected && state.get(selected));
      const keep = f && !f.ego ? neighbours(f) : null;
      nodeSel.classed("dim", (d) => keep && !keep.has(d.id)).classed("sel", (d) => d.id === selected);
      labelSel.classed("dim", (d) => keep && !keep.has(d.id));
      linkSel.classed("hot", (l) => f && !f.ego && (l.source.id === f.id || l.target.id === f.id)).classed("dim", (l) => keep && !(l.source.id === f.id || l.target.id === f.id));
      spokeSel.classed("hot", (d) => f && d.id === f.id).classed("dim", (d) => keep && d.id !== f.id);
    }
    const tipEl = $("#tooltip");
    function tip(d, ev) {
      tipEl.hidden = false;
      tipEl.innerHTML = d.ego ? `<b>${esc(d.label)}</b><br>${d.n} paper${d.n === 1 ? "" : "s"}${year < THIS_YEAR ? ` by ${year}` : ""}`
        : `<b>${esc(d.label)}</b>${d.inst && !d.lab ? `<br>${esc(d.inst)}` : ""}<br>${d.n} paper${d.n === 1 ? "" : "s"} with ${esc(m.name)} · since ${since(d)}`;
      tipEl.style.left = `${Math.min(ev.clientX + 14, innerWidth - 300)}px`; tipEl.style.top = `${ev.clientY + 14}px`;
    }
    function focus(d, ev) { hover = d; if (d) tip(d, ev); else tipEl.hidden = true; applyDim(); }

    // ---- camera: pinch / ctrl+scroll zooms, drag pans; sideways swipe moves through the years
    const fitScale = () => Math.min(W, H) / (2 * (R_OUT + 45));
    const zoom = d3.zoom().scaleExtent([0.25, 5])
      .filter((ev) => (ev.type === "wheel" ? ev.ctrlKey : !ev.button && ev.type !== "dblclick"))
      .on("zoom", (ev) => world.attr("transform", ev.transform));
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity.scale(fitScale()));
    svg.on("click", () => { selected = null; showNode(null); applyDim(); });
    let swipe = 0, lastStep = 0;
    const onWheel = (ev) => {
      if (ev.ctrlKey) return;                                   // pinch: handled by d3.zoom
      if (Math.abs(ev.deltaX) <= Math.abs(ev.deltaY)) return;   // vertical: let the page scroll
      ev.preventDefault();                                      // also stops the browser's back-swipe
      swipe += ev.deltaX;
      const now = performance.now();
      if (Math.abs(swipe) > 70 && now - lastStep > 160) {
        const next = Math.min(THIS_YEAR, Math.max(FIRST, year + Math.sign(swipe)));
        swipe = 0; lastStep = now;
        if (next !== year) { stop(); update(next, true); }
      }
    };
    host.addEventListener("wheel", onWheel, { passive: false });
    $("#net-zoom-in").onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1.35);
    $("#net-zoom-out").onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.35);
    $("#net-fit").onclick = () => svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity.scale(fitScale()));
    $("#net-unpin").onclick = () => { for (const k in pins) delete pins[k]; savePins(pinView, pins); state.forEach((d) => { if (!d.ego) d.fx = d.fy = null; }); nodeSel.classed("pinned", false); sim.alpha(0.8).restart(); };

    // ---- timeline
    const slider = $("#net-year"), playBtn = $("#net-play");
    slider.min = FIRST; slider.max = THIS_YEAR; slider.value = THIS_YEAR;
    $(".net-card .timeline").hidden = FIRST >= THIS_YEAR;
    function stop(label = "▶ Play") { clearInterval(timer); timer = null; playBtn.textContent = label; }
    playBtn.onclick = () => {
      if (timer) { stop(); return; }
      if (year >= THIS_YEAR) update(FIRST, true);
      playBtn.textContent = "❚❚ Pause";
      timer = setInterval(() => {
        if (year >= THIS_YEAR) { stop("↻ Replay"); return; }
        update(year + 1, true);
      }, 1500);
    };
    slider.oninput = () => { stop(); update(Number(slider.value), true); };
    $("#net-min").onchange = () => update(year, true);

    // ---- side panel
    function showNode(id) {
      const p = G.people[id];
      if (!p) {
        const top = P.slice().sort((a, b) => b.papers - a.papers).slice(0, 10);
        const dropped = m.openalex_counts?.dropped;
        $("#net-info").innerHTML = `<h3>${esc(m.name)}</h3>
          <p class="muted" style="margin:0 0 8px;font-size:13px">${fmt(P.length)} co-author${P.length === 1 ? "" : "s"} across ${fmt(G.works.length)} papers${FIRST < THIS_YEAR ? ` since ${FIRST}` : ""}</p>
          <p style="margin:0 0 8px"><a href="#member/${m.slug}">Open member page →</a></p>
          ${top.length ? `<b style="font-size:13px">Most frequent co-authors</b><ul>${top.map((q) => `<li>${esc(q.label)} — ${q.papers}${q.lab ? "" : `<br><span class="muted">${esc(q.inst || "")}</span>`}</li>`).join("")}</ul>` : ""}
          <p class="muted" style="font-size:12px">Hover to light up someone's ties; click to see the papers you share.</p>
          ${dropped ? `<p class="muted" style="font-size:12px">${dropped} paper${dropped === 1 ? "" : "s"} OpenAlex attributes to ${esc(m.name)} but that aren't on their Google Scholar profile are left out.</p>` : ""}`;
        return;
      }
      const ws = p.works.slice().sort((a, b) => (b.year || 0) - (a.year || 0));
      $("#net-info").innerHTML = `<h3>${esc(p.label)}</h3>
        <p class="muted" style="margin:0 0 8px;font-size:13px">${p.lab ? "Lab member" : esc(p.inst || "Outside collaborator")} · ${p.papers} paper${p.papers === 1 ? "" : "s"} with ${esc(m.name)}</p>
        ${p.lab ? `<p style="margin:0 0 8px"><a href="#analytics/${p.id}">Centre the network on ${esc(p.label)} →</a></p>` : ""}
        <ul>${ws.slice(0, 12).map((w) => `<li>${paperLink(w)} <span class="muted">(${w.year || "n.d."})</span></li>`).join("")}</ul>
        ${ws.length > 12 ? `<p class="muted" style="font-size:12px">+ ${ws.length - 12} more</p>` : ""}
        <p style="font-size:12px"><a href="#" id="net-back">← Back to ${esc(m.name)}</a></p>`;
      $("#net-back").onclick = (e) => { e.preventDefault(); selected = null; applyDim(); showNode(null); };
    }
    $("#net-search").value = "";
    $("#net-search").onchange = $("#net-search").onkeydown = (e) => {
      if (e.type === "keydown" && e.key !== "Enter") return;
      const q = e.target.value.trim().toLowerCase();
      const hit = q && P.find((n) => n.label.toLowerCase().includes(q));
      if (!hit) return;
      if (!state.get(hit.id)?.on) { stop(); $("#net-min").value = "1"; update(THIS_YEAR, true); }
      selected = hit.id; showNode(hit.id); applyDim();
    };

    update(THIS_YEAR, true);   // first view: everyone flies out from the centre
    showNode(null);
    return {
      slug: m.slug,
      pause() { paused = true; stop(); sim.stop(); },
      resume() { if (paused) { paused = false; sim.alpha(0.2).restart(); } },
      destroy() { stop(); sim.stop(); spinTimer?.stop(); host.removeEventListener("wheel", onWheel); tipEl.hidden = true; host.innerHTML = ""; },
    };
  }

  // ------------------------------------------------------------ venues
  function renderVenues() {
    const years = [...new Set(D.works.map((w) => w.year).filter(Boolean))].sort((a, b) => a - b);
    const fromSel = $("#venue-from"), toSel = $("#venue-to"), typeSel = $("#venue-type"), memSel = $("#venue-member"), q = $("#venue-search");
    fromSel.innerHTML = years.map((y) => `<option>${y}</option>`).join("");
    toSel.innerHTML = years.slice().reverse().map((y) => `<option>${y}</option>`).join("");
    fromSel.value = Math.max(years[0], THIS_YEAR - 4); toSel.value = years[years.length - 1];
    KINDS.forEach((k) => typeSel.insertAdjacentHTML("beforeend", `<option value="${esc(k)}">${esc(k)}</option>`));
    D.members.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((m) => memSel.insertAdjacentHTML("beforeend", `<option value="${m.slug}">${esc(m.name)}</option>`));
    const VI = D.venues || {};
    const cites = (w) => (w.gs_c ?? w.cited_by_count) || 0;
    const rankHtml = (x) => {
      const v = VI[x.name] || {};
      const r = v.rank ? `<span class="tag" title="${esc(v.src || "")}">${esc(v.rank)}</span>` : `<span class="muted">unranked</span>`;
      return r + (v.verified ? "" : ` <span class="tag uv" title="Type and rank are automatic until this venue is reviewed in venues.yaml">not verified</span>`);
    };
    const cols = [
      { key: "name", label: "Venue", html: (x) => `${esc(x.name)} <span class="tag" style="border-left:3px solid var(${KIND_COL[x.kind]})">${esc(x.kind)}</span>` },
      { key: "rankv", label: "Rank", val: (x) => { const v = VI[x.name] || {}; return v.rank ? TIER_SORT.indexOf(v.tier) : 99; }, html: rankHtml },
      { key: "papers", label: "Papers", num: true },
      { key: "citations", label: "Citations", num: true, html: (x) => fmt(x.citations) },
      { key: "avg", label: "Cites / paper", num: true, html: (x) => x.avg.toFixed(1) },
      { key: "impact", label: "Impact", num: true, val: (x) => (VI[x.name] || {}).impact ?? -1,
        html: (x) => { const i = (VI[x.name] || {}).impact; return i == null ? "–" : `<span title="OpenAlex 2-year mean citedness, similar to an impact factor">${i.toFixed(1)}</span>`; } },
      { key: "nmem", label: "Members", num: true },
      { key: "first", label: "Years", num: true, html: (x) => (x.first === x.last ? x.first : `${x.first}–${x.last}`) },
    ];
    const TIER_SORT = D.tier_order || [];
    let t = null;
    function refresh() {
      let from = Number(fromSel.value), to = Number(toSel.value);
      if (from > to) { [from, to] = [to, from]; fromSel.value = from; toSel.value = to; }
      const ws = D.works.filter((w) => w.year && w.year >= from && w.year <= to && (!memSel.value || w.lab.includes(memSel.value)));
      const v = {};
      ws.forEach((w) => {
        if (!w.vkey) return;
        const x = (v[w.vkey] ||= { name: w.vkey, kind: w.kind, papers: 0, citations: 0, members: new Set(), first: 9999, last: 0 });
        x.papers++; x.citations += cites(w); w.lab.forEach((s) => x.members.add(s));
        x.first = Math.min(x.first, w.year); x.last = Math.max(x.last, w.year);
      });
      const all = Object.values(v).map((x) => ({ ...x, nmem: x.members.size, avg: x.citations / x.papers }));
      const n = (k) => ws.filter((w) => w.kind === k).length;
      const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "–");
      const jn = ws.filter((w) => w.kind === "Journal"), cf = ws.filter((w) => w.kind === "Conference");
      const jTop = jn.filter((w) => ["Q1 journals", "Q2 journals", "A* journals", "A journals"].includes(w.tier)).length;
      const cTop = cf.filter((w) => ["A* conferences", "A conferences"].includes(w.tier)).length;
      const unv = ws.filter((w) => w.vkey && !(VI[w.vkey] || {}).verified).length;
      const span = from === to ? `in ${from}` : `${from}–${to}`;
      kpis($("#venue-kpis"), [
        [fmt(ws.length), "Papers", `${span} · ${fmt(n("Journal"))} journal, ${fmt(n("Conference"))} conference`],
        [pct(jTop, jn.length), "Journal papers in Q1–Q2", `${fmt(jTop)} of ${fmt(jn.length)} · SCImago`],
        [pct(cTop, cf.length), "Conference papers at A*/A", `${fmt(cTop)} of ${fmt(cf.length)} · ICORE`],
        [pct(n("Book / chapter") + n("Preprint / repository"), ws.length), "Books & preprints", `${fmt(n("Book / chapter"))} books/chapters, ${fmt(n("Preprint / repository"))} preprints`],
        [fmt(unv), "Papers in unreviewed venues", unv ? "type and rank are automatic" : "all venues reviewed"],
      ]);
      const term = q.value.trim().toLowerCase();
      const rows = all.filter((x) => (!typeSel.value || x.kind === typeSel.value) && (!term || x.name.toLowerCase().includes(term)));
      $("#venue-count").textContent = `${fmt(rows.length)} venue${rows.length === 1 ? "" : "s"}`;
      if (t) t.update(rows); else t = table($("#venue-table"), cols, rows, { sort: "papers", limit: 30 });
      renderTopVenues(ws.filter((w) => (!typeSel.value || w.kind === typeSel.value) && (!term || (w.vkey || "").toLowerCase().includes(term))), span);
    }
    fromSel.onchange = toSel.onchange = typeSel.onchange = memSel.onchange = refresh;
    q.oninput = refresh;
    refresh();
  }

  // ------------------------------------------------------------ venues: top-ranked venues and the papers in them
  const TOP_RANKS = ["A*", "Q1", "A", "Q2", "B", "C"];
  const topOn = new Set((() => { try { return JSON.parse(localStorage.getItem("lab-top-ranks")); } catch { return null; } })() || ["A*", "Q1", "A", "B"]);
  let topAll = false;
  function renderTopVenues(ws, span) {
    const VI = D.venues || {};
    const rankOf = (w) => (w.rank !== undefined ? w.rank : (VI[w.vkey] || {}).rank) || "";   // a paper's own rank wins
    const srcOf = (w) => (w.rank !== undefined ? "set for this paper in venues.yaml" : (VI[w.vkey] || {}).src || "");
    const label = (w) => (srcOf(w).startsWith("CORE journals") ? `CORE ${rankOf(w)}` : rankOf(w));
    const counts = {};
    ws.forEach((w) => { const r = rankOf(w); if (TOP_RANKS.includes(r)) counts[r] = (counts[r] || 0) + 1; });
    $("#top-ranks").innerHTML = TOP_RANKS.map((r) => `<button type="button" class="chip ${topOn.has(r) ? "on" : ""}" aria-pressed="${topOn.has(r)}" data-r="${esc(r)}">${esc(r)} <span>${fmt(counts[r] || 0)}</span></button>`).join("");
    $("#top-ranks").querySelectorAll("button").forEach((b) => (b.onclick = () => {
      topOn.has(b.dataset.r) ? topOn.delete(b.dataset.r) : topOn.add(b.dataset.r);
      try { localStorage.setItem("lab-top-ranks", JSON.stringify([...topOn])); } catch {}
      renderTopVenues(ws, span);
    }));
    // group by venue + rank (a paper with its own rank sits apart from its venue's other papers)
    const groups = {};
    ws.filter((w) => w.vkey && topOn.has(rankOf(w))).forEach((w) => {
      const k = `${w.vkey}|${label(w)}`;
      (groups[k] ||= { name: w.vkey, kind: w.kind, rank: rankOf(w), label: label(w), src: srcOf(w),
        verified: w.rank !== undefined || (VI[w.vkey] || {}).verified, papers: [] }).papers.push(w);
    });
    const order = (g) => TOP_RANKS.indexOf(g.rank) + (g.label.startsWith("CORE") ? 0.5 : 0);   // CORE journal ranks after ICORE/SCImago
    const G = Object.values(groups).sort((a, b) => order(a) - order(b) || b.papers.length - a.papers.length || a.name.localeCompare(b.name));
    const nP = G.reduce((t, g) => t + g.papers.length, 0);
    $("#top-sub").textContent = G.length
      ? `${fmt(nP)} paper${nP === 1 ? "" : "s"} in ${fmt(G.length)} venue${G.length === 1 ? "" : "s"} ranked ${[...topOn].filter((r) => TOP_RANKS.includes(r)).sort((a, b) => TOP_RANKS.indexOf(a) - TOP_RANKS.indexOf(b)).join(", ")} · ${span}`
      : "";
    const team = (w) => w.lab.map((s) => members[s]?.name || s).join(", ");
    const LIMIT = 12, shown = topAll ? G : G.slice(0, LIMIT);
    $("#top-more").innerHTML = G.length > LIMIT ? `<button type="button" class="btn">${topAll ? "Show fewer" : `Show all ${G.length} venues`}</button>` : "";
    if (G.length > LIMIT) $("#top-more button").onclick = () => { topAll = !topAll; renderTopVenues(ws, span); };
    $("#top-venues").innerHTML = !G.length ? `<p class="empty">No papers in venues with these ranks for the filters above.</p>` : shown.map((g) => `
      <div class="tv">
        <div class="tv-h"><span class="badge ${isTopRank(g.rank) && !g.label.startsWith("CORE") ? "hi" : ""} ${g.verified ? "" : "uv"}" title="${esc(g.label)} · ${esc(g.src)}${g.verified ? "" : " (not yet verified in venues.yaml)"}">${esc(g.label)}</span>
          <div><div class="tv-n">${esc(g.name)}</div><div class="tv-k">${esc(g.kind)} · ${g.papers.length} paper${g.papers.length === 1 ? "" : "s"}</div></div></div>
        <ul>${g.papers.sort((a, b) => b.year - a.year || wCites(b) - wCites(a)).map((w) => `
          <li><span class="tv-y">${w.year}</span><div><div class="t">${paperLink(w)}</div><div class="m">${esc(team(w))}</div></div></li>`).join("")}</ul>
      </div>`).join("");
  }

  // ------------------------------------------------------------ papers
  function renderPapers() {
    const ms = $("#p-member"), ys = $("#p-year");
    D.members.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((m) => ms.insertAdjacentHTML("beforeend", `<option value="${m.slug}">${esc(m.name)}</option>`));
    // OpenAlex papers + papers that are only on Google Scholar profiles
    const rows = D.works.map((w) => ({ ...w, c: w.gs_c ?? w.cited_by_count, src: w.gs_c != null ? "GS" : "OA", link: w.doi, scholarOnly: !!w.scholar_only }))
      .concat((D.extra_papers || []).map((p, i) => ({ id: "x" + i, title: p.t, year: p.y, venue: p.v, c: p.c, src: "GS", link: p.u, lab: p.m, authors: [], scholarOnly: true })));
    [...new Set(rows.map((w) => w.year).filter(Boolean))].sort((a, b) => b - a).forEach((y) => ys.insertAdjacentHTML("beforeend", `<option>${y}</option>`));
    const cols = [
      { key: "title", label: "Title", cls: "title", html: (w) => `${paperLink(w)}
          <div class="sub">${w.authors.length ? esc(shortAuthors(w)) + " · " : ""}${w.venue ? `<i>${esc(w.venue)}</i>` : ""}${w.kind ? ` · ${esc(w.kind)}` : ""}${w.versions > 1 ? ` · ${w.versions} versions merged` : ""}${w.scholarOnly ? ` · <span title="Listed on Google Scholar but not found in OpenAlex">Scholar only</span>` : ""}</div>` },
      { key: "year", label: "Year", num: true },
      { key: "c", label: "Citations", num: true, html: (w) => `${fmt(w.c || 0)}${w.src === "OA" ? ' <span class="tag" title="Not matched to a Google Scholar entry; OpenAlex count shown">OA</span>' : ""}` },
      { key: "lab", label: "Lab authors", val: (w) => w.lab.length,
        html: (w) => w.lab.map((s) => `<a class="tag" href="#member/${s}">${esc(members[s]?.name || s)}</a>`).join(" ") },
    ];
    rows.forEach((w) => (w._q = `${w.title} ${w.venue || ""} ${w.authors.map((a) => a.name).join(" ")}`.toLowerCase()));
    const filtered = () => {
      const q = $("#p-search").value.trim().toLowerCase(), m = ms.value, y = Number(ys.value);
      const r = rows.filter((w) => (!q || w._q.includes(q)) && (!m || w.lab.includes(m)) && (!y || w.year === y));
      $("#p-count").textContent = `${fmt(r.length)} paper${r.length === 1 ? "" : "s"} · citations from Google Scholar where matched`;
      return r;
    };
    const t = table($("#papers-table"), cols, filtered(), { sort: "c", limit: 100 });
    $("#p-search").oninput = ms.onchange = ys.onchange = () => t.update(filtered());
  }
})();
