import { Genre } from "../models/genre.model";

let genres: Genre[] = [
  { id: 1, name: "Programming", description: "Software development books" },
  {
    id: 2,
    name: "Architecture",
    description: "Software design and architecture",
  },
  { id: 3, name: "Testing", description: "Testing practices and quality" },
];

export async function getGenres(): Promise<Genre[]> {
  return genres;
}

export async function getGenreById(id: number): Promise<Genre | null> {
  const genre = genres.find((item) => item.id === id);
  return genre ?? null;
}

export async function addGenre(newGenre: Omit<Genre, "id">): Promise<Genre> {
  const id = genres.length > 0 ? genres[genres.length - 1].id + 1 : 1;
  const genreToAdd: Genre = { id, ...newGenre };
  genres.push(genreToAdd);
  return genreToAdd;
}

export async function updateGenre(
  id: number,
  updatedGenre: Partial<Genre>,
): Promise<Genre | null> {
  const index = genres.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const merged = { ...genres[index], ...updatedGenre, id };
  genres[index] = merged;
  return merged;
}

export async function deleteGenre(id: number): Promise<boolean> {
  const before = genres.length;
  genres = genres.filter((item) => item.id !== id);
  return genres.length < before;
}
