/* Le Clos de l'Arc : données de démonstration pour le panneau de réservation OBT.
 *
 * Le panneau est le vrai script de l'application (obt-gestion.com/blocks/obt-booking.js), le même que
 * sur le site de T'Nature. Le Clos de l'Arc n'a pas encore de compte dans l'application : ce fichier
 * répond à sa place, dans le navigateur, pour une adresse factice (DEMO_API). Rien n'est lu dans
 * l'application et rien n'y est écrit ; la demande finale n'est envoyée nulle part.
 *
 * Tarifs et règles : ceux de la page « Tarifs » de leclosdelarc.fr (tarifs 2026, relevé du 30/10/2026),
 * reportés sur les mêmes dates les années suivantes :
 *  - nuitée (2 nuits minimum) en hors saison, basse saison et mi-saison ;
 *  - semaine seulement en saison et en haute saison (27 juin au 4 septembre) : 7 nuits minimum ;
 *  - au-delà de 7 nuits, chaque semaine entière est comptée au prix de la semaine ;
 *  - ménage en option (50 € Grenade, 60 € Mandarine et Pistache, 70 € Mistigri), draps 15 € le lit double
 *    et 12 € le lit simple, lits faits 3 € par lit, kit de toilette 8 €, torchon 1,50 €, matériel bébé prêté ;
 *  - taxe de séjour 1,43 € par nuit et par personne de plus de 18 ans.
 * Dates prises : un exemple, à remplacer par les calendriers Airbnb des quatre gîtes à la mise en service.
 */
