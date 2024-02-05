// Validation
export interface Validatable {
  name: string;
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(validatableInput: Validatable): [boolean, string] {
  let isValid = true;
  let rtnMessage = "";

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length > 0;
    !isValid && (rtnMessage = "is required");
  }

  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string" &&
    isValid
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
    !isValid &&
      (rtnMessage = `should be greater than or equal to ${validatableInput.minLength} characters`);
  }

  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string" &&
    isValid
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
    !isValid &&
      (rtnMessage = `should be less than or equal to ${validatableInput.maxLength} characters`);
  }

  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number" &&
    isValid
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
    !isValid &&
      (rtnMessage = `should be of minumum value ${validatableInput.min}`);
  }

  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number" &&
    isValid
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
    !isValid &&
      (rtnMessage = `can be of maximum value ${validatableInput.min}`);
  }

  if (rtnMessage.length > 0) {
    rtnMessage = `${validatableInput.name || "Field"} ${rtnMessage}`;
  }

  console.log("rtnMessage", rtnMessage);

  return [isValid, rtnMessage];
}

export const removeSpecialCharacters = (text: string): string =>
  text.replace(/[^a-zA-Z ]/g, "");
