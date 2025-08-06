import css from "./App.module.css";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Loader from "../Loader/Loader";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import SearchBar from "../SearchBar/SearchBar";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import { Toaster, toast } from 'sonner';
import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';

export default function App() {
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const openModal = () => setIsMovieModalOpen(true);
  const closeModal = () => {
    setIsMovieModalOpen(false);
    setSelectedMovie(null);
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    openModal();
  };

  const handleSubmit = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
  };

  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query,
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.total_pages || 0;
  const movies = data?.results || [];

  useEffect(() => {
    if (isError) {
      toast.error(`Помилка: ${error?.message || 'Не вдалося отримати фільми'}`);
    }
  }, [isError, error]);

  useEffect(() => {
    if (isSuccess && movies.length === 0 && query !== '') {
      toast.info(`Фільмів за запитом "${query}" не знайдено.`);
    }
  }, [isSuccess, movies, query]);

  return (
    <div className={css.app}>
      <Toaster position="top-right" duration={2000} />
      <SearchBar onSubmit={handleSubmit} />
      {isSuccess && totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {isLoading && <Loader />}
      {isError && <ErrorMessage message={error?.message} />}
      {!isLoading && !isError && movies.length > 0 && (
        <MovieGrid onSelect={handleSelectMovie} movies={movies} />
      )}
      {isMovieModalOpen && selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}
    </div>
  );
}
