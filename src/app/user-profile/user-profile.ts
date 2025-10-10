import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GenreDialogComponent } from '../genre-dialog/genre-dialog';
import { DirectorDialogComponent } from '../director-dialog/director-dialog';
import { SynopsisDialogComponent } from '../synopsis-dialog/synopsis-dialog';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent implements OnInit {
  user: any = {};
  userData: any = {};
  favoriteMovies: any[] = [];
  loadingFavorites = true;
  passwordConfirmation = '';
  showPasswordField = false;
  expandedCards: Set<string> = new Set();
  userFavorites: Set<string> = new Set();

  constructor(
    public fetchApiData: FetchApiDataService,
    public snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.user = user;
    this.userData = { ...user };
    
    // Fix date format for HTML date input
    if (this.userData.Birthday) {
      const date = new Date(this.userData.Birthday);
      this.userData.Birthday = date.toISOString().split('T')[0];
    }
    
    // Load favorites after user data is set
    this.getFavoriteMovies();
  }

  updateUser(): void {
    if (!this.passwordConfirmation) {
      this.snackBar.open('Please enter your password to confirm changes', 'OK', {
        duration: 3000
      });
      return;
    }

    // Create user data with password confirmation
    const userDataWithPassword = {
      ...this.userData,
      Password: this.passwordConfirmation
    };

    this.fetchApiData.editUser(this.user.Username, userDataWithPassword).subscribe({
        next: (result) => {
          localStorage.setItem('user', JSON.stringify(result));
          this.user = result;
          this.passwordConfirmation = '';
          this.showPasswordField = false;
          this.cdr.detectChanges();
          this.snackBar.open('Profile updated successfully!', 'OK', {
            duration: 2000
          });
        },
      error: (error) => {
        console.error('Update error:', error);
        let errorMessage = 'Failed to update profile';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.open(errorMessage, 'OK', {
          duration: 3000
        });
      }
    });
  }

  deleteUser(): void {
    if (!this.passwordConfirmation) {
      this.snackBar.open('Please enter your password to confirm account deletion', 'OK', {
        duration: 3000
      });
      return;
    }

    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.fetchApiData.deleteUser(this.user.Username).subscribe({
        next: (result) => {
          localStorage.clear();
          this.snackBar.open('Account deleted successfully', 'OK', {
            duration: 2000
          });
          // Redirect to welcome page
          window.location.href = '/welcome';
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.snackBar.open('Failed to delete account', 'OK', {
            duration: 3000
          });
        }
      });
    }
  }

  getFavoriteMovies(): void {
    if (this.user.Username) {
      this.loadingFavorites = true;
      this.fetchApiData.getFavoriteMovies(this.user.Username).subscribe({
        next: (favorites: any) => {
          // Handle different possible response structures
          let favoriteIds: string[] = [];
          if (Array.isArray(favorites)) {
            favoriteIds = favorites;
          } else if (favorites && favorites.FavoriteMovies && Array.isArray(favorites.FavoriteMovies)) {
            favoriteIds = favorites.FavoriteMovies;
          } else if (favorites && favorites.movies && Array.isArray(favorites.movies)) {
            favoriteIds = favorites.movies;
          }
          
          // Now fetch full movie details for each favorite
          if (favoriteIds.length > 0) {
            this.fetchFullMovieDetails(favoriteIds);
          } else {
            this.favoriteMovies = [];
            this.loadingFavorites = false;
          }
        },
        error: (error) => {
          console.error('Error loading favorites:', error);
          this.loadingFavorites = false;
          this.favoriteMovies = [];
        }
      });
    } else {
      this.loadingFavorites = false;
    }
  }

  fetchFullMovieDetails(favoriteIds: string[]): void {
    // Get all movies and filter for favorites
    this.fetchApiData.getAllMovies().subscribe({
      next: (allMovies: any) => {
        // Filter movies that match the favorite IDs
        this.favoriteMovies = allMovies.filter((movie: any) => 
          favoriteIds.includes(movie._id)
        );
        
        // Populate userFavorites set with movie titles
        this.userFavorites.clear();
        this.favoriteMovies.forEach((movie: any) => {
          this.userFavorites.add(movie.Title);
        });
        
        this.loadingFavorites = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading all movies:', error);
        this.loadingFavorites = false;
        this.cdr.detectChanges();
      }
    });
  }

  showPasswordConfirmation(): void {
    this.showPasswordField = true;
  }

  cancelPasswordConfirmation(): void {
    this.showPasswordField = false;
    this.passwordConfirmation = '';
  }

  goToMovies(): void {
    // Clear any expanded cards before navigating
    this.expandedCards.clear();
    this.router.navigate(['/movies']);
  }

  // Movie card interaction methods (same as movie-card component)
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

  trackByMovieId(index: number, movie: any): string {
    return movie._id || index;
  }

  isFavorite(movieTitle: string): boolean {
    return this.userFavorites.has(movieTitle);
  }

  addToFavorites(movie: any): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.fetchApiData.addFavoriteMovie(user.Username, movie.Title).subscribe({
      next: (result) => {
        this.userFavorites.add(movie.Title);
        this.cdr.detectChanges();
        this.snackBar.open('Added to favorites!', 'OK', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error adding to favorites:', error);
        this.snackBar.open('Failed to add to favorites', 'OK', { duration: 3000 });
      }
    });
  }

  removeFromFavorites(movie: any): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.fetchApiData.deleteFavoriteMovie(user.Username, movie.Title).subscribe({
      next: (result) => {
        this.userFavorites.delete(movie.Title);
        // Remove from the displayed favorites list immediately
        this.favoriteMovies = this.favoriteMovies.filter(fav => fav._id !== movie._id);
        this.cdr.detectChanges();
        this.snackBar.open('Removed from favorites!', 'OK', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error removing from favorites:', error);
        this.snackBar.open('Failed to remove from favorites', 'OK', { duration: 3000 });
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
}
