# ROADMAP - RESTful API (Books System)

Eesmärk: viia projekt vastavusse ülesande kohustusliku miinimumiga (OSA 1 + OSA 2), nii et hindamiskriteeriumid oleksid kaetud.

## 0. Kiirparandused enne funktsionaalsust

### 0.1 Paranda repo baasseadistus

- [x] Muuda faili: `.gitignore`
  - Eemalda vigane PowerShelli teksti-jääk.
  - Jäta sisse vähemalt:
    - `node_modules`
    - `dist`
    - `.env`
    - `.prisma`
    - `src/generated/prisma`
- [x] Loo fail: `.env.example`
  - Lisa näidis `DATABASE_URL`.
  - Vajadusel lisa `USE_MOCK=true` / `USE_MOCK=false`.

### 0.2 Lisa puuduolevad sõltuvused

- [x] Muuda faili: `package.json`
  - Lisa `zod`.
  - (Soovi korral) lisa skriptid: `prisma:migrate`, `prisma:generate`, `seed` täpsustatud kujul.

Kontroll:

- [x] `npm install` töötab veata.

---

## 1. OSA 1 - Mock API nõuete täitmine

## 1.1 Ühtne arhitektuur (validators + middleware)

- [x] Loo kaust: `src/validators/`
- [x] Loo fail: `src/validators/book.validator.ts`
  - Book create/update Zod skeemid.
  - Query skeem (`title`, `year`, `language`, `author`, `genre`, `sortBy`, `order`, `page`, `limit`).
- [x] Loo fail: `src/validators/review.validator.ts`
  - Review create/update skeem (`rating` 1..5 jne).
- [x] Loo kaust: `src/middleware/`
- [x] Loo fail: `src/middleware/error.middleware.ts`
  - Globaalne veakäsitleja (400/404/409/500).
  - Error response formaadis:
    - `error`
    - `details` (field + message)
- [x] (Soovi korral) Loo fail: `src/middleware/validate.middleware.ts`
  - Üldine request validation helper Zodile.

### 1.2 Books CRUD + query (mock režiimis)

- [x] Muuda faili: `src/routes/book.routes.ts`
  - Hoia CRUD endpointid.
  - Lisa:
    - `GET /books/:id/reviews`
    - `POST /books/:id/reviews`
    - `GET /books/:id/average-rating`
- [x] Muuda faili: `src/controllers/book.controller.ts`
  - Rakenda query parameetrite lugemine.
  - Tagasta list endpointis ühtne pagination response.
- [x] Muuda faili: `src/services/book.service.mock.ts`
  - Lisa vähemalt 3 filtrit (nt title, year, language).
  - Lisa sorteerimine (`title` või `publishedYear`, `order`).
  - Lisa pagination (`page`, `limit`) + meta arvutused.

### 1.3 Reviews seotud Bookiga (mock)

- [x] Muuda faili: `src/services/review.service.ts`
  - Lisa funktsioonid:
    - `getReviewsByBookId(bookId, query)`
    - `addReviewForBook(bookId, payload)`
    - `getAverageRatingForBook(bookId)`
- [x] Muuda faili: `src/controllers/review.controller.ts`
  - Vajadusel jaga üldised review endpointid ja book-based endpointid.

### 1.4 Mock andmete minimaalne maht

- [x] Muuda/Loo failid:
  - `src/data/mock/books.mock.ts` (juba 15 - OK)
  - Loo: `src/data/mock/authors.mock.ts` (5-7)
  - Loo: `src/data/mock/publishers.mock.ts` (3-4)
  - Loo: `src/data/mock/reviews.mock.ts` (10-15)
  - Loo: `src/data/mock/genres.mock.ts` (5+)
- [x] Muuda vastavad teenused kasutama neid mock faile.

### 1.5 App wiring

- [x] Muuda faili: `src/index.ts`
  - Lisa not-found handler.
  - Lisa globaalne error middleware lõppu.

