import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {
  FingerprintjsProAngularService,
} from '@fingerprintjs/fingerprintjs-pro-angular'
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private authService: AuthService,
      private fingerprintService: FingerprintjsProAngularService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.form.controls; }
  
  async onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
        return;
    }

    this.loading = true;
    const data = await this.fingerprintService.getVisitorData();
    this.authService.login(this.f.email.value, this.f.password.value, data.requestId, data.visitorId)
        .pipe(first())
        .subscribe({
            next: () => {
              if(this.authService.userValue?.verifiedDevice) {
                this.router.navigate(['../home'], { relativeTo: this.route });
              } else {
                this.router.navigate(['../verify'], { relativeTo: this.route });
              }
            },
            error: e => {
                alert(e.error.error);
                this.loading = false;
            }
        });
  }
}
