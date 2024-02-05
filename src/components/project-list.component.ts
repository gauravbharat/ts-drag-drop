import { Autobind } from "../decorators/autobind.decorator";
import { DragTarget } from "../models/drag-drop.model";
import { Project, ProjectStatus } from "../models/project.model";
import { projectState } from "../state/project-state";

import Component from "./base.component";
import { ProjectItem } from "./project-item.component";

export class ProjectList
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

    setTimeout(() => {
      projectState.init();
    }, 0);
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
