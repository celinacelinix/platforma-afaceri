export type ParagrafText = {
  titlu: string;
  text: string;
};

export function asambleazaCapitol2(fields: any, state: any, rez: any): ParagrafText[] {
  const concept = fields.concept || "[concept]";
  const clienti = fields.clienti || "[clienti]";
  const program = fields.program || "[program]";
  const diferentiatori = fields.diferentiatori || "[diferentiatori]";
  
  const afacere = state?.domeniu || "afacerea";
  const localitate = state?.localitate || "[localitate]";
  const suprafata = state?.suprafata_mp || 0;
  const locuri = state?.locuri || 0;
  const plafon_fizic = rez?.plafon_fizic || 0;
  
  const model_venit = state?.model_venit || "[model_venit]";
  const pret_mediu = state?.pret_mediu || 0;
  const unitate_volum = state?.unitate_volum || "[unitate_volum]";
  const venit = Math.round(rez?.venit_lunar || 0).toLocaleString('ro-RO');

  return [
    {
      titlu: "Prezentare generală",
      text: `Unitatea propusă, ${concept}, urmează să își desfășoare activitatea în ${localitate}, adresându-se cu precădere ${clienti}. Programul de funcționare stabilit este ${program}.`
    },
    {
      titlu: "Poziționare și diferențiere",
      text: `Pe piața locală, ${afacere} se diferențiază prin ${diferentiatori}.\nSpațiul de ${suprafata} mp, cu o capacitate de ${locuri} locuri, permite servirea a până la ${plafon_fizic} clienți pe zi.`
    },
    {
      titlu: "Model de venit",
      text: `Modelul de venit se bazează pe ${model_venit}, cu un preț mediu estimat de ${pret_mediu} lei per ${unitate_volum}.\nLa parametrii proiectați, unitatea estimează un venit lunar de ${venit} lei.`
    }
  ];
}

export function asambleazaCapitol3(fields: any, state: any, rez: any): ParagrafText[] {
  const localitate = state?.localitate || "[localitate]";
  const populatie = (rez?.populatie || 0).toLocaleString('ro-RO');
  const nr_concurenti = rez?.sensibilitate || 0;
  const locuitori_per_concurent = (rez?.locuitori_per_concurent || 0).toLocaleString('ro-RO');
  const evalueaza_saturatia = "indică o piață cu potențial de creștere";
  
  const descriere_zona = fields.zona || "[descriere_zona]";
  const tip_zona = state?.tip_zona || "[tip_zona]";
  const descriere_trafic_din_config = "un flux constant de potențiali clienți";
  
  const observatii_concurenta = fields.observatii_concurenta || "[observatii_concurenta]";
  const clienti_zi = rez?.clienti_zi || 0;
  const cum_ai_estimat = fields.estimare_clienti || "[cum_ai_estimat]";

  return [
    {
      titlu: "Caracteristicile pieței locale",
      text: `Municipiul/Orașul ${localitate} numără aproximativ ${populatie} locuitori, cu o densitate comercială de ${nr_concurenti} unități similare în raza de acțiune. Raportul de ${locuitori_per_concurent} locuitori per unitate ${evalueaza_saturatia}.`
    },
    {
      titlu: "Amplasament și trafic",
      text: `${descriere_zona}. Tipul de zonă (${tip_zona}) prezintă caracteristici de trafic ${descriere_trafic_din_config}.`
    },
    {
      titlu: "Estimarea cererii",
      text: `Pe baza observațiilor de teren, ${observatii_concurenta}.\nNumărul de clienți estimat zilnic este de ${clienti_zi}, determinat prin ${cum_ai_estimat}.`
    }
  ];
}

export function asambleazaCapitol4(fields: any, state: any, rez: any): ParagrafText[] {
  const nr_concurenti = rez?.sensibilitate || 0;
  const lista_concurenti = fields.concurenti_principali || "[lista_concurenti]";
  const puncte_slabe = fields.puncte_slabe || "[puncte_slabe]";
  const afacere = state?.domeniu || "afacerea";
  const raspuns_puncte_slabe = fields.raspuns_strategic || "[raspuns_puncte_slabe]";

  return [
    {
      titlu: "Peisajul competitiv",
      text: `În zona vizată au fost identificate ${nr_concurenti} unități cu activitate similară. Principalii competitori sunt: ${lista_concurenti}.`
    },
    {
      titlu: "Analiza punctelor slabe",
      text: `Analiza concurenței relevă următoarele oportunități: ${puncte_slabe}.`
    },
    {
      titlu: "Răspuns strategic",
      text: `Față de aceste aspecte, ${afacere} răspunde prin: ${raspuns_puncte_slabe}, creând astfel o diferențiere clară față de oferta existentă.`
    }
  ];
}

