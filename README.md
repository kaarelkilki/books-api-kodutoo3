# Books API

RESTful API raamatukogu infosusteemi jaoks (TypeScript, Node.js, Express, Prisma, PostgreSQL).

Projekt katab kaks etappi:

- OSA 1: mock andmetega in-memory API
- OSA 2: PostgreSQL + Prisma

## Tehnoloogiad

- TypeScript
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM

## Eeldused

- Node.js 20+
- PostgreSQL
- `.env` fail `DATABASE_URL` vaartusega

Naitena:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/books_api?schema=books_api"
```

## Installimine

```bash
npm install
```

## OSA 1 (Mock / in-memory)

Kaivita arendusreziimis:

```bash
npm run dev
```

Mock endpointid:

- `GET /api/v1/books`
- `GET /api/v1/books/:id`
- `POST /api/v1/books`
- `PUT /api/v1/books/:id`
- `DELETE /api/v1/books/:id`

- `GET /api/v1/publishers`
- `GET /api/v1/publishers/:id`
- `POST /api/v1/publishers`
- `PUT /api/v1/publishers/:id`
- `DELETE /api/v1/publishers/:id`

- `GET /api/v1/reviews`
- `GET /api/v1/reviews/:id`
- `POST /api/v1/reviews`
- `PUT /api/v1/reviews/:id`
- `DELETE /api/v1/reviews/:id`

- `GET /api/v1/genres`
- `GET /api/v1/genres/:id`
- `POST /api/v1/genres`
- `PUT /api/v1/genres/:id`
- `DELETE /api/v1/genres/:id`

## OSA 2 (PostgreSQL + Prisma)

Prisma skeem ja seeding failid on kaustas `prisma/`.

1. Loo migratsioonid ja uuenda andmebaas:

```bash
npx prisma migrate dev --name init
```

2. Seed andmed:

```bash
npm run seed
```

3. Kaivita API:

```bash
npm run dev
```

Praegu on PostgreSQL/Prisma peal:

- books
- authors

Mock peal on:

- publishers
- reviews
- genres

## Build ja kaivitus

```bash
npm run build
npm start
```
