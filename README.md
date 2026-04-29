# Books API

RESTful API raamatukogu infosüsteemi jaoks (TypeScript, Node.js, Express, Prisma, PostgreSQL).

## Autor ja ulesannete jaotus

- Autor: Kaarel Kilki
- Meeskonna suurus: 1
- Ülesannete jaotus:
  - API arhitektuur ja Express route'ide loomine
  - Prisma skeem, migratsioonid ja seedimine
  - CRUD endpointid (books, authors, publishers, genres, reviews)
  - Valideerimine (Zod), error handling ja paging/filtering
  - Testimine (smoke script) ja dokumentatsioon (README)

## Tehnoloogiad

- TypeScript
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Zod

## Pordid

- Express API: 3000

## Setup

### 1. Install

```bash
npm install
```

### 2. ENV

Loo projekti juurkausta `.env` fail `.env.example` põhjal.

Valikuline (raamatuteenuse mock variant):

```env
USE_MOCK=true
```

### 3. Migrate

Jooksuta migrate, saab jooksutada kooli võrgus. Kodus kasuta kooli VPN-i.

```bash
npm run prisma:migrate
```

### 4. Seed

```bash
npm run seed
```

### 5. Run

Arenduskeskkonna käivitus:

```bash
npm run dev
```

Build + toodangulaadne käivitus:

```bash
npm run build
npm start
```

## Endpointide loetelu

Kõik endpointid kasutavad prefiksit `/api/v1`.

Neid endpointe saab kasutada testimiseks, jooksutades naid rest API kliendiga või kasutada smoke testi.

```bash
npm run smoke
```

### Books

| Method | Endpoint                              | Kirjeldus                               |
| ------ | ------------------------------------- | --------------------------------------- |
| GET    | `/api/v1/books`                       | Raamatute list (filter/sort/paging)     |
| GET    | `/api/v1/books/:id`                   | Üks raamat                              |
| POST   | `/api/v1/books`                       | Lisa raamat                             |
| PUT    | `/api/v1/books/:id`                   | Uuenda raamat                           |
| DELETE | `/api/v1/books/:id`                   | Kustuta raamat                          |
| GET    | `/api/v1/books/:id/reviews`           | Antud raamatu arvustused                |
| POST   | `/api/v1/books/:id/reviews`           | Lisa arvustus antud raamatule           |
| DELETE | `/api/v1/books/:id/reviews/:reviewId` | Kustuta antud raamatu konkreetne review |
| GET    | `/api/v1/books/:id/average-rating`    | Antud raamatu keskmine hinne            |

### Authors

| Method | Endpoint              | Kirjeldus     |
| ------ | --------------------- | ------------- |
| GET    | `/api/v1/authors`     | Autorite list |
| GET    | `/api/v1/authors/:id` | Üks autor     |
| POST   | `/api/v1/authors`     | Lisa autor    |
| PUT    | `/api/v1/authors/:id` | Uuenda autor  |
| DELETE | `/api/v1/authors/:id` | Kustuta autor |

### Publishers

| Method | Endpoint                 | Kirjeldus          |
| ------ | ------------------------ | ------------------ |
| GET    | `/api/v1/publishers`     | Kirjastajate list  |
| GET    | `/api/v1/publishers/:id` | Üks kirjastaja     |
| POST   | `/api/v1/publishers`     | Lisa kirjastaja    |
| PUT    | `/api/v1/publishers/:id` | Uuenda kirjastaja  |
| DELETE | `/api/v1/publishers/:id` | Kustuta kirjastaja |

### Genres

| Method | Endpoint             | Kirjeldus    |
| ------ | -------------------- | ------------ |
| GET    | `/api/v1/genres`     | Zanrite list |
| GET    | `/api/v1/genres/:id` | Üks zanr     |
| POST   | `/api/v1/genres`     | Lisa zanr    |
| PUT    | `/api/v1/genres/:id` | Uuenda zanr  |
| DELETE | `/api/v1/genres/:id` | Kustuta zanr |

### Reviews

| Method | Endpoint              | Kirjeldus        |
| ------ | --------------------- | ---------------- |
| GET    | `/api/v1/reviews`     | Arvustuste list  |
| GET    | `/api/v1/reviews/:id` | Üks arvustus     |
| POST   | `/api/v1/reviews`     | Lisa arvustus    |
| PUT    | `/api/v1/reviews/:id` | Uuenda arvustus  |
| DELETE | `/api/v1/reviews/:id` | Kustuta arvustus |

## Query parameterite näited

### GET /api/v1/books

Toetatud query parameetrid:

- `title` (string)
- `year` (number)
- `language` (string)
- `author` (string)
- `genre` (string)
- `sortBy` (`title` | `publishedYear`)
- `order` (`asc` | `desc`)
- `page` (number, alates 1)
- `limit` (number, alates 1)

Näited:

- `/api/v1/books?title=clean`
- `/api/v1/books?author=martin&language=english`
- `/api/v1/books?year=2011&genre=fantasy`
- `/api/v1/books?sortBy=publishedYear&order=desc&page=1&limit=5`

### GET /api/v1/books/:id/reviews

Toetatud query parameetrid:

- `page` (number, alates 1)
- `limit` (number, 1 kuni 100)

Näide:

- `/api/v1/books/1/reviews?page=1&limit=10`

## Request/response näited

### 1) POST /api/v1/books

Request body:

