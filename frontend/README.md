# Books Frontend

React + TypeScript + Vite frontend, mis kasutab Books API backendi.

## Autor ja ülesannete jaotus

- Autor: Kaarel Kilki
- Meeskonna suurus: 1
- Ülesannete jaotus: kogu frontendi arendus (list/detail vaated, CRUD tegevused, filtreerimine, sorteerimine, pagination, error/loading olekud, Tailwind UI/UX).

## Seos backendiga

- Frontend repo/kaust: books-api/frontend
- Backend API repo: https://github.com/kaarelkilki/books-api-kodutoo3
- Frontend kasutab API baas-URLi muutujast VITE_API_URL

## Nõuded enne käivitamist

1. Node.js 20+ (soovituslik)
2. Tootav backend API aadressil http://localhost:3000
3. Frontendi ENV fail loodud vastavalt näidisele

## Installatsioon

Käivita juurkaustast:

```bash
cd frontend
npm install
```

## Keskkonnamuutujad

Fail [frontend/.env.example](frontend/.env.example) sisaldab vajalikku näidist.

Loo [frontend/.env](frontend/.env) ja lisa sinna:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Käivitamise käsud

Arendusserver:

```bash
cd frontend
npm run dev
```

Tootmisbuild:

```bash
cd frontend
npm run build
```

Buildi eelvaade lokaalselt:

```bash
cd frontend
npm run preview
```

## Vaated

- /books
  - raamatute nimekiri
  - filtrid: pealkiri, aasta, keel
  - sorteerimine: pealkiri/aasta, kasvav/kahanev
  - pagination
  - lisa/kustuta tegevused
- /books/:id
  - detailvaade
  - raamatu muutmine ja kustutamine
  - arvustuste list
  - arvustuse lisamine

## Projekti struktuur (frontend)

Peamine rakenduskood asub kaustas [frontend/src](frontend/src):

- [frontend/src/pages](frontend/src/pages)
- [frontend/src/components](frontend/src/components)
- [frontend/src/hooks](frontend/src/hooks)
- [frontend/src/api.ts](frontend/src/api.ts)

Konfiguratsioonifailid:

- [frontend/.env.example](frontend/.env.example)
- [frontend/.gitignore](frontend/.gitignore)
- [frontend/tailwind.config.js](frontend/tailwind.config.js)

## Kiirkontroll hindajale

1. Kaivita backend (port 3000)
2. Kaivita frontend (port 5173 vaikimisi)
3. Ava brauseris /books
4. Testi filtreid, sorteerimist, paginationit
5. Ava detailvaade ja lisa arvustus
