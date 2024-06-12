import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export function markFormGroupAsDirty(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsDirty();
    });
}


export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirm_password');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true }; 
  } else {
    confirmPassword?.setErrors(null);
  }
  return null;
};