import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { capitol_nr, state, rez } = body;

    const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Cheie API Anthropic/AI lipsă' }, { status: 500 });
    }

    const { domeniu, localitate, tip_afacere } = state || {};

    const systemPrompt = `Ești un consultant de business care redactează capitole de plan de afaceri pentru piața românească. REGULI ABSOLUTE: Nu inventa niciodată cifre. Toate valorile numerice îți sunt furnizate în datele de intrare. Nu contrazice datele primite. Tonul e de consultant onest. Scrie în română, la persoana a doua. Fără emoji.`;

    const userPrompt = `
Te rog să redactezi capitolul ${capitol_nr} din planul de afaceri.
Datele afacerii:
- Tip afacere: ${tip_afacere || domeniu || 'Nespecificat'}
- Localitate: ${localitate || 'Nespecificată'}
- Venit lunar estimat: ${rez?.venitLunar} lei
- Profit net estimat: ${rez?.profitNet} lei
- Marjă brută estimată: ${rez?.marjaBrutaPct || 0}%
- Prag rupere: ${rez?.pragRupere !== null ? rez?.pragRupere + ' clienți/zi' : 'imposibil'}
- Cash minim necesar: ${rez?.cashMinim} lei

Informații suplimentare din starea simulării:
${JSON.stringify(state, null, 2)}

Te rog să generezi doar textul narativ pentru capitolul ${capitol_nr}, gata de a fi citit de utilizator, pe baza acestor date. Fără alte introduceri sau încheieri.
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
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
      return NextResponse.json({ error: `Eroare Anthropic: ${errorData}` }, { status: response.status });
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
