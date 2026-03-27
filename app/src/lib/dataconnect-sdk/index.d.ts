import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum OrderDirection {
  ASC = "ASC",
  DESC = "DESC",
};



export interface Actor_Key {
  id: UUIDString;
  __typename?: 'Actor_Key';
}

export interface AddFavoritedMovieData {
  favorite_movie_upsert: FavoriteMovie_Key;
}

export interface AddFavoritedMovieVariables {
  movieId: UUIDString;
}

export interface AddReviewData {
  review_insert: Review_Key;
}

export interface AddReviewVariables {
  movieId: UUIDString;
  rating: number;
  reviewText: string;
}

export interface DeleteFavoritedMovieData {
  favorite_movie_delete?: FavoriteMovie_Key | null;
}

export interface DeleteFavoritedMovieVariables {
  movieId: UUIDString;
}

export interface DeleteReviewData {
  review_delete?: Review_Key | null;
}

export interface DeleteReviewVariables {
  movieId: UUIDString;
}

export interface FavoriteMovie_Key {
  userId: string;
  movieId: UUIDString;
  __typename?: 'FavoriteMovie_Key';
}

export interface GetActorByIdData {
  actor?: {
    id: UUIDString;
    name: string;
    imageUrl: string;
    mainActors: ({
      id: UUIDString;
      title: string;
      genre?: string | null;
      tags?: string[] | null;
      imageUrl: string;
    } & Movie_Key)[];
      supportingActors: ({
        id: UUIDString;
        title: string;
        genre?: string | null;
        tags?: string[] | null;
        imageUrl: string;
      } & Movie_Key)[];
  } & Actor_Key;
}

export interface GetActorByIdVariables {
  id: UUIDString;
}

export interface GetCurrentUserData {
  user?: {
    id: string;
    username: string;
    reviews: ({
      id: UUIDString;
      rating?: number | null;
      reviewDate: DateString;
      reviewText?: string | null;
      movie: {
        id: UUIDString;
        title: string;
      } & Movie_Key;
    })[];
      favoriteMovies: ({
        movie: {
          id: UUIDString;
          title: string;
          genre?: string | null;
          imageUrl: string;
          releaseYear?: number | null;
          rating?: number | null;
          description?: string | null;
          tags?: string[] | null;
          metadata: ({
            director?: string | null;
          })[];
        } & Movie_Key;
      })[];
  } & User_Key;
}

export interface GetIfFavoritedMovieData {
  favorite_movie?: {
    movieId: UUIDString;
  };
}

export interface GetIfFavoritedMovieVariables {
  movieId: UUIDString;
}

export interface GetMovieByIdData {
  movie?: {
    id: UUIDString;
    title: string;
    imageUrl: string;
    releaseYear?: number | null;
    genre?: string | null;
    rating?: number | null;
    description?: string | null;
    tags?: string[] | null;
    metadata: ({
      director?: string | null;
    })[];
      mainActors: ({
        id: UUIDString;
        name: string;
        imageUrl: string;
      } & Actor_Key)[];
        supportingActors: ({
          id: UUIDString;
          name: string;
          imageUrl: string;
        } & Actor_Key)[];
          reviews: ({
            id: UUIDString;
            reviewText?: string | null;
            reviewDate: DateString;
            rating?: number | null;
            user: {
              id: string;
              username: string;
            } & User_Key;
          })[];
  } & Movie_Key;
}

export interface GetMovieByIdVariables {
  id: UUIDString;
}

export interface ListMoviesData {
  movies: ({
    id: UUIDString;
    title: string;
    imageUrl: string;
    releaseYear?: number | null;
    genre?: string | null;
    rating?: number | null;
    tags?: string[] | null;
    description?: string | null;
  } & Movie_Key)[];
}

export interface ListMoviesVariables {
  orderByRating?: OrderDirection | null;
  orderByReleaseYear?: OrderDirection | null;
  limit?: number | null;
}

