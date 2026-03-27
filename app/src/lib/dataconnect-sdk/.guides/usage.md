# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUser, addFavoritedMovie, deleteFavoritedMovie, addReview, updateReview, deleteReview, listMovies, getMovieById, getActorById, getCurrentUser } from '@movie/dataconnect';


// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation AddFavoritedMovie:  For variables, look at type AddFavoritedMovieVars in ../index.d.ts
const { data } = await AddFavoritedMovie(dataConnect, addFavoritedMovieVars);

// Operation DeleteFavoritedMovie:  For variables, look at type DeleteFavoritedMovieVars in ../index.d.ts
const { data } = await DeleteFavoritedMovie(dataConnect, deleteFavoritedMovieVars);

// Operation AddReview:  For variables, look at type AddReviewVars in ../index.d.ts
const { data } = await AddReview(dataConnect, addReviewVars);

// Operation UpdateReview:  For variables, look at type UpdateReviewVars in ../index.d.ts
const { data } = await UpdateReview(dataConnect, updateReviewVars);

// Operation DeleteReview:  For variables, look at type DeleteReviewVars in ../index.d.ts
const { data } = await DeleteReview(dataConnect, deleteReviewVars);

// Operation ListMovies:  For variables, look at type ListMoviesVars in ../index.d.ts
const { data } = await ListMovies(dataConnect, listMoviesVars);

// Operation GetMovieById:  For variables, look at type GetMovieByIdVars in ../index.d.ts
const { data } = await GetMovieById(dataConnect, getMovieByIdVars);

// Operation GetActorById:  For variables, look at type GetActorByIdVars in ../index.d.ts
const { data } = await GetActorById(dataConnect, getActorByIdVars);

// Operation GetCurrentUser: 
const { data } = await GetCurrentUser(dataConnect);


```