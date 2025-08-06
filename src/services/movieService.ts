import axios from "axios";
import type { Movie } from "../types/movie";

interface fetchMoviesProps {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export async function fetchMovies(query: string, page: number): Promise<fetchMoviesProps> {
  const response = await axios.get<fetchMoviesProps>("https://api.themoviedb.org/3/search/movie", {
    params: { query, page },
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    },
  });
  return response.data;
}