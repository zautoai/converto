import { FormGroup } from "@angular/forms";

export function markFormGroupAsDirty(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsDirty();
    });
}

export function passwordMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('password');
  const confirmPassword = formGroup.get('confirmPassword');

  if (password && confirmPassword && (password?.value !== confirmPassword?.value)) {
    confirmPassword?.setErrors({ mismatch: true });
  } else {
    confirmPassword?.setErrors(null);
  }
}