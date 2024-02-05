import { Project, ProjectStatus } from "../models/project.model";

// Project State Management
type ExecuterFn<T> = (items: T[]) => void;

class State<T> {
  protected actionExecutors: ExecuterFn<T>[] = [];

  addListener(executorFn: ExecuterFn<T>) {
    this.actionExecutors.push(executorFn);
  }

  protected updateListeners(projects: T[]) {
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

export const projectState = ProjectState.getInstance(); // Singleton class