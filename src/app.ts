// Drag & Drop interfaces
interface Draggable {
  handleDragStart(event: DragEvent): void;
  handleDragEnd(event: DragEvent): void;
}

interface DragTarget {
  handleDragOver(event: DragEvent): void;
  handleDrop(event: DragEvent): void;
  handleDragLeave(event: DragEvent): void;
}

// Project type
enum ProjectStatus {
  Active,
  Finished,
}

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
type ExecuterFn<T> = (items: T[]) => void;

class State<T> {
  protected actionExecutors: ExecuterFn<T>[] = [];

  addListener(executorFn: ExecuterFn<T>) {
    this.actionExecutors.push(executorFn);
  }

  updateListeners(projects: T[]) {
    for (const executorFn of this.actionExecutors) {
      executorFn(projects);
    }
  }
}

class ProjectState extends State<Project> {
  #projects: Project[] = [];

  private static instance: ProjectState;
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) return this.instance;

    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number): void {
    const newProject = new Project(
      `${Math.floor(Math.random() * 100000).toString()}`,
      title,
      description,
      people,
      ProjectStatus.Active
    );

    this.#projects.push(newProject);
    this.#updateExecutorFns();
  }

  moveProject(projectId: string, newStatus: ProjectStatus): void {
    const project = this.#projects.find(
      (project) => project.id === projectId && project.status !== newStatus
    );

    if (project) {
      project.status = newStatus;
      this.#updateExecutorFns();
    }
  }

  #updateExecutorFns() {
    this.updateListeners(this.#projects.slice());
    // for (const executorFn of this.actionExecutors) {
    //   executorFn(this.#projects.slice());
    // }
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

// Component base class, generic since the hold el and element types would be different for different instances
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  protected templateEl: HTMLTemplateElement;
  protected hostEl: T;
  protected element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateEl = document.getElementById(
      templateId
    ) as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostElementId) as T;
    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.#attach(insertAtStart);
  }

  protected abstract configure(): void;
  protected abstract renderContent(): void;

  #attach(insertAtBeginning: boolean): void {
    this.hostEl.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  #project: Project;

  get persons(): string {
    if (this.#project.people === 1) {
      return `1 person`;
    } else {
      return `${this.#project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.#project = project;

    this.configure();
    this.renderContent();
  }

  destructor() {
    this.element.removeEventListener("dragstart", this.handleDragStart);
    this.element.removeEventListener("dragend", this.handleDragEnd);
  }

  @Autobind
  handleDragStart(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.#project.id);
    event.dataTransfer!.effectAllowed = "move"; // move element instead of copy
  }

  @Autobind
  handleDragEnd(_: DragEvent): void {
    console.log("handleDragEnd", this.#project.title);
  }

  protected configure(): void {
    this.element.addEventListener("dragstart", this.handleDragStart);
    this.element.addEventListener("dragend", this.handleDragEnd);
  }

  protected renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.#project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.#project.description;
  }
}

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  #assignedProjects: Project[] = [];
  #currentProjectStatus: ProjectStatus;

  constructor(private projectType: "active" | "finished") {
    super("project-list", "app", false, `${projectType}-projects`);
    this.#currentProjectStatus =
      this.projectType === "active"
        ? ProjectStatus.Active
        : ProjectStatus.Finished;

    this.configure();
    this.renderContent();
  }

  destructor() {
    this.element.removeEventListener("dragover", this.handleDragOver);
    this.element.removeEventListener("dragleave", this.handleDragLeave);
    this.element.removeEventListener("drop", this.handleDrop);
  }

  @Autobind
  handleDragOver(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      // change the appearance of the drag over area
      const listEl = this.element.querySelector("ul");
      listEl?.classList.add("droppable");
    }
  }

  @Autobind
  handleDrop(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData("text/plain");
    if (projectId) {
      projectState.moveProject(projectId, this.#currentProjectStatus);
    }
  }

  @Autobind
  handleDragLeave(_: DragEvent): void {
    const listEl = this.element.querySelector("ul");
    listEl?.classList.remove("droppable");
  }

  configure(): void {
    this.element.addEventListener("dragover", this.handleDragOver);
    this.element.addEventListener("dragleave", this.handleDragLeave);
    this.element.addEventListener("drop", this.handleDrop);

    projectState.addListener((projects: Project[]): void => {
      this.#assignedProjects = projects.filter(
        (project) => project.status === this.#currentProjectStatus
      );
      this.#renderProjects();
    });
  }

  renderContent(): void {
    const listId = `${this.projectType}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.projectType.toUpperCase() + " PROJECTS";
  }

  #renderProjects(): void {
    const listEl = document.getElementById(
      `${this.projectType}-projects-list`
    ) as HTMLUListElement;

    const ulChildrenIds: string[] = [...listEl.children].map((v) => v.id);

    // console.log(
    //   "listEl children",
    //   ulChildrenIds,
    //   "status",
    //   this.#currentProjectStatus,
    //   "this.#assignedProjects",
    //   this.#assignedProjects
    // );

    // listEl.innerHTML = ""; //clear list item to rerender

    for (const projectItem of this.#assignedProjects) {
      if (!ulChildrenIds.includes(projectItem.id)) {
        new ProjectItem(listEl.id, projectItem);
      }
    }
    const assignedProjectIds = this.#assignedProjects.map((v) => v.id);

    const updatedUlChildrenIds: string[] = [...listEl.children].map(
      (v) => v.id
    );

    if (assignedProjectIds.length !== updatedUlChildrenIds.length) {
      for (const id of updatedUlChildrenIds) {
        if (!assignedProjectIds.includes(id)) {
          listEl.removeChild([...listEl.children].find((v) => v.id === id)!);
        }
      }
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
