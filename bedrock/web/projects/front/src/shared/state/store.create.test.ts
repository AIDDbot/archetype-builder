import { expect, it, vi } from "vite-plus/test";
import { createStore, type Listener } from "#shared/state/store.create.ts";

it("reads the state that it was given last", () => {
  const store = createStore({ busy: false });
  expect(store.read()).toEqual({ busy: false });
  store.set({ busy: true });
  expect(store.read()).toEqual({ busy: true });
});

it("tells each listener of a change until it unsubscribes", () => {
  const store = createStore(0);
  const listener = vi.fn<Listener>();
  const unsubscribe = store.subscribe(listener);
  store.set(1);
  unsubscribe();
  store.set(2);
  expect(listener).toHaveBeenCalledTimes(1);
});