(function () {
  "use strict";
  var DEMO_API = "https://demo-clos-de-l-arc.obt.invalid";
  var DEMO_ENVOI = "https://demo-clos-de-l-arc.obt.invalid/envoi";

  var JOUR = 86400000;
  var iso = function (d) { return d.toISOString().slice(0, 10); };
  var date = function (s) { return new Date(s + "T00:00:00Z"); };
  var auj = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  var an = auj.getUTCFullYear();
  var plus = function (n) { return iso(new Date(auj.getTime() + n * JOUR)); };

  // Saisons du site (jour et mois, bornes comprises)
  var SAISONS = [
    ["01-01", "03-27", "hors"], ["03-28", "04-24", "basse"], ["04-25", "06-26", "mi"], ["06-27", "07-10", "saison"],
    ["07-11", "08-28", "haute"], ["08-29", "09-04", "saison"], ["09-05", "09-26", "mi"], ["09-27", "12-31", "basse"],
  ];
  var saison = function (s) { var md = s.slice(5); return SAISONS.filter(function (p) { return md >= p[0] && md <= p[1]; })[0][2]; };

  var IMG = "images/";
  var LOGEMENTS = [
    { id: "pistache", name: "Le Pistache", kind: "gite", capacity: 4, minNights: 2, contains: [], image: IMG + "pistache/terrasse.jpg",
      note: "40 m², une chambre (lit de 140) et un convertible, terrasse patio de 12 m²",
      nuit: { hors: 8500, basse: 9500, mi: 10500 }, semaine: { hors: 48500, basse: 56000, mi: 62500, saison: 77500, haute: 95000 } },
    { id: "mandarine", name: "Le Mandarine", kind: "gite", capacity: 4, minNights: 2, contains: [], image: IMG + "mandarine/terrasse.jpg",
      note: "2 chambres (lit de 140 et lits superposés), terrasse de 16 m² à l’étage",
      nuit: { hors: 8500, basse: 9500, mi: 10500 }, semaine: { hors: 48500, basse: 56000, mi: 62500, saison: 77500, haute: 95000 } },
    { id: "mistigri", name: "Le Mistigri", kind: "gite", capacity: 4, minNights: 2, contains: [], image: IMG + "mistigri/terrasse.jpg",
      note: "duplex de 72 m², 2 chambres, 2 salles de bain, terrasse voisine de celle du Mandarine",
      nuit: { hors: 9500, basse: 11000, mi: 12000 }, semaine: { hors: 51000, basse: 59000, mi: 65000, saison: 82500, haute: 105000 } },
    { id: "grenade", name: "Le Grenade", kind: "gite", capacity: 3, minNights: 2, contains: [], image: IMG + "grenade/balcon-terrasse.jpg",
      note: "38 m², une chambre (2 lits de 80 ou un lit de 160) et un convertible, balcon sur la cour",
      nuit: { hors: 6500, basse: 7500, mi: 8500 }, semaine: { hors: 35500, basse: 41000, mi: 46000, saison: 67500, haute: 75000 } },
  ];

  // En saison et en haute saison, le site ne loue qu'à la semaine
  var MIN_SEJOURS = [];
  [an, an + 1, an + 2].forEach(function (a) { MIN_SEJOURS.push({ start: a + "-06-27", end: a + "-09-04", minNights: 7 }); });
  var minNuits = function (l, arrivee) {
    var p = MIN_SEJOURS.filter(function (m) { return m.start <= arrivee && arrivee <= m.end; })[0];
    return p ? p.minNights : l.minNights;
  };

  // Dates prises : un exemple (les calendriers Airbnb des quatre gîtes les remplaceront)
  var OCCUPE = { pistache: [], mandarine: [], mistigri: [], grenade: [] };
  OCCUPE.pistache.push({ start: plus(2), end: plus(5) }, { start: plus(16), end: plus(18) });
  OCCUPE.mandarine.push({ start: plus(9), end: plus(11) }, { start: plus(23), end: plus(26) });
  OCCUPE.mistigri.push({ start: plus(4), end: plus(7) });
  OCCUPE.grenade.push({ start: plus(12), end: plus(15) });
  [an + 1].forEach(function (a) {
    OCCUPE.pistache.push({ start: a + "-07-10", end: a + "-07-17" }, { start: a + "-07-31", end: a + "-08-14" });
    OCCUPE.mandarine.push({ start: a + "-07-17", end: a + "-07-31" }, { start: a + "-08-07", end: a + "-08-21" });
    OCCUPE.mistigri.push({ start: a + "-07-17", end: a + "-07-31" }, { start: a + "-08-14", end: a + "-08-28" });
    OCCUPE.grenade.push({ start: a + "-07-24", end: a + "-08-07" });
  });

  var OPTIONS = [
    { id: "taxe", name: "Taxe de séjour (plus de 18 ans)", priceCents: 143, unit: "personne_nuit", mandatory: true },
    { id: "menage-grenade", name: "Ménage de fin de séjour", priceCents: 5000, unit: "sejour", logementIds: ["grenade"] },
    { id: "menage-mandarine", name: "Ménage de fin de séjour", priceCents: 6000, unit: "sejour", logementIds: ["mandarine"] },
    { id: "menage-pistache", name: "Ménage de fin de séjour", priceCents: 6000, unit: "sejour", logementIds: ["pistache"] },
    { id: "menage-mistigri", name: "Ménage de fin de séjour", priceCents: 7000, unit: "sejour", logementIds: ["mistigri"] },
    { id: "draps-double", name: "Draps pour un lit double", priceCents: 1500, unit: "libre", qtyMin: 1, qtyMax: 6, unitLabel: "par lit" },
    { id: "draps-simple", name: "Draps pour un lit simple", priceCents: 1200, unit: "libre", qtyMin: 1, qtyMax: 8, unitLabel: "par lit" },
    { id: "lits-faits", name: "Lits faits pour votre arrivée", priceCents: 300, unit: "libre", qtyMin: 1, qtyMax: 10, unitLabel: "par lit" },
    { id: "toilette", name: "Kit de linge de toilette (gant, serviette, drap de bain)", priceCents: 800, unit: "personne" },
    { id: "torchons", name: "Torchon de cuisine", priceCents: 150, unit: "libre", qtyMin: 1, qtyMax: 6, unitLabel: "le torchon" },
    { id: "bebe", name: "Matériel bébé prêté (chaise haute, lit, baignoire, table à langer)", priceCents: 0, unit: "sejour" },
  ].map(function (o) {
    var x = { id: o.id, name: o.name, priceCents: o.priceCents, unit: o.unit, logementIds: o.logementIds || [], appliesTo: "all",
      minGuests: null, minNights: null, included: !!o.included, mandatory: !!o.mandatory, maxGuests: null, maxNights: null,
      periodStart: null, periodEnd: null, includedGuests: null, adultsOnly: false };
    if (o.unit === "libre") { x.qtyMin = o.qtyMin; x.qtyMax = o.qtyMax; x.unitLabel = o.unitLabel; }
    return x;
  });

  var CONDITIONS = [
    { id: "saisons", title: "Nuitée ou semaine", body: "De septembre à juin, les gîtes se louent à la nuitée (2 nuits minimum). Du 27 juin au 4 septembre, ils se louent à la semaine." },
    { id: "acompte", title: "Acompte et caution", body: "Un acompte de 30 % du séjour est demandé à la réservation. Caution : 500 € par gîte. Chèques vacances acceptés." },
    { id: "linge", title: "Linge", body: "Le linge de lit, de toilette et de cuisine n’est pas fourni : vous pouvez l’apporter ou le louer avec les options ci-dessus." },
    { id: "piscine", title: "La piscine", body: "La piscine est partagée entre les quatre gîtes. Les enfants s’y baignent sous la surveillance de leurs parents." },
  ];
  var QUESTIONS = [
    { id: "heure", label: "À quelle heure pensez-vous arriver ?" },
    { id: "deux", label: "Venez-vous à deux familles (Mandarine et Mistigri communiquent par leur terrasse) ?" },
    { id: "bebe", label: "Avez-vous besoin du matériel bébé ? Lequel ?" },
  ];

  var nuits = function (a, b) { return Math.round((date(b) - date(a)) / JOUR); };
  var chevauche = function (a, b, r) { return a < r.end && r.start < b; };
  var byId = function (id) { return LOGEMENTS.filter(function (l) { return l.id === id; })[0]; };
  var libre = function (l, a, b) { return !OCCUPE[l.id].some(function (r) { return chevauche(a, b, r); }); };

  // Prix de l'hébergement nuit par nuit : chaque bloc de 7 nuits au prix de la semaine, le reste à la nuitée
  function prixNuits(l, a, b) {
    var n = nuits(a, b), t = [], i = 0;
    var jour = function (k) { return iso(new Date(date(a).getTime() + k * JOUR)); };
    while (i < n) {
      var s = saison(jour(i));
      if (n - i >= 7) {
        var tot = l.semaine[s];
        for (var k = 0; k < 7; k++) t.push({ date: jour(i + k), priceCents: Math.floor(tot / 7) + (k === 6 ? tot % 7 : 0) });
        i += 7;
      } else {
        t.push({ date: jour(i), priceCents: l.nuit[s] || Math.round(l.semaine[s] / 7) });
        i++;
      }
    }
    return t;
  }
  var somme = function (t) { return t.reduce(function (s, x) { return s + x.priceCents; }, 0); };

  function planning() {
    return { hidden: false, today: iso(auj), privacyUrl: null, questions: QUESTIONS, conditions: CONDITIONS, options: OPTIONS,
      logements: LOGEMENTS.map(function (l) {
        return { id: l.id, name: l.name, kind: l.kind, capacity: l.capacity, note: l.note, image: new URL(l.image, location.href).href,
          minNights: l.minNights, minStays: MIN_SEJOURS, contains: l.contains, occupied: OCCUPE[l.id] };
      }) };
  }

  function disponibilites(p) {
    var a = p.get("start"), b = p.get("end"), g = +p.get("guests") || 1, n = nuits(a, b);
    return { hidden: false, nights: n, guests: g, logements: LOGEMENTS.map(function (l) {
      var ok = libre(l, a, b), mini = minNuits(l, a), assez = n >= mini;
      return { id: l.id, name: l.name, kind: l.kind, capacity: l.capacity, note: l.note, image: new URL(l.image, location.href).href,
        fits: g <= l.capacity, minNights: mini, available: ok && assez,
        reason: !ok ? "occupe" : !assez ? "nuits_minimum" : g > l.capacity ? "places" : null,
        accommodationCents: ok && assez ? somme(prixNuits(l, a, b)) : null };
    }) };
  }

  function devis(p) {
    var ids = (p.get("logement") || "").split(",").filter(Boolean), a = p.get("start"), b = p.get("end");
    var g = +p.get("guests") || 1, enfants = +p.get("children") || 0, n = nuits(a, b);
    var choisis = ids.map(byId).filter(Boolean);
    var dispo = choisis.length > 0 && choisis.every(function (l) { return libre(l, a, b) && n >= minNuits(l, a); });
    var places = choisis.reduce(function (s, l) { return s + l.capacity; }, 0);
    var lignes = [], nuitees = {};
    choisis.forEach(function (l) {
      var t = prixNuits(l, a, b);
      t.forEach(function (x) { nuitees[x.date] = (nuitees[x.date] || 0) + x.priceCents; });
      lignes.push({ id: l.id, name: l.name, accommodationCents: somme(t) });
    });
    var hebergement = lignes.reduce(function (s, x) { return s + x.accommodationCents; }, 0);
    var voulues = {};
    (p.get("options") || "").split(",").filter(Boolean).forEach(function (t) { var x = t.split(":"); voulues[x[0]] = +x[1] || 1; });
    var extras = OPTIONS.filter(function (o) {
      var pourEux = !o.logementIds.length || choisis.some(function (l) { return o.logementIds.indexOf(l.id) >= 0; });
      return pourEux && (o.mandatory || o.included || voulues[o.id]);
    }).map(function (o) {
      var q = o.id === "taxe" ? Math.max(0, g - enfants) * n
        : o.unit === "libre" ? voulues[o.id] : o.unit === "sejour" ? 1 : o.unit === "personne" ? g : o.unit === "personne_nuit" ? g * n : n;
      var e = { id: o.id, name: o.name, unit: o.unit, quantity: q, unitPriceCents: o.priceCents, totalCents: o.priceCents * q };
      if (o.unitLabel) e.unitLabel = o.unitLabel;
      if (o.mandatory) e.mandatory = true;
      if (o.included) e.included = true;
      return e;
    });
    return { hidden: false, available: dispo && g <= places, nights: n, guests: g, children: enfants,
      minNights: Math.max.apply(null, choisis.map(function (l) { return minNuits(l, a); }).concat(1)), capacity: places,
      nightly: Object.keys(nuitees).sort().map(function (d) { return { date: d, priceCents: nuitees[d] }; }),
      lines: lignes, accommodationCents: hebergement, extras: extras,
      totalCents: hebergement + extras.reduce(function (s, e) { return s + e.totalCents; }, 0) };
  }

  var repondre = function (corps) {
    return Promise.resolve(new Response(JSON.stringify(corps), { status: 200, headers: { "Content-Type": "application/json" } }));
  };
  var vraiFetch = window.fetch.bind(window);
  window.fetch = function (entree, init) {
    var url = typeof entree === "string" ? entree : entree && entree.url;
    if (!url || url.indexOf(DEMO_API) !== 0) return vraiFetch(entree, init);
    var u = new URL(url);
    // Démonstration : la demande et l'e-mail ne partent nulle part, le visiteur voit simplement « Merci »
    if (url.indexOf(DEMO_ENVOI) === 0 || /\/requests$/.test(u.pathname)) return repondre({ success: true, demo: true });
    if (/\/image\//.test(u.pathname)) return vraiFetch(entree, init);
    if (/\/planning$/.test(u.pathname)) return repondre(planning());
    if (/\/availability$/.test(u.pathname)) return repondre(disponibilites(u.searchParams));
    if (/\/quote$/.test(u.pathname)) return repondre(devis(u.searchParams));
    return Promise.resolve(new Response("{}", { status: 404 }));
  };
})();
