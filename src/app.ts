enum ProjectStatus {
  Active,
  Finished,
}

// Project type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management
type ExecuterFn = (items: Project[]) => void;

class ProjectState {
  #projects: Project[] = [];
  #actionExecutors: ExecuterFn[] = [];

  private static instance: ProjectState;
  private constructor() {}

  static getInstance() {
    if (this.instance) return this.instance;

    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number): void {
    const newProject = new Project(
      `${new Date()
        .toJSON()
        .replace(/-/g, "_")
        .replace(/:/g, "_")
        .replace(/./g, "_")}_${Math.floor(Math.random() * 100000).toString()}`,
      title,
      description,
      people,
      ProjectStatus.Active
    );

    this.#projects.push(newProject);
    for (const executorFn of this.#actionExecutors) {
      executorFn(this.#projects.slice());
    }
  }

  addListener(executorFn: ExecuterFn) {
    this.#actionExecutors.push(executorFn);
  }
}

const projectState = ProjectState.getInstance(); // Singleton class

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

class ProjectList {
  #templateEl: HTMLTemplateElement;
  #hostEl: HTMLDivElement;
  #listSectionEl: HTMLElement;

  #assignedProjects: Project[] = [];
  #currentProjectStatus: ProjectStatus;

  constructor(private projectType: "active" | "finished") {
    this.#currentProjectStatus =
      this.projectType === "active"
        ? ProjectStatus.Active
        : ProjectStatus.Finished;

    this.#templateEl = document.getElementById(
      "project-list"
    ) as HTMLTemplateElement;
    this.#hostEl = document.getElementById("app") as HTMLDivElement;

    const importedNode = document.importNode(this.#templateEl.content, true);
    this.#listSectionEl = importedNode.firstElementChild as HTMLElement;
    this.#listSectionEl.id = `${this.projectType}-projects`;

    projectState.addListener((projects: Project[]): void => {
      this.#assignedProjects = projects.filter(
        (project) => project.status === this.#currentProjectStatus
      );
      this.#renderProjects();
    });

    this.#attach();
    this.#renderContent();
  }

  #renderProjects(): void {
    const listEl = document.getElementById(
      `${this.projectType}-projects-list`
    ) as HTMLUListElement;

    listEl.innerHTML = ""; //clear list item to rerender

    for (const projectItem of this.#assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listEl?.appendChild(listItem);
    }
  }

  #renderContent(): void {
    const listId = `${this.projectType}-projects-list`;
    this.#listSectionEl.querySelector("ul")!.id = listId;
    this.#listSectionEl.querySelector("h2")!.textContent =
      this.projectType.toUpperCase() + " PROJECTS";
  }

  #attach(): void {
    this.#hostEl.insertAdjacentElement("beforeend", this.#listSectionEl);
  }
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
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
