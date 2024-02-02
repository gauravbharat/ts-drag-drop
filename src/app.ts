// Validation
interface Validatable {
  name: string;
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable): [boolean, string] {
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

const removeSpecialCharacters = (text: string): string =>
  text.replace(/[^a-zA-Z ]/g, "");

// autobind decorator
function Autobind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };

  return adjustedDescriptor;
}

class ProjectInput {
  /** Goal:
   * Take handle of the project-input template for the form events
   * Display output in the host element i.e. div#app
   */

  #templateEl: HTMLTemplateElement;
  #hostEl: HTMLDivElement;
  #formEl: HTMLFormElement;

  #titleInputEl: HTMLInputElement;
  #descriptionInputEl: HTMLInputElement;
  #peopleInputEl: HTMLInputElement;

  constructor() {
    this.#templateEl = document.getElementById(
      "project-input"
    ) as HTMLTemplateElement;
    this.#hostEl = document.getElementById("app") as HTMLDivElement;

    const importedNode = document.importNode(this.#templateEl.content, true);
    this.#formEl = importedNode.firstElementChild as HTMLFormElement;
    this.#formEl.id = "user-input";

    this.#titleInputEl = this.#formEl.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.#descriptionInputEl = this.#formEl.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.#peopleInputEl = this.#formEl.querySelector(
      "#people"
    ) as HTMLInputElement;

    // console.log(
    //   "this.#titleInputEl label",
    //   this.#formEl.querySelector('[for="title"]')?.textContent
    // );

    this.#configure();
    this.#attach();
  }

  #gatherUserInput(): [string, string, number] | void {
    // console.group("handleSubmit");
    // console.log("title", this.#titleInputEl.value);
    // console.log("description", this.#descriptionInputEl.value);
    // console.log("people", this.#peopleInputEl.value);
    // console.groupEnd();

    const enteredTitle = removeSpecialCharacters(this.#titleInputEl.value);
    const enteredDescription = removeSpecialCharacters(
      this.#descriptionInputEl.value
    );
    const enteredPeople = +this.#peopleInputEl.value;

    const titleValidatable: Validatable = {
      name: "Title",
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      name: "Description",
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const peopleValidatable: Validatable = {
      name: "People",
      value: enteredPeople,
      required: true,
      min: 1,
      max: 10,
    };

    const validatables = [
      titleValidatable,
      descriptionValidatable,
      peopleValidatable,
    ];

    for (let i = 0; i < 3; i++) {
      const [isValid, errMessage] = validate(validatables[i]);
      if (!isValid) {
        alert(errMessage);
        return;
      }
    }

    // if (
    //   !validate(titleValidatable)[0] ||
    //   !validate(descriptionValidatable)[0] ||
    //   !validate(peopleValidatable)[0]
    // ) {
    //   alert("Invalid input");
    //   return;
    // }

    return [enteredTitle, enteredDescription, enteredPeople];
  }

  #clearInputs(): void {
    this.#titleInputEl.value = "";
    this.#descriptionInputEl.value = "";
    this.#peopleInputEl.value = "";
  }

  @Autobind
  private handleSubmit(event: Event): void {
    event.preventDefault(); // prevent http request to be sent

    const userInput = this.#gatherUserInput();

    console.log("userInput", userInput);

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      console.log(title, description, people);
      this.#clearInputs();
    }
  }

  #configure(): void {
    this.#formEl.addEventListener("submit", this.handleSubmit);
  }

  #attach(): void {
    this.#hostEl.insertAdjacentElement("afterbegin", this.#formEl);
  }

  destructor() {
    // clean-up
    this.#formEl.removeEventListener("submit", this.handleSubmit);
  }
}

const projectInput = new ProjectInput();
