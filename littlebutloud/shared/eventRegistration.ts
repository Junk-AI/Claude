export type RegistrationAnswer = string | number | boolean;

export type RegistrationQuestion = {
  fieldKey: string;
  label: string;
  questionType: "text" | "textarea" | "email" | "phone" | "number" | "select" | "checkbox";
  isRequired: boolean;
};

export type RegistrationContact = {
  name: string;
  email: string;
  phone: string;
};

export function validateRegistrationContact(contact: RegistrationContact): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!contact.name.trim()) errors.name = "Name is required";
  if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) errors.email = "Enter a valid email address";
  if (!contact.phone.trim()) errors.phone = "Contact number is required";
  return errors;
}

export function validateRegistrationAnswers(
  questions: RegistrationQuestion[],
  answers: Record<string, RegistrationAnswer>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const question of questions) {
    const value = answers[question.fieldKey];
    const empty = value === undefined || value === null || (typeof value === "string" && !value.trim());
    if (question.isRequired && (empty || (question.questionType === "checkbox" && value !== true))) {
      errors[question.fieldKey] = `${question.label} is required`;
    }
  }
  return errors;
}
