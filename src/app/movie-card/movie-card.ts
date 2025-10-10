import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GenreDialogComponent } from '../genre-dialog/genre-dialog';
import { DirectorDialogComponent } from '../director-dialog/director-dialog';
import { SynopsisDialogComponent } from '../synopsis-dialog/synopsis-dialog';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss'
})
export class MovieCardComponent implements OnInit {
  movies: any[] = [];
  loading = true;
  expandedCards: Set<string> = new Set();
  userFavorites: Set<string> = new Set();
  
  constructor(
    public fetchApiData: FetchApiDataService,
    public dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getMovies();
    this.getUserFavorites();
  }

  getMovies(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.fetchApiData.getAllMovies().subscribe({
      next: (resp: any) => {
        this.movies = resp || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.loading = false;
        this.movies = [];
        this.cdr.detectChanges();
      }
    });
  }

  openGenreDialog(genre: any): void {
    this.dialog.open(GenreDialogComponent, {
      width: '500px',
      data: genre
    });
  }

  openDirectorDialog(director: any): void {
    this.dialog.open(DirectorDialogComponent, {
      width: '500px',
      data: director
    });
  }

  openSynopsisDialog(movie: any): void {
    this.dialog.open(SynopsisDialogComponent, {
      width: '500px',
      maxHeight: '80vh',
      data: movie
    });
  }

  addToFavorites(movie: any): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.fetchApiData.addFavoriteMovie(user.Username, movie.Title).subscribe({
      next: (result) => {
        this.userFavorites.add(movie.Title);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding to favorites:', error);
      }
    });
  }

  removeFromFavorites(movie: any): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.fetchApiData.deleteFavoriteMovie(user.Username, movie.Title).subscribe({
      next: (result) => {
        this.userFavorites.delete(movie.Title);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error removing from favorites:', error);
      }
    });
  }

  toggleFavorite(movie: any): void {
    if (this.isFavorite(movie.Title)) {
      this.removeFromFavorites(movie);
    } else {
      this.addToFavorites(movie);
    }
  }

  trackByMovieId(index: number, movie: any): string {
    return movie._id || index;
  }

  toggleCard(movieId: string): void {
    if (this.expandedCards.has(movieId)) {
      this.expandedCards.delete(movieId);
    } else {
      this.expandedCards.add(movieId);
    }
  }

  isExpanded(movieId: string): boolean {
    return this.expandedCards.has(movieId);
  }

  getUserFavorites(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.Username) {
      this.fetchApiData.getFavoriteMovies(user.Username).subscribe({
        next: (favorites: any) => {
          this.userFavorites.clear();
          
          // Handle different possible response structures
          let favoriteIds: string[] = [];
          if (Array.isArray(favorites)) {
            favoriteIds = favorites;
          } else if (favorites && favorites.FavoriteMovies && Array.isArray(favorites.FavoriteMovies)) {
            favoriteIds = favorites.FavoriteMovies;
          } else if (favorites && favorites.movies && Array.isArray(favorites.movies)) {
            favoriteIds = favorites.movies;
          }
          
          // If we have movie IDs, we need to get the movie titles
          if (favoriteIds.length > 0) {
            this.fetchApiData.getAllMovies().subscribe({
              next: (allMovies: any) => {
                // Find movies that match the favorite IDs and add their titles to userFavorites
                allMovies.forEach((movie: any) => {
                  if (favoriteIds.includes(movie._id)) {
                    this.userFavorites.add(movie.Title);
                  }
                });
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.error('Error loading movies for favorites:', error);
              }
            });
          }
        },
        error: (error) => {
          console.error('Error loading favorites:', error);
        }
      });
    }
  }

  isFavorite(movieTitle: string): boolean {
    return this.userFavorites.has(movieTitle);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
