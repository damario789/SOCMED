import { ValidationError as ClassValidatorError } from 'class-validator';

export const extractValidationMessages = (errors: ClassValidatorError[]): string[] => {
  const result: string[] = [];
  
  for (const error of errors) {
    if (error.constraints) {
      const messages = Object.values(error.constraints);
      result.push(...messages);
    }
    
    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      const nestedMessages = extractValidationMessages(error.children);
      result.push(...nestedMessages);
    }
  }
  
  return result;
};
