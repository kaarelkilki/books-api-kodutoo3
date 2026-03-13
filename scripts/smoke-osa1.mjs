const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000/api/v1";

if (typeof fetch !== "function") {
  console.error(
    "FAIL: fetch is not available in this Node runtime. Use Node 18+.",
  );
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(method, path, { body, expectedStatus }) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const rawText = await response.text();
  let payload = null;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = rawText;
    }
  }

  if (response.status !== expectedStatus) {
    throw new Error(
      `${method} ${path} expected ${expectedStatus}, got ${response.status}. Body: ${rawText}`,
    );
  }

  return payload;
}

function hasUniformErrorShape(payload) {
  return (
    payload !== null &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "error") &&
    Object.prototype.hasOwnProperty.call(payload, "details")
  );
}

async function main() {
  console.log(`Running OSA 1 smoke test against ${baseUrl}`);

  const list = await request("GET", "/books", { expectedStatus: 200 });
  assert(Array.isArray(list?.data), "GET /books must return data array");
  assert(
    list?.pagination && typeof list.pagination === "object",
    "GET /books must return pagination object",
  );

  const now = Date.now();
  const created = await request("POST", "/books", {
    expectedStatus: 201,
    body: {
      title: `Smoke Test Book ${now}`,
      author: "Smoke Tester",
      language: "English",
      genre: "Testing",
      publishedYear: 2026,
    },
  });
  assert(typeof created?.id === "number", "POST /books must return created id");

  const createdId = created.id;

  const fetched = await request("GET", `/books/${createdId}`, {
    expectedStatus: 200,
  });
  assert(fetched?.id === createdId, "GET /books/:id must return created book");

  const updated = await request("PUT", `/books/${createdId}`, {
    expectedStatus: 200,
    body: { title: `Smoke Test Book Updated ${now}` },
  });
  assert(
    updated?.title?.includes("Updated"),
    "PUT /books/:id must update title",
  );

  await request("DELETE", `/books/${createdId}`, { expectedStatus: 204 });

  const createdReview = await request("POST", "/books/1/reviews", {
    expectedStatus: 201,
    body: {
      reviewerName: "Smoke Reviewer",
      rating: 5,
      comment: "Looks good",
    },
  });
  assert(
    typeof createdReview?.id === "number",
    "POST /books/:id/reviews must return created review",
  );

  const reviews = await request("GET", "/books/1/reviews?page=1&limit=5", {
    expectedStatus: 200,
  });
  assert(Array.isArray(reviews), "GET /books/:id/reviews must return an array");

  const avg = await request("GET", "/books/1/average-rating", {
    expectedStatus: 200,
  });
  assert(
    Object.prototype.hasOwnProperty.call(avg ?? {}, "averageRating"),
    "GET /books/:id/average-rating must return averageRating",
  );

  const filtered = await request(
    "GET",
    "/books?title=code&year=2008&language=English&sortBy=publishedYear&order=desc&page=1&limit=5",
    { expectedStatus: 200 },
  );
  assert(
    Array.isArray(filtered?.data),
    "Filtered GET /books must return data array",
  );
  assert(
    filtered?.pagination?.limit === 5,
    "Filtered GET /books must apply pagination",
  );

  const invalidQuery = await request("GET", "/books?page=0", {
    expectedStatus: 400,
  });
  assert(
    hasUniformErrorShape(invalidQuery),
    "GET /books?page=0 must return { error, details }",
  );

  const invalidCreate = await request("POST", "/books", {
    expectedStatus: 400,
    body: {
      title: "",
      author: "",
      language: "",
      genre: "",
      publishedYear: -1,
    },
  });
  assert(
    hasUniformErrorShape(invalidCreate),
    "POST /books invalid payload must return { error, details }",
  );

  const notFound = await request("GET", "/does-not-exist", {
    expectedStatus: 404,
  });
  assert(
    hasUniformErrorShape(notFound),
    "Unknown route must return { error, details }",
  );

  console.log("PASS: OSA 1 smoke test completed successfully.");
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