OSA 1 kontroll:

- [x] `POST/GET/PUT/DELETE /api/v1/books` töötab.
- [x] `POST /api/v1/books/:id/reviews` töötab.
- [x] `GET /api/v1/books/:id/reviews` töötab.
- [x] `GET /api/v1/books/:id/average-rating` töötab.
- [x] Vähemalt 3 filtrit + sort + pagination töötab.
- [x] Zod valideerimine ja ühtne veavastus töötab.

---

## 2. OSA 2 - PostgreSQL + Prisma täielikuks

## 2.1 Prisma schema viia nõuetele vastavaks

- [x] Muuda faili: `prisma/schema.prisma`
  - Täienda mudelid:
    - `Author` (1:N Books)
    - `Publisher` (1:N Books)
    - `Book` (N:1 Author, N:1 Publisher, N:M Genres)
    - `Genre` (N:M Books)
    - `Review` (N:1 Book)
  - Lisa puuduvad väljad (isbn, pageCount, language, description, coverImage, jne).
  - Lisa indeksid otsingu jaoks.
  - Lisa vajalikud `onDelete` reeglid (cascade kus mõistlik).

## 2.2 Migratsioonid + seed

- [x] Käivita: `npx prisma migrate dev --name init`
- [x] Muuda faili: `prisma/seed.ts`
  - Sisesta kõik olemid (authors, publishers, genres, books, reviews).
  - Seo raamatud autori, kirjastaja ja žanritega.
- [x] Käivita: `npm run seed`

## 2.3 Endpointid DB peale

- [x] Muuda faili: `src/services/book.service.db.ts`
  - Rakenda query filtrid/sort/pagination Prisma `where/orderBy/skip/take` abil.
  - Kasuta `include` seotud andmete laadimiseks.
  - Lisa average-rating agregatsioon.
- [x] Muuda faili: `src/services/review.service.ts`
  - Kui `USE_MOCK=false`, kasuta Prisma andmebaasi.
- [x] Muuda faili: `src/services/book.service.ts`
  - Veendu, et toggle mock/db katab kõik vajalikud funktsioonid.
- [x] Muuda faili: `src/controllers/book.controller.ts`
  - Ühtne response nii mock kui DB režiimis.

OSA 2 kontroll:

- [x] Kõik OSA 1 nõutud endpointid töötavad DB peal.
- [x] Prisma include + average-rating olemas.
- [x] Prisma vead on kaetud (409/404/500 vastused).

---

## 3. Dokumentatsioon ja esitamise nõuded

## 3.1 README viia hindamise nõuetele vastavaks

- [x] Muuda faili: `README.md`
  - Lisa autor ja ülesannete jaotus.
  - Lisa setup sammud (install, env, migrate, seed, run).
  - Lisa endpointide loetelu.
  - Lisa request/response näited.
  - Lisa error response näited.
  - Lisa query parameterite näited.
  - Lisa cURL näited.
  - Lisa pordid (Express 3000; Fastify 3001 ainult kui meeskonnatöö nõuab).

Kontroll:

- [x] Repo sisaldab: `README.md`, `.env.example`, `.gitignore`, `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `src/`.

---

## 4. OSA 3 - React Frontend (individuaalne)

Eesmärk: ehitada React + TypeScript frontend, mis kasutab olemasolevat backend API-t ja katab kõik kohustuslikud vaated/funktsioonid.

Märkus individuaalse töö kohta:

- [ ] Fookus ainult kohustuslikel vaadetel ja funktsioonidel.
- [ ] Boonusülesanded teosta ainult siis, kui põhinõuded on täielikult valmis ja testitud.
- [ ] Meeskonna PR/code review nõue ei rakendu, kuid git ajalugu peab siiski peegeldama päris arendust.

## 4.1 Frontendi projekti loomine ja baasseadistus

- [ ] Loo kaust `frontend/` (või eraldi repo, kui otsustad lahutada).
- [ ] Initsialiseeri projekt: React + TypeScript + Vite.
- [ ] Lisa sõltuvused: `axios`, `react-router-dom@6`, `tailwindcss`, `postcss`, `autoprefixer`.
- [ ] Seadista Tailwind CSS.
- [ ] Loo `.env.example` frontendi jaoks:
  - `VITE_API_URL=http://localhost:3000/api/v1`