export interface MovieActor_Key {
  movieId: UUIDString;
  actorId: UUIDString;
  __typename?: 'MovieActor_Key';
}

export interface MovieMetadata_Key {
  id: UUIDString;
  __typename?: 'MovieMetadata_Key';
}

export interface Movie_Key {
  id: UUIDString;
  __typename?: 'Movie_Key';
}

export interface Review_Key {
  userId: string;
  movieId: UUIDString;
  __typename?: 'Review_Key';
}

export interface SearchAllData {
  moviesMatchingTitle: ({
    id: UUIDString;
    title: string;
    genre?: string | null;
    rating?: number | null;
    imageUrl: string;
  } & Movie_Key)[];
    moviesMatchingDescription: ({
      id: UUIDString;
      title: string;
      genre?: string | null;
      rating?: number | null;
      imageUrl: string;
    } & Movie_Key)[];
      actorsMatchingName: ({
        id: UUIDString;
        name: string;
        imageUrl: string;
      } & Actor_Key)[];
        reviewsMatchingText: ({
          id: UUIDString;
          rating?: number | null;
          reviewText?: string | null;
          reviewDate: DateString;
          movie: {
            id: UUIDString;
            title: string;
          } & Movie_Key;
            user: {
              id: string;
              username: string;
            } & User_Key;
        })[];
}

export interface SearchAllVariables {
  input?: string | null;
  minYear: number;
  maxYear: number;
  minRating: number;
  maxRating: number;
  genre: string;
}

export interface UpdateReviewData {
  review_update?: Review_Key | null;
}

export interface UpdateReviewVariables {
  movieId: UUIDString;
  rating: number;
  reviewText: string;
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  username: string;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface AddFavoritedMovieRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddFavoritedMovieVariables): MutationRef<AddFavoritedMovieData, AddFavoritedMovieVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddFavoritedMovieVariables): MutationRef<AddFavoritedMovieData, AddFavoritedMovieVariables>;
  operationName: string;
}
export const addFavoritedMovieRef: AddFavoritedMovieRef;

export function addFavoritedMovie(vars: AddFavoritedMovieVariables): MutationPromise<AddFavoritedMovieData, AddFavoritedMovieVariables>;
export function addFavoritedMovie(dc: DataConnect, vars: AddFavoritedMovieVariables): MutationPromise<AddFavoritedMovieData, AddFavoritedMovieVariables>;

interface DeleteFavoritedMovieRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteFavoritedMovieVariables): MutationRef<DeleteFavoritedMovieData, DeleteFavoritedMovieVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteFavoritedMovieVariables): MutationRef<DeleteFavoritedMovieData, DeleteFavoritedMovieVariables>;
  operationName: string;
}
export const deleteFavoritedMovieRef: DeleteFavoritedMovieRef;

export function deleteFavoritedMovie(vars: DeleteFavoritedMovieVariables): MutationPromise<DeleteFavoritedMovieData, DeleteFavoritedMovieVariables>;
export function deleteFavoritedMovie(dc: DataConnect, vars: DeleteFavoritedMovieVariables): MutationPromise<DeleteFavoritedMovieData, DeleteFavoritedMovieVariables>;

interface AddReviewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddReviewVariables): MutationRef<AddReviewData, AddReviewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddReviewVariables): MutationRef<AddReviewData, AddReviewVariables>;
  operationName: string;
}
export const addReviewRef: AddReviewRef;

export function addReview(vars: AddReviewVariables): MutationPromise<AddReviewData, AddReviewVariables>;
export function addReview(dc: DataConnect, vars: AddReviewVariables): MutationPromise<AddReviewData, AddReviewVariables>;

interface UpdateReviewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateReviewVariables): MutationRef<UpdateReviewData, UpdateReviewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateReviewVariables): MutationRef<UpdateReviewData, UpdateReviewVariables>;
  operationName: string;
}
export const updateReviewRef: UpdateReviewRef;

