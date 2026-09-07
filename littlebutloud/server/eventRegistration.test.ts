import { describe, expect, it } from "vitest";
import { validateRegistrationAnswers, validateRegistrationContact } from "@shared/eventRegistration";

describe("event registration validation", () => {
  it("requires name, a valid email, and contact number", () => {
    expect(validateRegistrationContact({ name: "", email: "wrong", phone: "" })).toEqual({
      name: "Name is required",
      email: "Enter a valid email address",
      phone: "Contact number is required",
    });
  });

  it("accepts complete mandatory contact details", () => {
    expect(validateRegistrationContact({ name: "Amina Tan", email: "amina@example.com", phone: "+65 8123 4567" })).toEqual({});
  });

  it("requires configured text and checkbox questions", () => {
    const questions = [
      { fieldKey: "dietary", label: "Dietary requirements", questionType: "text" as const, isRequired: true },
      { fieldKey: "consent", label: "I agree to the event guidelines", questionType: "checkbox" as const, isRequired: true },
    ];
    expect(validateRegistrationAnswers(questions, { dietary: "", consent: false })).toEqual({
      dietary: "Dietary requirements is required",
      consent: "I agree to the event guidelines is required",
    });
  });

  it("allows optional questions to remain blank", () => {
    expect(validateRegistrationAnswers([{ fieldKey: "organisation", label: "Organisation", questionType: "text", isRequired: false }], {})).toEqual({});
  });
});
