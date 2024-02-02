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

    this.#configure();
    this.#attach();
  }

  @Autobind
  private handleSubmit(event: Event): void {
    event.preventDefault(); // prevent http request to be sent
    console.group("handleSubmit");
    console.log("title", this.#titleInputEl.value);
    console.log("description", this.#descriptionInputEl.value);
    console.log("people", this.#peopleInputEl.value);
    console.groupEnd();
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
