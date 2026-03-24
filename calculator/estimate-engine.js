(function(global){
  function toNum(v, fallback){
    const n = Number(v);
    return Number.isFinite(n) ? n : (fallback ?? 0);
  }
  function ceilDiv(a,b){ return Math.ceil(a/b); }
  function round(n, d){
    const p = Math.pow(10, d == null ? 3 : d);
    return Math.round((Number(n)||0) * p) / p;
  }

  function computeGlobals(input){
    const preset = (input && String(input.preset) === "6") ? "6" : "8";
    const L = Math.max(1, toNum(input && input.L, 1));
    const W = Number(preset);
    return { preset, L, W };
  }

  function calcFrame(globals, input){
    const preset = globals.preset;
    const L = toNum(globals.L, 0);

    const step = toNum(input && input.step, 0);
    const LINES = Math.max(0, Math.floor(toNum(input && input.lines, 0)));

    const Fship = toNum(input && input.Fship, 0);
    const Mship = toNum(input && input.Mship, 0);

    const P6060 = toNum(input && input.P6060, 0);
    const P8060 = toNum(input && input.P8060, 0);
    const P8080 = toNum(input && input.P8080, 0);
    const P100  = toNum(input && input.P100, 0);

    const FarmPrice6 = toNum(input && input.farm6, 0);
    const FarmPrice8 = toNum(input && input.farm8, 0);

    const K6060 = toNum(input && input.K6060, 0);
    const K80 = toNum(input && input.K80, 0);

    const wire = toNum(input && input.wire, 0);
    const discs = toNum(input && input.discs, 0);
    const paint = toNum(input && input.paint, 0);
    const paintTools = toNum(input && input.paintTools, 0);
    const paintPerFarm = toNum(input && input.paintPerFarm, 0);

    if(!(L>0) || !(step>0)){
      return {
        ok: false,
        total: 0,
        derived: { reason: "invalid_L_or_step" },
        rows: [],
        billItems: []
      };
    }

    const N = ceilDiv(L, step) + 1;
    const Nmid = Math.max(0, N - 2);
    const M_runs_6060 = LINES * L;

    let M6060_frames = 0, M8060_frames = 0, M8080_frames = 0, M100_frames = 0;
    let M_weld = 0;

    if (preset === "6") {
      const H = 2.38, Gw = 3.0;

      const M_first_8080 = 2 * H;
      const M_first_8060 = (2*H + Gw);
      const M_first_6060 = (4*1.24) + (2*2.32);

      const M_last_8080  = 2 * H;
      const M_last_6060  = 5.64;

      const M_mid_8080   = 2 * H;

      M6060_frames += (M_first_6060 + M_last_6060);
      M8080_frames += (M_first_8080 + M_last_8080) + (Nmid * M_mid_8080);
      M8060_frames += M_first_8060;

      M_weld = M_runs_6060 +
        (M_first_6060 + M_first_8080) +
        (M_last_6060  + M_last_8080) +
        (Nmid * (M_mid_8080));
    } else {
      const H = 2.36, Gw = 3.0;

      const M_first_100  = 2 * H;
      const M_first_8060 = (4*H + 2*Gw);
      const M_first_6060 = (4*0.47) + (2*0.54) + (1*1.10) + (2*H);

      const M_last_100   = 2 * H;
      const M_last_6060  = (7.8 + 2.3);

      const M_mid_100    = 2 * H;

      M6060_frames += (M_first_6060 + M_last_6060);
      M8060_frames += M_first_8060;
      M100_frames  += (M_first_100 + M_last_100) + (Nmid * M_mid_100);

      M_weld = M_runs_6060 +
        (M_first_6060 + M_first_100) +
        (M_last_6060  + M_last_100) +
        (Nmid * (M_mid_100));
    }

    const M6060 = M6060_frames + M_runs_6060;
    const M8060 = M8060_frames;
    const M8080 = M8080_frames;
    const M100  = M100_frames;

    const Buy6060 = M6060 * K6060;
    const Buy8060 = M8060 * K80;
    const Buy8080 = M8080 * K80;
    const Buy100  = M100  * K80;

    const Cost6060 = Buy6060 * P6060;
    const Cost8060 = Buy8060 * P8060;
    const Cost8080 = Buy8080 * P8080;
    const Cost100  = Buy100  * P100;

    const CostPipes = Cost6060 + Cost8060 + Cost8080 + Cost100;

    const FarmPrice = (preset === "6") ? FarmPrice6 : FarmPrice8;
    const CostFarms = (N * FarmPrice) + Fship;

    const CostWire  = M_weld * wire;
    const CostDiscs = M_weld * discs;
    const CostPaint = (M_weld * paint) + (N * paintPerFarm) + paintTools;
    const CostConsum = CostWire + CostDiscs + CostPaint;

    const Total = CostPipes + CostFarms + Mship + CostConsum;

    return {
      ok: true,
      total: Total,
      derived: { N, Nmid, M_weld },
      rows: [
        {name:"Труба 60×60", m:M6060, buy:Buy6060, price:P6060, sum:Cost6060},
        {name:"Труба 80×60", m:M8060, buy:Buy8060, price:P8060, sum:Cost8060},
        {name:"Труба 80×80", m:M8080, buy:Buy8080, price:P8080, sum:Cost8080},
        {name:"Труба 100×100", m:M100,  buy:Buy100,  price:P100,  sum:Cost100},
        {name:"ИТОГО трубы", isTotal:true, sum:CostPipes},
        {name:"Фермы (покупные) + доставка ферм", m:`N=${N}`, sum:CostFarms},
        {name:"Доставка металла (профиль/труба)", sum:Mship},
        {name:"Расходники: проволока", m:M_weld, mUnit:"м", sum:CostWire},
        {name:"Расходники: диски", m:M_weld, mUnit:"м", sum:CostDiscs},
        {name:"Расходники: грунт/эмаль + инструменты + (₽/ферма)", sum:CostPaint},
        {name:"ИТОГО расходники", isTotal:true, sum:CostConsum}
      ],
      billItems: [
        {name:"Труба 60×60 (закуп)", unit:"м", qty:Buy6060, price:P6060, sum:Cost6060},
        {name:"Труба 80×60 (закуп)", unit:"м", qty:Buy8060, price:P8060, sum:Cost8060},
        {name:"Труба 80×80 (закуп)", unit:"м", qty:Buy8080, price:P8080, sum:Cost8080},
        {name:"Труба 100×100 (закуп)", unit:"м", qty:Buy100,  price:P100,  sum:Cost100},
        {name:"Фермы (покупные)", unit:"шт", qty:N, price:FarmPrice, sum:(N*FarmPrice)},
        {name:"Доставка ферм", unit:"фикс", qty:1, price:Fship, sum:Fship},
        {name:"Доставка металла (профиль/труба)", unit:"фикс", qty:1, price:Mship, sum:Mship},
        {name:"Сварочная проволока", unit:"фикс", qty:1, price:CostWire, sum:CostWire},
        {name:"Отрезные диски", unit:"фикс", qty:1, price:CostDiscs, sum:CostDiscs},
        {name:"Грунт/эмаль + инструменты", unit:"фикс", qty:1, price:CostPaint, sum:CostPaint}
      ]
    };
  }

  function panelsPerRowSide(L){
    if (L <= 6) return 1;
    if (L <= 12) return 2;
    if (L <= 16) return 4;
    return null;
  }
  function roundUpTo(x, step){
    if(step <= 0) return x;
    return Math.ceil(x / step) * step;
  }

  function calcPanels(globals, input){
    const preset = globals.preset;
    const L = toNum(globals.L, 0);

    const wallPrice = toNum(input && input.wallPrice, 0);
    const roofPrice = toNum(input && input.roofPrice, 0);
    const ship = toNum(input && input.ship, 0);
    const H = toNum(input && input.H, 0);
    const eave = toNum(input && input.eave, 0);
    const roofBW = toNum(input && input.roofBW, 0);
    const slopes = Math.min(2, Math.max(1, Math.round(toNum(input && input.slopes, 0))));

    const pScrewWall = toNum(input && input.pScrewWall, 0);
    const pScrewRoof = toNum(input && input.pScrewRoof, 0);
    const screwWastePct = toNum(input && input.screwWastePct, 0);
    const screwRoundTo = toNum(input && input.screwRoundTo, 1);

    const foamPrice = toNum(input && input.foamPrice, 0);
    const sealPrice = toNum(input && input.sealPrice, 0);

    if(!(L>0) || !(H>0) || !(roofBW>0)){
      return { ok:false, total:0, derived:{reason:"invalid_inputs"}, billItems:[] };
    }

    const S6 = 3.420, S8 = 4.450;
    const AFB6 = 36.6, AFB8 = 44.4;
    const CWallScrews6 = 71;
    const CWallScrews8 = 96;

    const S = (preset==='6') ? S6 : S8;
    const AFB = (preset==='6') ? AFB6 : AFB8;
    const CWallScrews = (preset==='6') ? CWallScrews6 : CWallScrews8;

    const Aside = 2 * L * H;
    const Awalls = Aside + AFB;

    const Lroof = L + 2*eave;
    const Nroof = Math.ceil(Lroof / roofBW);
    const RoofPanels = slopes * Nroof;
    const Aroof = RoofPanels * roofBW * S;

    const CostWallsPanels = Awalls * wallPrice;
    const CostRoofPanels = Aroof * roofPrice;
    const CostPanels = CostWallsPanels + CostRoofPanels;

    const Prow = panelsPerRowSide(L);
    if (Prow === null){
      return {
        ok:false,
        isOutOfRange:true,
        total:0,
        derived:{L, Lroof, reason:"L_gt_16"},
        billItems:[]
      };
    }

    const SidePanelsTotal = 4 * Prow;
    const SideJointsTotal = 4 * (Prow - 1);

    const ScrewsRoof_base = RoofPanels * 6;
    const ScrewsSide_base = SidePanelsTotal * 6;
    const ScrewsWall_base = CWallScrews + ScrewsSide_base;

    const kWaste = 1 + (screwWastePct/100);
    const ScrewsWall_with = roundUpTo(Math.ceil(ScrewsWall_base * kWaste), screwRoundTo);
    const ScrewsRoof_with = roundUpTo(Math.ceil(ScrewsRoof_base * kWaste), screwRoundTo);

    const CostScrewWall = ScrewsWall_with * pScrewWall;
    const CostScrewRoof = ScrewsRoof_with * pScrewRoof;
    const CostScrews = CostScrewWall + CostScrewRoof;

    const Qfoam = Math.ceil(6 + L);
    const Qseal = Math.ceil(6 + L);
    const CostFoam = Qfoam * foamPrice;
    const CostSeal = Qseal * sealPrice;
    const CostChem = CostFoam + CostSeal;

    const Total = CostPanels + CostScrews + CostChem + ship;

    return {
      ok:true,
      total:Total,
      derived:{
        Awalls,Aroof,CostWallsPanels,CostRoofPanels,CostPanels,
        Lroof,Nroof,RoofPanels,Prow,SidePanelsTotal,SideJointsTotal,
        ScrewsWall_base,ScrewsRoof_base,screwWastePct,screwRoundTo,ScrewsWall_with,ScrewsRoof_with,
        CostScrewWall,CostScrewRoof,CostScrews,Qfoam,Qseal,CostFoam,CostSeal,CostChem,ship
      },
      billItems:[
        {name:"Стеновые панели", unit:"м²", qty:Awalls, price:wallPrice, sum:CostWallsPanels},
        {name:"Кровельные панели", unit:"м²", qty:Aroof, price:roofPrice, sum:CostRoofPanels},
        {name:"Саморезы стеновые 6.3×135", unit:"шт", qty:ScrewsWall_with, price:pScrewWall, sum:CostScrewWall},
        {name:"Саморезы кровельные 6.3×175", unit:"шт", qty:ScrewsRoof_with, price:pScrewRoof, sum:CostScrewRoof},
        {name:"Пена", unit:"шт", qty:Qfoam, price:foamPrice, sum:CostFoam},
        {name:"Герметик", unit:"шт", qty:Qseal, price:sealPrice, sum:CostSeal},
        {name:"Доставка панелей", unit:"фикс", qty:1, price:ship, sum:ship}
      ]
    };
  }

  function constLengths(preset, gates, doors, windows){
    if(preset === "6"){
      return {
        "1": 3.5*2,
        "4": 3.055*4,
        "5": (3.0*1 + 2.2*2) * gates,
        "8": 3.5*2,
        "10": 2.3*4,
        "9": (3.0 + 6.0),
        "12": (3.0 + 6.0),
        "11": (2.0*2 + 1.0*2) * doors,
        "14": (0.6*2 + 1.0*2) * windows
      };
    }
    return {
      "1": 4.45*2,
      "4": 4.069*4,
      "5": (3.0*2 + 2.2*4) * gates,
      "8": 4.45*2,
      "10": 2.3*4,
      "9": (0.75*3 + 8.0),
      "12": (0.75*3 + 8.0),
      "11": (2.0*2 + 1.0*1) * doors,
      "13": 2.3*4,
      "14": (0.6*2 + 1.0*2) * windows
    };
  }

  function variableLengths(L, Lroof){
    return {
      "2": 2 * Lroof,
      "3": 2 * Lroof,
      "6": 1 * Lroof,
      "7": 1 * Lroof,
      "9": 2 * L,
      "12": 2 * L
    };
  }

  function calcDobory(globals, input){
    const preset = globals.preset;
    const L = toNum(globals.L, 0);
    const eave = toNum(input && input.eave, 0);
    const wastePct = toNum(input && input.wastePct, 0);
    const gates = Math.max(0, Math.round(toNum(input && input.gates, 0)));
    const doors = Math.max(0, Math.round(toNum(input && input.doors, 0)));
    const windows = Math.max(0, Math.round(toNum(input && input.windows, 0)));
    const prices = Object.assign({}, (input && input.prices) || {});
    const items = (input && input.items) || [];

    if(!(L>0)){
      return { ok:false, total:0, derived:{reason:"invalid_L"}, rows:[], billItems:[] };
    }

    const Lroof = L + 2*eave;
    const kWaste = 1 + wastePct/100;

    const C = constLengths(preset, gates, doors, windows);
    const V = variableLengths(L, Lroof);

    const lens = {};
    Object.keys(C).forEach(k=> lens[k] = (lens[k]||0) + C[k]);
    Object.keys(V).forEach(k=> lens[k] = (lens[k]||0) + V[k]);
    Object.keys(lens).forEach(k=> lens[k] = lens[k] * kWaste);

    let totalLen = 0;
    let totalCost = 0;
    const rows = [];
    const billItems = [];

    items.forEach((it)=>{
      const len = lens[it.key] || 0;
      const p = toNum(prices[it.key], 0);
      const cost = len * p;
      if(len <= 0 && p <= 0) return;
      totalLen += len;
      totalCost += cost;
      rows.push({ key: it.key, name: it.name, len, p, cost });
      billItems.push({name:it.name, unit:"м", qty:len, price:p, sum:cost});
    });

    return {
      ok:true,
      total:totalCost,
      derived:{ Lroof, wastePct, gates, doors, windows, totalLen, lens },
      rows,
      billItems
    };
  }

  function calcExtras(globals, input){
    const items = (input && input.items) || [];
    const state = (input && input.state) || {};
    let total = 0;
    const rows = [];
    const billItems = [];

    items.forEach((it)=>{
      const p = toNum(state[it.key] && state[it.key].price, 0);
      const q = toNum(state[it.key] && state[it.key].qty, 0);
      const sum = p * q;
      total += sum;
      rows.push({ key: it.key, name: it.name, price: p, qty: q, sum });
      if(q<=0 && p<=0) return;
      billItems.push({name:it.name, unit:"шт", qty:q, price:p, sum});
    });

    return { ok:true, total, derived:{}, rows, billItems };
  }

  function calcFoundation(globals, input){
    const W = Number(globals.preset)||0;
    const L = Math.max(1, Number(globals.L)||1);

    const state = Object.assign({
      needPump: false,
      needExcav: false,
      norms: {
        thk: 0.25, ov: 1.05, chairsPerM2: 5, sandThk: 0.10, gravThk: 0.10, truckM3: 7,
        rebarStep: 0.20, rebarWaste: 1.07, rebarCover: 0.05, rebarLayers: 2
      },
      prices: {}
    }, input || {});

    const S = W * L;
    const P = 2*(W + L);

    const thk = Math.max(0.2, Number(state.norms.thk)||0.25);
    const V = S * thk;

    const ov = Math.max(1, Number(state.norms.ov)||1.05);
    const chairsPerM2 = Math.max(0, Number(state.norms.chairsPerM2)||0);
    const sandThk = Math.max(0, Number(state.norms.sandThk)||0);
    const gravThk = Math.max(0, Number(state.norms.gravThk)||0);

    const truckM3 = Math.max(1, Number(state.norms.truckM3)||7);
    const trips = Math.ceil(V / truckM3);

    const step   = Math.max(0.05, Number(state.norms.rebarStep)||0.20);
    const waste  = Math.max(1,    Number(state.norms.rebarWaste)||1.07);
    const cover  = Math.max(0,    Number(state.norms.rebarCover)||0);
    const layers = Math.max(1,    Math.round(Number(state.norms.rebarLayers)||2));

    const Wi = Math.max(0, W - 2*cover);
    const Li = Math.max(0, L - 2*cover);

    const nAlongL = Math.floor(Wi/step) + 1;
    const nAlongW = Math.floor(Li/step) + 1;

    const len1 = nAlongL * Li + nAlongW * Wi;
    const rebarLen = len1 * layers * waste;

    const m = {
      W,L,S,P,thk,V,ov,chairsPerM2,sandThk,gravThk,truckM3,trips,
      needPump: !!state.needPump, needExcav: !!state.needExcav,
      rebarLen
    };

    const items = (input && input.items) || [];

    let grand = 0;
    const rows = [];
    const billItems = [];

    for(const it of items){
      const q = Number(it.qty(m)) || 0;
      const price = Number(state.prices[it.key]) || 0;
      const sum = q * price;
      grand += sum;
      rows.push({ key: it.key, name: it.name, unit: it.unit, qty: q, price, sum });
      if(q<=0 && price<=0) continue;
      billItems.push({name:it.name, unit:it.unit, qty:q, price, sum});
    }

    return { ok:true, total:grand, derived:m, rows, billItems };
  }

  function buildEstimate(input){
    const globals = computeGlobals(input && input.globals);

    const frame = calcFrame(globals, input && input.frame);
    const panels = calcPanels(globals, input && input.panels);
    const dobory = calcDobory(globals, input && input.dobory);
    const extras = calcExtras(globals, input && input.extras);
    const foundation = calcFoundation(globals, input && input.foundation);

    const totals = {
      frame: Number(frame.total||0),
      panels: Number(panels.total||0),
      dobory: Number(dobory.total||0),
      extras: Number(extras.total||0),
      foundation: Number(foundation.total||0)
    };
    totals.grand = totals.frame + totals.panels + totals.dobory + totals.extras + totals.foundation;

    return {
      globals,
      sections: { frame, panels, dobory, extras, foundation },
      totals,
      billItems: {
        frame: frame.billItems || [],
        panels: panels.billItems || [],
        dobory: dobory.billItems || [],
        extras: extras.billItems || [],
        foundation: foundation.billItems || []
      }
    };
  }

  global.EstimateEngine = {
    computeGlobals,
    calcFrame,
    calcPanels,
    calcDobory,
    calcExtras,
    calcFoundation,
    buildEstimate,
    utils: { constLengths, variableLengths, panelsPerRowSide, roundUpTo, round }
  };
})(window);
