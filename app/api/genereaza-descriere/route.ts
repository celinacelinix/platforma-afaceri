import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domeniu, tip_afacere, localitate, optiuni } = body;

    const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Cheie API Anthropic/AI lipsă' }, { status: 500 });
    }

    const { concept_tip, concept_personalizat, public_tinta, public_personalizat, diferentiator, diferentiator_personalizat } = optiuni || {};

    let conceptText = concept_tip;
    if (concept_tip === 'Alt concept / Personalizat' || !concept_tip) {
      conceptText = concept_personalizat || 'Nespecificat';
    }

    let publicText = Array.isArray(public_tinta) ? public_tinta.filter(p => p !== 'Altul').join(', ') : (public_tinta || '');
    if (public_tinta?.includes('Altul') && public_personalizat) publicText += (publicText ? ', ' : '') + public_personalizat;

    let difText = Array.isArray(diferentiator) ? diferentiator.filter(d => d !== 'Altul').join(', ') : (diferentiator || '');
    if (diferentiator?.includes('Altul') && diferentiator_personalizat) difText += (difText ? ', ' : '') + diferentiator_personalizat;

    const systemPrompt = `Ești un consultant de business care redactează descrieri pentru concepte de afaceri. Scrie un text narativ clar, atractiv și profesionist, destinat unui plan de afaceri. Tonul trebuie să fie realist și adaptat pieței din România. Nu scrie introduceri sau concluzii, ci doar textul util. Folosește persoana a doua sau a treia.`;

    const userPrompt = `
Te rog să redactezi secțiunea "Concept și Poziționare" pentru următoarea afacere:
- Domeniu / Tip afacere: ${tip_afacere || domeniu || 'Restaurant'}
- Localitate: ${localitate || 'Nespecificată'}
- Concept: ${conceptText}
- Public țintă vizat: ${publicText || 'Nespecificat'}
- Diferențiator principal: ${difText || 'Nespecificat'}

Scrie un text de 2-3 paragrafe (aproximativ 100-150 de cuvinte) care să descrie coerent și atractiv afacerea, pe baza datelor de mai sus. Folosește un limbaj comercial clar, fără exagerări nerealiste.
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: `Eroare API: ${errorData}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.content[0].text });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Timeout la generare AI' }, { status: 504 });
    }
    return NextResponse.json({ error: error.message || 'Eroare internă' }, { status: 500 });
  }
}
