import type { ActionEvent, ActionEventHandler } from "../types";

type EventType = "actiondown" | "actionup";

export class ActionEmitter<Action extends string> {
  private readonly handlers = new Map<EventType, Set<ActionEventHandler<Action>>>();

  on(type: EventType, handler: ActionEventHandler<Action>): () => void {
    const handlersForType = this.handlers.get(type) ?? new Set<ActionEventHandler<Action>>();
    handlersForType.add(handler);
    this.handlers.set(type, handlersForType);

    return () => {
      handlersForType.delete(handler);
    };
  }

  emit(type: EventType, event: ActionEvent<Action>): void {
    this.handlers.get(type)?.forEach((handler) => handler(event));
  }

  clear(): void {
    this.handlers.clear();
  }
}
