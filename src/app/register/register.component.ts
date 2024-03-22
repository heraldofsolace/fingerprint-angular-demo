import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
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
        password_confirm: ['', Validators.required],
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;


    if(this.f.password.value !== this.f.password_confirm.value) {
      this.f.password_confirm.setErrors({ mustMatch: true });
      return;
    }

    if (this.form.invalid) {
        return;
    }


    this.loading = true;
    this.authService.register(this.f.email.value, this.f.password.value, this.f.password_confirm.value)
        .pipe(first())
        .subscribe({
            next: () => {
                alert('Registration successful');
                this.router.navigate(['../login'], { relativeTo: this.route });
            },
            error: error => {
                alert(error);
                this.loading = false;
            }
        });
  }
}
