import css from "./App.module.css";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Loader from "../Loader/Loader";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import SearchBar from "../SearchBar/SearchBar";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { useQuery, keepPreviousData} from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';



export default function App() {
  const [query, setQuery] = useState<string>('');
  const [page, setPage] =useState(1)
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
  
  const { data: movies, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query,
    placeholderData: keepPreviousData,
  });
  
  const totalPages = movies?.total_pages||0;
  
  return (
    <div className={css.app}>
      <Toaster position="top-right" />
      <SearchBar onSubmit={handleSubmit} />
      {isSuccess&&totalPages>1&&(
      <ReactPaginate 
      pageCount={totalPages}
      pageRangeDisplayed={5}
      marginPagesDisplayed={1}
      onPageChange={({ selected }) => setPage(selected + 1)}
      forcePage={page - 1}
      containerClassName={css.pagination}
      activeClassName={css.active}
      nextLabel="→"
      previousLabel="←" />
      )}
      {isLoading && <Loader />}
      {isError && <ErrorMessage message={error?.message} />}
      {!isLoading && !isError && movies && movies.results.length > 0 && (
        <MovieGrid onSelect={handleSelectMovie.results} movies={movies.results} />
      )}
      {isMovieModalOpen && selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}
    </div>
  );
}
