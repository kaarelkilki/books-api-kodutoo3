# Books API

RESTful API raamatukogu infosusteemi jaoks (TypeScript, Node.js, Express, Prisma, PostgreSQL).

## Tehnoloogiad

- TypeScript
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Zod (valideerimine)

## Eeldused

- Node.js 20+
- PostgreSQL
- `.env` fail `DATABASE_URL` vaartusega

Naitena:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/books_api?schema=books_api"
```

Valikuliselt saab raamatute jaoks kasutada mock-teenust:

```env
USE_MOCK=true
```

## Installimine

```bash
npm install
```

## Andmebaasi seadistamine

Prisma skeem ja seeding failid on kaustas `prisma/`.

1. Loo migratsioonid ja uuenda andmebaas:

```bash
npx prisma migrate dev --name init
```

2. Seed andmed:

```bash
npm run seed
```

## Kaivitamine

Arendusreziimis:

```bash
npm run dev
```

## Endpointid

Koik endpointid kasutavad prefiksit `/api/v1/`.

### Raamatud (PostgreSQL + Prisma)

| Meetod | URL                                   | Kirjeldus                                                        |
| ------ | ------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/api/v1/books`                       | Raamatute nimekiri (filtreerimine, sorteerimine, lehekueljamine) |
| GET    | `/api/v1/books/:id`                   | Uks raamat                                                       |
| POST   | `/api/v1/books`                       | Lisa raamat                                                      |
| PUT    | `/api/v1/books/:id`                   | Uuenda raamat                                                    |
| DELETE | `/api/v1/books/:id`                   | Kustuta raamat                                                   |
| GET    | `/api/v1/books/:id/reviews`           | Raamatu arvustused                                               |
| POST   | `/api/v1/books/:id/reviews`           | Lisa arvustus raamatule                                          |
| DELETE | `/api/v1/books/:id/reviews/:reviewId` | Kustuta arvustus                                                 |
| GET    | `/api/v1/books/:id/average-rating`    | Raamatu keskmine hinne                                           |

#### Paring- ja filtreerimisparameetrid (`GET /books`)

| Parameeter | Tyyp                       | Kirjeldus                                      |
| ---------- | -------------------------- | ---------------------------------------------- |
| `title`    | string                     | Filtreeri pealkirja jargi (case-insensitive)   |
| `year`     | number                     | Filtreeri avaldamisaasta jargi                 |
| `author`   | string                     | Filtreeri autori nime jargi (case-insensitive) |
| `sortBy`   | `title` \| `publishedYear` | Sorteerimine                                   |
| `order`    | `asc` \| `desc`            | Sorteerimissuund                               |
| `page`     | number                     | Lehekueljenumber (vaikimisi 1)                 |
| `limit`    | number                     | Tulemuste arv lehekuljel (vaikimisi 10)        |

Vastus sisaldab `data` ja `pagination` valjasid (page, limit, totalItems, totalPages, hasPreviousPage, hasNextPage).

### Autorid (PostgreSQL + Prisma)

| Meetod | URL                   | Kirjeldus         |
| ------ | --------------------- | ----------------- |
| GET    | `/api/v1/authors`     | Autorite nimekiri |
| GET    | `/api/v1/authors/:id` | Uks autor         |
| POST   | `/api/v1/authors`     | Lisa autor        |
| PUT    | `/api/v1/authors/:id` | Uuenda autor      |
| DELETE | `/api/v1/authors/:id` | Kustuta autor     |

### Kirjastajad (mock / in-memory)

| Meetod | URL                      | Kirjeldus             |
| ------ | ------------------------ | --------------------- |
| GET    | `/api/v1/publishers`     | Kirjastajate nimekiri |
| GET    | `/api/v1/publishers/:id` | Uks kirjastaja        |
| POST   | `/api/v1/publishers`     | Lisa kirjastaja       |
| PUT    | `/api/v1/publishers/:id` | Uuenda kirjastaja     |
| DELETE | `/api/v1/publishers/:id` | Kustuta kirjastaja    |

### Arvustused (mock / in-memory)

| Meetod | URL                   | Kirjeldus           |
| ------ | --------------------- | ------------------- |
| GET    | `/api/v1/reviews`     | Arvustuste nimekiri |
| GET    | `/api/v1/reviews/:id` | Uks arvustus        |
| POST   | `/api/v1/reviews`     | Lisa arvustus       |
| PUT    | `/api/v1/reviews/:id` | Uuenda arvustus     |
| DELETE | `/api/v1/reviews/:id` | Kustuta arvustus    |

### Zanrid (mock / in-memory)

| Meetod | URL                  | Kirjeldus        |
| ------ | -------------------- | ---------------- |
| GET    | `/api/v1/genres`     | Zanride nimekiri |
| GET    | `/api/v1/genres/:id` | Uks zanr         |
| POST   | `/api/v1/genres`     | Lisa zanr        |
| PUT    | `/api/v1/genres/:id` | Uuenda zanr      |
| DELETE | `/api/v1/genres/:id` | Kustuta zanr     |

## Valideerimine

Sisendi valideerimine Zodiga:

- Raamat (loomine): `title`, `publishedYear` (kohustuslikud)
- Raamat (uuendamine): koik valjad valikulised
- Arvustus: `rating` (1–5), `title`, `content`, `bookId` (UUID)
- Paring-parameetrid: tyypi teisendamine ja valideerimine

## Build ja kaivitus (toodang)

```bash
npm run build
npm start
```