export function asambleazaCapitol5(fields: any, state: any, rez: any): ParagrafText[] {
  const zi_tipica = fields.zi_tipica || "[zi_tipica]";
  const zile_lucrate = state?.zile_lucrate_luna || 30;
  const locuri = state?.locuri || 0;
  const rotatii = rez?.rotatii || 0;
  
  const nr_angajati = state?.angajati || 0;
  const cost_personal = Math.round(rez?.cost_personal || 0).toLocaleString('ro-RO');
  const organizare_ture = fields.ture || "[organizare_ture]";
  
  const furnizori = fields.furnizori || "[furnizori]";
  const capital_blocat = (state?.capital_blocat || 0).toLocaleString('ro-RO');
  const termen_plata = state?.termen_plata || 0;
  
  const riscuri = fields.riscuri || "[riscuri]";
  const luni_acoperire = state?.luni_acoperire || 0;

  return [
    {
      titlu: "Programul de funcționare și fluxul zilnic",
      text: `${zi_tipica}. Unitatea funcționează ${zile_lucrate} zile pe lună, cu o capacitate de ${locuri} locuri și ${rotatii} rotații estimate pe zi.`
    },
    {
      titlu: "Structura de personal",
      text: `Echipa este formată din ${nr_angajati} angajați, cu un cost salarial lunar total de ${cost_personal} lei.\nOrganizarea turelor: ${organizare_ture}.`
    },
    {
      titlu: "Aprovizionare și stocuri",
      text: `Principalii furnizori: ${furnizori}. \nStocul mediu blocat reprezintă ${capital_blocat} lei, cu un termen mediu de plată furnizori de ${termen_plata} zile.`
    },
    {
      titlu: "Riscuri operaționale și măsuri de diminuare",
      text: `Principalele riscuri identificate: ${riscuri}. \nCapitalul de lucru asigurat acoperă ${luni_acoperire} luni de cheltuieli fixe.`
    }
  ];
}

export function asambleazaCapitol8(fields: any, state: any, rez: any): ParagrafText[] {
  return [
    { titlu: "Marketing", text: `Plan de marketing completat.` }
  ];
}

export function asambleazaCapitol10(fields: any, state: any, rez: any): ParagrafText[] {
  return [
    { titlu: "Acțiune", text: `Pași de urmat.` }
  ];
}

export function asambleazaCapitol1(fieldsToate: any, state: any, rez: any): ParagrafText[] {
  const afacere = state?.domeniu || "[afacere]";
  const localitate = state?.localitate || "[localitate]";
  const judet = state?.judet || "[judet]";
  const investitie = Math.round(rez?.investitie || 0).toLocaleString('ro-RO');
  const capital = Math.round(state?.capital_initial || 0).toLocaleString('ro-RO');
  
  const venit = Math.round(rez?.venit_lunar || 0).toLocaleString('ro-RO');
  const profit = Math.round(rez?.profit_net || 0).toLocaleString('ro-RO');
  const marja = rez?.marja_profit_net?.toFixed(1) || "0";
  
  const prag_rupere = rez?.prag_rupere || 0;
  const unitate_volum = state?.unitate_volum || "[unitate_volum]";
  const clienti_zi = rez?.clienti_zi || 0;
  const recuperare = rez?.luni_recuperare || 0;
  
  const cash_minim = rez?.cash_minim || 0;
  const luna_cash_minim = rez?.luna_cash_minim || 0;
  
  let extraAvertisment = "";
  if (cash_minim < 0) {
    extraAvertisment = `\nAtenție: proiecțiile indică un deficit de lichiditate în luna ${luna_cash_minim}. Se recomandă consolidarea capitalului de lucru.`;
  }

  return [
    { 
      titlu: "Rezumat executiv", 
      text: `Prezentul plan de afaceri descrie înființarea unei unități de tip ${afacere}, cu sediul în ${localitate}, județul ${judet}.
Investiția totală necesară este de ${investitie} lei, finanțată din surse proprii în valoare de ${capital} lei.
Unitatea estimează un venit lunar de ${venit} lei, cu un profit net de ${profit} lei (${marja}% marjă netă).
Pragul de rentabilitate este atins la ${prag_rupere} ${unitate_volum}, față de estimarea de ${clienti_zi} ${unitate_volum} planificați.
Recuperarea investiției este estimată în ${recuperare} luni de la deschidere.${extraAvertisment}` 
    }
  ];
}
