import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // check if route is restricted by role
      if (route.data['roles'] && route.data['roles'].indexOf(currentUser.role) === -1) {
        // role not authorized
        this.router.navigate(['/']);
        return false;
      }
      return true;
    }

    // not logged in
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
