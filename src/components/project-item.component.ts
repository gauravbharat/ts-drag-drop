import { Autobind } from "../decorators/autobind.decorator";
import { Draggable } from "../models/drag-drop.model";
import { Project } from "../models/project.model";
import { projectState } from "../state/project-state";
import Component from "./base.component";

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  #project: Project;
  #deleteButton: HTMLButtonElement;

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

    const elementChildren = [...this.element.children];
    this.#deleteButton = elementChildren.find(
      (v) => v.localName === "button" && v.className === "delete-project"
    ) as HTMLButtonElement;

    this.configure();
    this.renderContent();
  }

  destructor() {
    this.element.removeEventListener("dragstart", this.handleDragStart);
    this.element.removeEventListener("dragend", this.handleDragEnd);
    this.#deleteButton.removeEventListener("click", this.handleDelete);
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

  @Autobind
  handleDelete(): void {
    projectState.deleteProject(this.#project.id);
  }

  protected configure(): void {
    this.element.addEventListener("dragstart", this.handleDragStart);
    this.element.addEventListener("dragend", this.handleDragEnd);
    this.#deleteButton.addEventListener("click", this.handleDelete);
  }

  protected renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.#project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.#project.description;
  }
}
