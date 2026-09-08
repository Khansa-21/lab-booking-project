import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: '../legal-page.scss',
})
export class Contact {
  private readonly formBuilder = inject(FormBuilder);
  private readonly supportEmail = 'resource-support@example.edu';
  readonly submitted = signal(false);
  readonly emailLink = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    topic: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, topic, message } = this.form.getRawValue();
    const subject = encodeURIComponent(`[${topic}] University Resource Hub support`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    this.emailLink.set(`mailto:${this.supportEmail}?subject=${subject}&body=${body}`);
    this.submitted.set(true);
  }
}
