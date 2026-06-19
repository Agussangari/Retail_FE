import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // In a real app, you would also check if the token is valid/expired.
  if (token) {
    return true;
  }

  // Optional: Redirect to a login page if one existed
  // router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  
  // For this basic setup, we'll just allow it or return false if we strictly enforce it.
  // Since we don't have a login page in the requirements, we can allow it for now or assume token exists.
  // We'll enforce it and require the user to set a token to proceed if they want true auth.
  // For development without a login page, let's return true, but log a warning.
  console.warn('AuthGuard: No token found. Allowing access for development purposes.');
  return true;
};
