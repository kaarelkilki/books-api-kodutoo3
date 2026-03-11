# ROADMAP - RESTful API (Books System)

Eesmärk: viia projekt vastavusse ülesande kohustusliku miinimumiga (OSA 1 + OSA 2), nii et hindamiskriteeriumid oleksid kaetud.

## 0. Kiirparandused enne funktsionaalsust

### 0.1 Paranda repo baasseadistus
- [ ] Muuda faili: `.gitignore`
  - Eemalda vigane PowerShelli teksti-jääk.
  - Jäta sisse vähemalt:
    - `node_modules`
    - `dist`
    - `.env`
    - `.prisma`
    - `src/generated/prisma`
- [ ] Loo fail: `.env.example`
  - Lisa näidis `DATABASE_URL`.
  - Vajadusel lisa `USE_MOCK=true` / `USE_MOCK=false`.

### 0.2 Lisa puuduolevad sõltuvused
- [ ] Muuda faili: `package.json`
  - Lisa `zod`.
  - (Soovi korral) lisa skriptid: `prisma:migrate`, `prisma:generate`, `seed` täpsustatud kujul.

Kontroll:
- [ ] `npm install` töötab veata.

---

## 1. OSA 1 - Mock API nõuete täitmine

## 1.1 Ühtne arhitektuur (validators + middleware)
- [ ] Loo kaust: `src/validators/`
- [ ] Loo fail: `src/validators/book.validator.ts`
  - Book create/update Zod skeemid.
  - Query skeem (`title`, `year`, `language`, `author`, `genre`, `sortBy`, `order`, `page`, `limit`).
- [ ] Loo fail: `src/validators/review.validator.ts`
  - Review create/update skeem (`rating` 1..5 jne).
- [ ] Loo kaust: `src/middleware/`
- [ ] Loo fail: `src/middleware/error.middleware.ts`
  - Globaalne veakäsitleja (400/404/409/500).
  - Error response formaadis:
    - `error`
    - `details` (field + message)
- [ ] (Soovi korral) Loo fail: `src/middleware/validate.middleware.ts`
  - Üldine request validation helper Zodile.

### 1.2 Books CRUD + query (mock režiimis)
- [ ] Muuda faili: `src/routes/book.routes.ts`
  - Hoia CRUD endpointid.
  - Lisa:
    - `GET /books/:id/reviews`
    - `POST /books/:id/reviews`
    - `GET /books/:id/average-rating`
- [ ] Muuda faili: `src/controllers/book.controller.ts`
  - Rakenda query parameetrite lugemine.
  - Tagasta list endpointis ühtne pagination response.
- [ ] Muuda faili: `src/services/book.service.mock.ts`
  - Lisa vähemalt 3 filtrit (nt title, year, language).
  - Lisa sorteerimine (`title` või `publishedYear`, `order`).
  - Lisa pagination (`page`, `limit`) + meta arvutused.

### 1.3 Reviews seotud Bookiga (mock)
- [ ] Muuda faili: `src/services/review.service.ts`
  - Lisa funktsioonid:
    - `getReviewsByBookId(bookId, query)`
    - `addReviewForBook(bookId, payload)`
    - `getAverageRatingForBook(bookId)`
- [ ] Muuda faili: `src/controllers/review.controller.ts`
  - Vajadusel jaga üldised review endpointid ja book-based endpointid.

### 1.4 Mock andmete minimaalne maht
- [ ] Muuda/Loo failid:
  - `src/data/mock/books.mock.ts` (juba 15 - OK)
  - Loo: `src/data/mock/authors.mock.ts` (5-7)
  - Loo: `src/data/mock/publishers.mock.ts` (3-4)
  - Loo: `src/data/mock/reviews.mock.ts` (10-15)
  - Loo: `src/data/mock/genres.mock.ts` (5+)
- [ ] Muuda vastavad teenused kasutama neid mock faile.

### 1.5 App wiring
- [ ] Muuda faili: `src/index.ts`
  - Lisa not-found handler.
  - Lisa globaalne error middleware lõppu.

OSA 1 kontroll:
- [ ] `POST/GET/PUT/DELETE /api/v1/books` töötab.
- [ ] `POST /api/v1/books/:id/reviews` töötab.
- [ ] `GET /api/v1/books/:id/reviews` töötab.
- [ ] `GET /api/v1/books/:id/average-rating` töötab.
- [ ] Vähemalt 3 filtrit + sort + pagination töötab.
- [ ] Zod valideerimine ja ühtne veavastus töötab.

---

## 2. OSA 2 - PostgreSQL + Prisma täielikuks

## 2.1 Prisma schema viia nõuetele vastavaks
- [ ] Muuda faili: `prisma/schema.prisma`
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
- [ ] Käivita: `npx prisma migrate dev --name full-domain-model`
- [ ] Muuda faili: `prisma/seed.ts`
  - Sisesta kõik olemid (authors, publishers, genres, books, reviews).
  - Seo raamatud autori, kirjastaja ja žanritega.
- [ ] Käivita: `npm run seed`

## 2.3 Endpointid DB peale
- [ ] Muuda faili: `src/services/book.service.db.ts`
  - Rakenda query filtrid/sort/pagination Prisma `where/orderBy/skip/take` abil.
  - Kasuta `include` seotud andmete laadimiseks.
  - Lisa average-rating agregatsioon.
- [ ] Muuda faili: `src/services/review.service.ts`
  - Kui `USE_MOCK=false`, kasuta Prisma andmebaasi.
- [ ] Muuda faili: `src/services/book.service.ts`
  - Veendu, et toggle mock/db katab kõik vajalikud funktsioonid.
- [ ] Muuda faili: `src/controllers/book.controller.ts`
  - Ühtne response nii mock kui DB režiimis.

OSA 2 kontroll:
- [ ] Kõik OSA 1 nõutud endpointid töötavad DB peal.
- [ ] Prisma include + average-rating olemas.
- [ ] Prisma vead on kaetud (409/404/500 vastused).

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

- [ ] OSA 1 nõuded töötavad täielikult mock andmetega.
- [ ] OSA 2 nõuded töötavad PostgreSQL + Prisma peal.
- [ ] Errorid on ühtses formaadis.
- [ ] Pagination response vastab nõutud struktuurile.
- [ ] README katab kõik endpointid + näited.
- [ ] Repo sisaldab kõiki kohustuslikke faile.
