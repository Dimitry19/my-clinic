import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minDateValidator(minDate: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // laisser Validators.required gérer le vide
    }

    const selectedDate = new Date(value);
    const minimumDate = new Date(minDate);

    return selectedDate >= minimumDate
      ? null
      : {
          minDate: {
            requiredMinDate: minDate,
            actualDate: value,
          },
        };
  };
}
