import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tip_cerere, context } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      // Mock de dezvoltare daca nu e cheia
      return NextResponse.json({
        idei: [
          `Idee generata local (lipsa API_KEY) pentru ${tip_cerere}`,
          `A doua sugestie pt ${context.afacere || 'afacerea ta'}`,
          `A treia optiune de luat in calcul`
        ]
      });
    }

    let systemPrompt = "Ești un consultant de business. Răspunde doar cu o listă JSON cu idei scurte și la obiect. Fără alt text. Format: {\"idei\": [\"Idee 1\", \"Idee 2\", \"Idee 3\"]}";
    
    let prompt = "";
    if (tip_cerere === 'marketing') {
      prompt = `Dă 3 idei simple și concrete de marketing pentru ${context.afacere} în ${context.localitate} (${context.tier || 'urban'}), cu buget de ${context.buget_marketing} lei/lună. Fiecare idee: titlu scurt + o propoziție. Fără generalități.`;
      systemPrompt = "Ești un expert marketing. " + systemPrompt;
    } else {
      prompt = `Generează idei pentru secțiunea: ${tip_cerere}. Context: ${JSON.stringify(context)}. Cerințe: Oferă exact 3-5 sugestii specifice, practice, de maxim 15-20 cuvinte fiecare.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Fallback stabil pentru claude-sonnet-4-6 cerut
        max_tokens: tip_cerere === 'marketing' ? 300 : 150,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    let textResult = data.content[0].text;
    
    // Parse json din textResult
    try {
      const start = textResult.indexOf('{');
      const end = textResult.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        textResult = textResult.substring(start, end + 1);
      }
      const parsed = JSON.parse(textResult);
      return NextResponse.json({ idei: parsed.idei || [] });
    } catch (e) {
      // Daca a raspuns cumva cu text simplu sau Markdown, extragem
      const extrase = textResult.split('\n').filter((l: string) => l.trim().length > 3).map((l: string) => l.replace(/^[-*0-9.\s]+/, ''));
      return NextResponse.json({ idei: extrase });
    }
  } catch (error) {
    console.error("Eroare generare idei:", error);
    return NextResponse.json({ error: "Eroare la generarea ideilor" }, { status: 500 });
  }
}
