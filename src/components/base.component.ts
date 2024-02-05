// Component base class, generic since the hold el and element types would be different for different instances
export default abstract class Component<
  T extends HTMLElement,
  U extends HTMLElement
> {
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
