import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const OrderDirection = {
  ASC: "ASC",
  DESC: "DESC",
}

export const connectorConfig = {
  connector: 'movie-connector',
  service: 'fdc-quickstart-web',
  location: 'us-central1'
};

export const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';

export function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
}

export const addFavoritedMovieRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddFavoritedMovie', inputVars);
}
addFavoritedMovieRef.operationName = 'AddFavoritedMovie';

export function addFavoritedMovie(dcOrVars, vars) {
  return executeMutation(addFavoritedMovieRef(dcOrVars, vars));
}

export const deleteFavoritedMovieRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteFavoritedMovie', inputVars);
}
deleteFavoritedMovieRef.operationName = 'DeleteFavoritedMovie';

export function deleteFavoritedMovie(dcOrVars, vars) {
  return executeMutation(deleteFavoritedMovieRef(dcOrVars, vars));
}

export const addReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddReview', inputVars);
}
addReviewRef.operationName = 'AddReview';

export function addReview(dcOrVars, vars) {
  return executeMutation(addReviewRef(dcOrVars, vars));
}

export const updateReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateReview', inputVars);
}
updateReviewRef.operationName = 'UpdateReview';

export function updateReview(dcOrVars, vars) {
  return executeMutation(updateReviewRef(dcOrVars, vars));
}

export const deleteReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteReview', inputVars);
}
deleteReviewRef.operationName = 'DeleteReview';

export function deleteReview(dcOrVars, vars) {
  return executeMutation(deleteReviewRef(dcOrVars, vars));
}

export const listMoviesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMovies', inputVars);
}
listMoviesRef.operationName = 'ListMovies';

export function listMovies(dcOrVars, vars) {
  return executeQuery(listMoviesRef(dcOrVars, vars));
}

export const getMovieByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMovieById', inputVars);
}
getMovieByIdRef.operationName = 'GetMovieById';

export function getMovieById(dcOrVars, vars) {
  return executeQuery(getMovieByIdRef(dcOrVars, vars));
}

export const getActorByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActorById', inputVars);
}
getActorByIdRef.operationName = 'GetActorById';

export function getActorById(dcOrVars, vars) {
  return executeQuery(getActorByIdRef(dcOrVars, vars));
}

export const getCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser');
}
getCurrentUserRef.operationName = 'GetCurrentUser';

export function getCurrentUser(dc) {
  return executeQuery(getCurrentUserRef(dc));
}

export const getIfFavoritedMovieRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetIfFavoritedMovie', inputVars);
}
getIfFavoritedMovieRef.operationName = 'GetIfFavoritedMovie';

export function getIfFavoritedMovie(dcOrVars, vars) {
  return executeQuery(getIfFavoritedMovieRef(dcOrVars, vars));
}

export const searchAllRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchAll', inputVars);
}
searchAllRef.operationName = 'SearchAll';

export function searchAll(dcOrVars, vars) {
  return executeQuery(searchAllRef(dcOrVars, vars));
}

