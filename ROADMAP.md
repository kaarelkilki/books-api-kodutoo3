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

- [ ] Muuda faili: `README.md`
  - Lisa autor(id) ja ülesannete jaotus.
  - Lisa setup sammud (install, env, migrate, seed, run).
  - Lisa endpointide loetelu.
  - Lisa request/response näited.
  - Lisa error response näited.
  - Lisa query parameterite näited.
  - Lisa cURL näited.
  - Lisa pordid (Express 3000; Fastify 3001 ainult kui meeskonnatöö nõuab).

## 3.2 Soovi korral OpenAPI

- [ ] Loo: `openapi.yaml` või `docs/openapi.yaml`.
- [ ] Lisa README-sse viide.

Kontroll:

- [ ] Repo sisaldab: `README.md`, `.env.example`, `.gitignore`, `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `src/`.

---

## 4. Git workflow ja hindepunktid

## 4.1 Ajalugu korrastada edaspidi

- [ ] Loo feature-harud:
  - `feature/validation-and-errors`
  - `feature/books-query-pagination`
  - `feature/prisma-full-schema`
  - `feature/readme-docs`
- [ ] Tee väiksed, kirjeldavad commitid.
- [ ] Tee merge läbi PR-ide (eriti kui meeskond).

Märkus:

- Kui oled üksinda, Fastify ei ole kohustuslik.
- Kui olete 2-liikmeline meeskond, lisa ka Fastify implementeering.

---

## 5. Soovituslik teostusjärjekord (kõige kiirem tee)

1. Paranda `.gitignore` + lisa `.env.example` + lisa `zod`.
2. Tee OSA 1 valmis (validators, middleware, books query, reviews-by-book, average-rating).
3. Täienda Prisma schema ja migratsioonid.
4. Tee DB teenused vastavaks OSA 1 endpointidele.
5. Täienda README koos cURL näidetega.
6. Lõpptest: mock režiim + db režiim.

---

## 6. Definition of Done (DoD)

- [x] OSA 1 nõuded töötavad täielikult mock andmetega.
- [x] OSA 2 nõuded töötavad PostgreSQL + Prisma peal.
- [ ] Errorid on ühtses formaadis.
- [ ] Pagination response vastab nõutud struktuurile.
- [ ] README katab kõik endpointid + näited.
- [ ] Repo sisaldab kõiki kohustuslikke faile.
