import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {
  FingerprintjsProAngularService,
} from '@fingerprintjs/fingerprintjs-pro-angular'

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss'
})
export class VerifyComponent {
  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private authService: AuthService,
      private fingerprintService: FingerprintjsProAngularService,
  ) { }

  async onClick() {
    const data = await this.fingerprintService.getVisitorData();
    this.authService.verify(data.visitorId)
        .pipe(first())
        .subscribe({
            next: (value) => {
              if(value.verified)
                this.router.navigate(['../home'], { relativeTo: this.route });
              else
                alert('Device not verified');
            },
            error: e => {
                alert(e.error.error);
            }
        });
  }
}