- [ ] Loo `.gitignore` frontendi jaoks:
  - `node_modules`
  - `dist`
  - `.env`

Kontroll:

- [ ] `npm install` töötab.
- [ ] `npm run dev` käivitab rakenduse.
- [ ] `npm run build` läheb veata läbi.

## 4.2 Koodistruktuur ja tüübid

- [ ] Loo fail `frontend/src/api.ts`
  - Axios instants (`baseURL = import.meta.env.VITE_API_URL`).
  - Kõik API funktsioonid ühes kohas.
  - TypeScript tüübid kõikidele vastustele/payloadidele.
- [ ] Loo kaustad:
  - `frontend/src/pages/`
  - `frontend/src/components/`
  - `frontend/src/types/` (kui soovid tüübid eraldada)
  - `frontend/src/hooks/` (kui vajad korduskasutatavat päringuloogikat)
- [ ] Kehtesta reegel: `any` ei kasutata.

Kontroll:

- [ ] Ükski komponent ei tee otsest HTTP-kutset väljaspool `api.ts`.
- [ ] Kõik API vastused on tüübitud.

## 4.3 Router ja navigeerimine

- [ ] Seadista React Router v6 teed:
  - `/books`
  - `/books/:id`
- [ ] Lisa fallback route (404 vaade või suunamine `/books`).
- [ ] Lisa navigeerimisnupud:
  - detailist tagasi nimekirja
  - nimekirjast detaili

Kontroll:

- [ ] Otselingid töötavad brauseri refreshi järel.

## 4.4 Vaade: Raamatute nimekiri `/books`

- [ ] Loo fail `frontend/src/pages/BooksPage.tsx`.
- [ ] Kuva raamatud kaartidena või tabelina (pealkiri, autor, aasta, žanrid).
- [ ] Lisa filtrid (vähemalt 3):
  - pealkiri
  - aasta
  - keel
- [ ] Lisa sorteerimine:
  - välja järgi: pealkiri või aasta
  - järjekord: kasvav/kahanev
- [ ] Lisa pagination:
  - `page`, `limit`
  - edasi/tagasi või leheküljenumbrid
- [ ] Lisa nupp "Lisa raamat" (vormi avamine samal lehel või eraldi vaatel).
- [ ] Iga raamatu juures:
  - nupp "Vaata" -> `/books/:id`
  - nupp "Kustuta" -> kustutab ja värskendab nimekirja

Kontroll:

- [ ] Filtrid, sort ja pagination töötavad samaaegselt.
- [ ] URL query params kasutus on soovituslik (hea UX + lihtsam testida).

## 4.5 Vaade: Raamatu detail `/books/:id`

- [ ] Loo fail `frontend/src/pages/BookDetailPage.tsx`.
- [ ] Kuva kõik raamatu andmed:
  - pealkiri, ISBN, aasta, lehekülgede arv, keel, kirjeldus
  - autor, kirjastus, žanrid
- [ ] Küsi ja kuva keskmine hinnang endpointist:
  - `GET /books/:id/average-rating`
- [ ] Lisa nupp "Muuda" (eeltäidetud muutmisvorm).
- [ ] Lisa nupp "Kustuta" (järel suuna `/books`).
- [ ] Küsi ja kuva arvustused:
  - `GET /books/:id/reviews`
- [ ] Lisa arvustuse lisamise vorm:
  - kasutajanimi
  - hinnang 1..5
  - kommentaar
