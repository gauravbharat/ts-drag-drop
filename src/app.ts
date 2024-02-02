class ProjectInput {
  /** Goal:
   * Take handle of the project-input template for the form events
   * Display output in the host element i.e. div#app
   */

  #templateEl: HTMLTemplateElement;
  #hostEl: HTMLDivElement;
  #formEl: HTMLFormElement;

  constructor() {
    this.#templateEl = <HTMLTemplateElement>(
      document.getElementById("project-input")
    );
    this.#hostEl = <HTMLDivElement>document.getElementById("app");

    const importedNode = document.importNode(this.#templateEl.content, true);
    this.#formEl = importedNode.firstElementChild as HTMLFormElement;
    this.#formEl.id = "user-input";
    this.#attach();
  }

  #attach(): void {
    this.#hostEl.insertAdjacentElement("afterbegin", this.#formEl);
  }
}

const projectInput = new ProjectInput();