```json
{
  "title": "Clean Architecture",
  "author": "Robert C. Martin",
  "language": "English",
  "genre": "Software Engineering",
  "publishedYear": 2017
}
```

Response `201 Created`:

```json
{
  "id": 101,
  "title": "Clean Architecture",
  "publishedYear": 2017,
  "author": "Robert C. Martin",
  "language": "English",
  "genre": "Software Engineering",
  "averageRating": null
}
```

### 2) GET /api/v1/books?sortBy=publishedYear&order=desc&page=1&limit=2

Response `200 OK`:

```json
{
  "data": [
    {
      "id": 12,
      "title": "Domain-Driven Design",
      "publishedYear": 2003,
      "author": "Eric Evans",
      "language": "English",
      "genre": "Software Engineering",
      "averageRating": 4.7
    },
    {
      "id": 7,
      "title": "Clean Code",
      "publishedYear": 2008,
      "author": "Robert C. Martin",
      "language": "English",
      "genre": "Software Engineering",
      "averageRating": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "totalItems": 14,
    "totalPages": 7,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

### 3) POST /api/v1/books/1/reviews

Request body:

```json
{
  "reviewerName": "Mari Maasikas",
  "rating": 5,
  "comment": "Vaga praktiline ja hasti kirjutatud."
}
```

Response `201 Created`:

```json
{
  "id": 301,
  "bookId": 1,
  "reviewerName": "Mari Maasikas",
  "rating": 5,
  "comment": "Vaga praktiline ja hasti kirjutatud."
}
```

## Error response näited

### 400 Validation failed

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["rating"],
      "message": "Number must be less than or equal to 5"
    }
  ]
}
```

### 404 Not found

```json
{
  "error": "Book not found",
  "details": []
}
```

Mõnes endpointis võib not found kuju olla ka:

```json
{
  "message": "Author not found"
}
```

### 409 Conflict

```json
{
  "error": "Book with this title and author already exists",
  "details": []
}
```

### 500 Internal server error

```json
{
  "error": "Error fetching books",
  "details": []
}
```

## cURL näited

### Books

```bash
curl -X GET "http://localhost:3000/api/v1/books?sortBy=publishedYear&order=desc&page=1&limit=5"
```

```bash
curl -X POST "http://localhost:3000/api/v1/books" \
	-H "Content-Type: application/json" \
	-d '{
		"title": "Refactoring",
		"author": "Martin Fowler",
		"language": "English",
		"genre": "Software Engineering",
		"publishedYear": 1999
	}'
```

```bash
curl -X PUT "http://localhost:3000/api/v1/books/1" \
	-H "Content-Type: application/json" \
	-d '{
		"genre": "Programming"
	}'
```

```bash
curl -X DELETE "http://localhost:3000/api/v1/books/1"
```

### Authors

```bash
curl -X GET "http://localhost:3000/api/v1/authors"
```

```bash
curl -X POST "http://localhost:3000/api/v1/authors" \
	-H "Content-Type: application/json" \
	-d '{
		"firstName": "J. R. R.",
		"lastName": "Tolkien",
		"birthYear": 1892
	}'
```

### Book reviews

```bash
curl -X GET "http://localhost:3000/api/v1/books/1/reviews?page=1&limit=10"
```

```bash
curl -X POST "http://localhost:3000/api/v1/books/1/reviews" \
	-H "Content-Type: application/json" \
	-d '{
		"reviewerName": "Test User",
		"rating": 4,
		"comment": "Korralik lugemine"
	}'
```

## Kasulikud npm scriptid

- `npm run dev`
- `npm run prisma:migrate`
- `npm run seed`
- `npm run prisma:generate`
- `npm run build`
- `npm start`
- `npm run smoke`

## Frontend (React + TypeScript + Vite)

Frontend rakendus asub kaustas [frontend](frontend) ja kasutab olemasolevat backend API-t.

### Autor ja ülesannete jaotus (frontend)

- Autor: Kaarel Kilki
- Meeskonna suurus: 1
- Ülesannete jaotus: kogu frontendi arendus (list/detail vaated, CRUD tegevused, filtreerimine, sorteerimine, pagination, error/loading olekud, Tailwind UI/UX)

### Seos backendiga

- Frontend kaust: `books-api/frontend`
- Backend API repo: https://github.com/kaarelkilki/books-api-kodutoo3
- Frontend kasutab API baas-URLi muutujast `VITE_API_URL`

### Frontendi install ja käivitus

```bash
cd frontend
npm install
```

Keskkonnamuutuja:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

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

Buildi eelvaade:

```bash
cd frontend
npm run preview
```

### Frontendi vaated

- `/books`
  - raamatute nimekiri
  - filtrid: pealkiri, aasta, keel
  - sorteerimine: pealkiri/aasta, kasvav/kahanev
  - pagination
  - lisa/kustuta tegevused
- `/books/:id`
  - detailvaade
  - raamatu muutmine ja kustutamine
  - arvustuste list
  - arvustuse lisamine

### Frontendi struktuur

- [frontend/src](frontend/src)
- [frontend/src/pages](frontend/src/pages)
- [frontend/src/components](frontend/src/components)
- [frontend/src/hooks](frontend/src/hooks)
- [frontend/src/api.ts](frontend/src/api.ts)

Konfiguratsioonifailid:

- [frontend/.env.example](frontend/.env.example)
- [frontend/.gitignore](frontend/.gitignore)
- [frontend/tailwind.config.js](frontend/tailwind.config.js)
