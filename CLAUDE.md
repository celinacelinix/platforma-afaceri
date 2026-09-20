# Context proiect

Platformă web de simulare afaceri pentru piața română.
Stack: Next.js + TypeScript + Supabase + LemonSqueezy + Vercel.
Motor de calcul: engine/src/engine.js (funcție pură, nu o modifica fără să rulezi testele).
Teste motor: node engine/test/engine.test.js — trebuie să rămână 29/29 mereu.
Design: alb, minimalist, accent verde-petrol #0f766e.
Monedă: lei peste tot.

## Structura relevantă
- engine/ — motorul de calcul (nu atinge fără teste)
- app/ — paginile Next.js
- app/dashboard/ — dashboard-ul principal cu tabele editabile
- app/api/ — endpoint-urile backend

## Reguli
- Chei API mereu în .env.local, niciodată în cod
- Toate sumele cu "lei" după ele
- Mobile-friendly la orice componentă nouă
- La modificări la engine.js, rulează testele după