export function updateReview(vars: UpdateReviewVariables): MutationPromise<UpdateReviewData, UpdateReviewVariables>;
export function updateReview(dc: DataConnect, vars: UpdateReviewVariables): MutationPromise<UpdateReviewData, UpdateReviewVariables>;

interface DeleteReviewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteReviewVariables): MutationRef<DeleteReviewData, DeleteReviewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteReviewVariables): MutationRef<DeleteReviewData, DeleteReviewVariables>;
  operationName: string;
}
export const deleteReviewRef: DeleteReviewRef;

export function deleteReview(vars: DeleteReviewVariables): MutationPromise<DeleteReviewData, DeleteReviewVariables>;
export function deleteReview(dc: DataConnect, vars: DeleteReviewVariables): MutationPromise<DeleteReviewData, DeleteReviewVariables>;

interface ListMoviesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListMoviesVariables): QueryRef<ListMoviesData, ListMoviesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListMoviesVariables): QueryRef<ListMoviesData, ListMoviesVariables>;
  operationName: string;
}
export const listMoviesRef: ListMoviesRef;

export function listMovies(vars?: ListMoviesVariables): QueryPromise<ListMoviesData, ListMoviesVariables>;
export function listMovies(dc: DataConnect, vars?: ListMoviesVariables): QueryPromise<ListMoviesData, ListMoviesVariables>;

interface GetMovieByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMovieByIdVariables): QueryRef<GetMovieByIdData, GetMovieByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMovieByIdVariables): QueryRef<GetMovieByIdData, GetMovieByIdVariables>;
  operationName: string;
}
export const getMovieByIdRef: GetMovieByIdRef;

export function getMovieById(vars: GetMovieByIdVariables): QueryPromise<GetMovieByIdData, GetMovieByIdVariables>;
export function getMovieById(dc: DataConnect, vars: GetMovieByIdVariables): QueryPromise<GetMovieByIdData, GetMovieByIdVariables>;

interface GetActorByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActorByIdVariables): QueryRef<GetActorByIdData, GetActorByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetActorByIdVariables): QueryRef<GetActorByIdData, GetActorByIdVariables>;
  operationName: string;
}
export const getActorByIdRef: GetActorByIdRef;

export function getActorById(vars: GetActorByIdVariables): QueryPromise<GetActorByIdData, GetActorByIdVariables>;
export function getActorById(dc: DataConnect, vars: GetActorByIdVariables): QueryPromise<GetActorByIdData, GetActorByIdVariables>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect): QueryPromise<GetCurrentUserData, undefined>;

interface GetIfFavoritedMovieRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetIfFavoritedMovieVariables): QueryRef<GetIfFavoritedMovieData, GetIfFavoritedMovieVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetIfFavoritedMovieVariables): QueryRef<GetIfFavoritedMovieData, GetIfFavoritedMovieVariables>;
  operationName: string;
}
export const getIfFavoritedMovieRef: GetIfFavoritedMovieRef;

export function getIfFavoritedMovie(vars: GetIfFavoritedMovieVariables): QueryPromise<GetIfFavoritedMovieData, GetIfFavoritedMovieVariables>;
export function getIfFavoritedMovie(dc: DataConnect, vars: GetIfFavoritedMovieVariables): QueryPromise<GetIfFavoritedMovieData, GetIfFavoritedMovieVariables>;

interface SearchAllRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchAllVariables): QueryRef<SearchAllData, SearchAllVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchAllVariables): QueryRef<SearchAllData, SearchAllVariables>;
  operationName: string;
}
export const searchAllRef: SearchAllRef;

export function searchAll(vars: SearchAllVariables): QueryPromise<SearchAllData, SearchAllVariables>;
export function searchAll(dc: DataConnect, vars: SearchAllVariables): QueryPromise<SearchAllData, SearchAllVariables>;

