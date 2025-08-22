import { ValidationError as ClassValidatorError } from 'class-validator';

export function extractValidationMessages(errors: ClassValidatorError[]): string[] {
    return errors
        .map(e => Object.values(e.constraints || {}))
        .flat();
}
