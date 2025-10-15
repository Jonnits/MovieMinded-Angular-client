import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * API URL for the MovieMinded backend service
 */
const apiUrl = 'https://movieminded-d764560749d0.herokuapp.com/';

/**
 * Service for handling all API calls to the MovieMinded backend
 * Provides methods for user authentication, movie data retrieval, and user profile management
 */
@Injectable({
  providedIn: 'root'
})
export class FetchApiDataService {
  /**
   * Creates an instance of FetchApiDataService
   * @param http - Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {
  }
  /**
   * Registers a new user with the MovieMinded service
   * @param userDetails - Object containing user registration data (username, password, email, birthday)
   * @returns Observable containing the registration response
   */
  public userRegistration(userDetails: any): Observable<any> {
    return this.http.post(apiUrl + 'users', userDetails).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Authenticates a user and returns a JWT token
   * @param userDetails - Object containing login credentials (username, password)
   * @returns Observable containing user data and authentication token
   */
  public userLogin(userDetails: any): Observable<any> {
    return this.http.post(apiUrl + 'login', userDetails).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves all movies from the MovieMinded database
   * @returns Observable containing array of movie objects
   */
  public getAllMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies', {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Get one movie
  public getOneMovie(title: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/' + title, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Get director
  public getDirector(directorName: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/directors/' + directorName, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Get genre
  public getGenre(genreName: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/genre/' + genreName, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Get user
  public getUser(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'users/' + username, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Get all users
  public getAllUsers(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'users', {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Get favorite movies for a user (Note: Your backend doesn't have this endpoint)
  // You'll need to implement this in your backend or get user data and extract favorites
  public getFavoriteMovies(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'users/' + username, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map((user: any) => user.FavoriteMovies || []),
      catchError(this.handleError)
    );
  }

  // Add a movie to favorite Movies
  public addFavoriteMovie(username: string, movieTitle: string): Observable<any> {
    const token = localStorage.getItem('token');
    const encodedTitle = encodeURIComponent(movieTitle);
    return this.http.post(apiUrl + 'users/' + username + '/movies/' + encodedTitle, {}, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Edit user
  public editUser(username: string, userDetails: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.put(apiUrl + 'users/' + username, userDetails, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Delete user
  public deleteUser(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(apiUrl + 'users/' + username, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Delete a movie from the favorite movies
  public deleteFavoriteMovie(username: string, movieTitle: string): Observable<any> {
    const token = localStorage.getItem('token');
    const encodedTitle = encodeURIComponent(movieTitle);
    return this.http.delete(apiUrl + 'users/' + username + '/movies/' + encodedTitle, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /**
   * Extracts response data from HTTP responses
   * @param res - HTTP response object
   * @returns Extracted response data or empty object
   * @private
   */
  private extractResponseData(res: any): any {
    const body = res;
    return body || { };
  }

  /**
   * Handles HTTP errors and provides user-friendly error messages
   * @param error - HttpErrorResponse object containing error details
   * @returns Observable that throws an error with appropriate message
   * @private
   */
  private handleError(error: HttpErrorResponse): any {
    console.error('HTTP Error:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client-side error:', error.error.message);
      return throwError(() => new Error('A client-side error occurred. Please check your connection.'));
    } else {
      // Server-side error
      console.error(`Server error - Status: ${error.status}, Body:`, error.error);
      
      // Return the actual error object so components can access error details
      return throwError(() => error);
    }
  }
}

