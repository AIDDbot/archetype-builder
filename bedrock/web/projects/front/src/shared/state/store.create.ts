export type Listener = () => void;

export type Unsubscribe = () => void;

export type Store<State> = {
  read: () => State;
  set: (next: State) => void;
  subscribe: (listener: Listener) => Unsubscribe;
};

export function createStore<State>(initial: State): Store<State> {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    read: (): State => state,
    set: (next: State): void => {
      state = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener: Listener): Unsubscribe => {
      listeners.add(listener);
      return (): void => {
        listeners.delete(listener);
      };
    },
  };
}