- [ ] Lisa nupp "Tagasi nimekirja".

Kontroll:

- [ ] Detailvaade uuendab andmeid pärast muutmist/kustutamist/lisatud arvustust.

## 4.6 Kohustuslik tehniline kvaliteet

- [ ] AbortController kõigis `useEffect` päringutes.
- [ ] Igal päringul on `loading` olek.
- [ ] Igal päringul on `error` olek kasutajasõbraliku sõnumiga.
- [ ] Kinnitused enne kustutamist (vältimaks juhuslikku delete'i).
- [ ] Väldi duplikaatpäringuid (nt debounce filtrile, kui vajalik).

Kontroll:

- [ ] Lehelt lahkumisel katkestatakse pooleliolev päring.
- [ ] Konsoolis ei teki unmounted-state uuenduse hoiatusi.

## 4.7 UI/UX (Tailwind)

- [ ] Rakenda ühtne disainisüsteem:
  - spacing, värvid, tüpograafia
  - nupud, inputid, kaardid
- [ ] Tee vaated kasutatavaks nii desktopis kui mobiilis.
- [ ] Lisa selge visualiseerimine:
  - loading spinner/skeleton
  - error alert
  - empty state

Kontroll:

- [ ] Bootstrapi ei kasutata.
- [ ] Tailwind klassid on järjepidevad ja loetavad.

## 4.8 Dokumentatsioon ja esitamine (frontend)

- [ ] Uuenda `README.md` (või `frontend/README.md`) minimaalse sisuga:
  - autor(id) ja ülesannete jaotus (individuaalsel juhul märgi, et töö tegija on 1)
  - installatsioonijuhised
  - käivitamise käsud
  - ekraanipildid vaadetest
  - link backend repo(le)
- [ ] Veendu, et olemas on `.env.example` ja korrektne `.gitignore`.
- [ ] Veendu, et kogu frontendi kood on `src/` all.

Kontroll:

- [ ] Hindaja saab projekti nullist käima ainult README järgi.

## 4.9 Git töövoog (individuaalne)

- [ ] Kasuta väikseid ja kirjeldavaid commit'eid (mitte üks suur commit).
- [ ] Soovituslikud harud:
  - `feature/frontend-setup`
  - `feature/books-list`
  - `feature/book-detail`
  - `feature/reviews`
  - `feature/ui-polish`
- [ ] Kui töötad ainult `main` harus, hoia commitid loogiliste osadena eristatavad.

Kontroll:

- [ ] Git log näitab reaalse arenduse etappe.

## 4.10 Valmiduse lõppkontroll hindamiskriteeriumi järgi

- [ ] Põhifunktsionaalsus (3p):
  - books list + detail + CRUD töötab
  - arvustuse lisamine töötab
- [ ] Otsing/sort/pagination (2p):
  - vähemalt 3 filtrit
  - sort töötab mõlemas suunas
  - pagination navigeerimine töötab
- [ ] Tehniline kvaliteet (2p):
  - TypeScript ilma `any`
  - AbortController
  - eraldi `api.ts`
  - loading + error olekud
- [ ] UI/UX (2p):
  - Tailwind kasutus
  - loogiline ja kasutatav liides
- [ ] Git + dokumentatsioon (1p):
  - kirjeldavad commitid
  - README + ekraanipildid
  - `.env.example`

NB! Frontendi hinnatavus eeldab, et backend API töötab stabiilselt.

---

## 5. Boonusülesanded (teha ainult pärast põhinõudeid)

- [ ] `/authors` vaade (autorid + autori raamatud)
- [ ] Žanrifilter dropdowniga backendist (`GET /genres`)
- [ ] Arvustuse kustutamine (`DELETE /reviews/:id`)
- [ ] React Query / TanStack Query kasutuselevõtt
- [ ] Tootmisbuildi kontroll (`npm run build`) veata
