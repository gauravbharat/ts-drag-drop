import { Autobind } from "../decorators/autobind.decorator.js";
import { projectState } from "../state/project-state.js";
import * as Validation from "../util/validation.util.js";
import Component from "./base.component.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  /** Goal:
   * Take handle of the project-input template for the form events
   * Display output in the host element i.e. div#app
   */

  #titleInputEl: HTMLInputElement;
  #descriptionInputEl: HTMLInputElement;
  #peopleInputEl: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.#titleInputEl = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.#descriptionInputEl = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.#peopleInputEl = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  configure(): void {
    this.element.addEventListener("submit", this.handleSubmit);
  }

  renderContent(): void {}

  destructor() {
    // clean-up
    this.element.removeEventListener("submit", this.handleSubmit);
  }

  #gatherUserInput(): [string, string, number] | void {
    const enteredTitle = Validation.removeSpecialCharacters(
      this.#titleInputEl.value
    );
    const enteredDescription = Validation.removeSpecialCharacters(
      this.#descriptionInputEl.value
    );
    const enteredPeople = +this.#peopleInputEl.value;

    const titleValidatable: Validation.Validatable = {
      name: "Title",
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validation.Validatable = {
      name: "Description",
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const peopleValidatable: Validation.Validatable = {
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
      const [isValid, errMessage] = Validation.validate(validatables[i]);
      if (!isValid) {
        alert(errMessage);
        return;
      }
    }

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
      projectState.addProject(title, description, people);
      this.#clearInputs();
    }
  }
}
