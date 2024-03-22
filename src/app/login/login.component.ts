import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

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
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.form.controls; }
  
  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
        return;
    }

    this.loading = true;
    this.authService.login(this.f.email.value, this.f.password.value)
        .pipe(first())
        .subscribe({
            next: () => {
                this.router.navigate(['../home'], { relativeTo: this.route });
            },
            error: e => {
                alert(e.error.error);
                this.loading = false;
            }
        });
  }
}
