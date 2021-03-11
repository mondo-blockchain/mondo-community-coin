import deepEqual from "deep-equal";
import { createEvent, Domain, Event, sample, Store, Unit } from "effector";
import produce from "immer";

type Form<T extends object> = Partial<{ [K in keyof T]: T[K] | null }>;
type Diff<T extends object> = {
  original: Form<T>;
  diff: Form<T>;
};
export type ValueFormatter<T> = (value?: T | string | null) => string | null;
export type ValueParser<T> = (value?: T | string | null) => T;
export type ValueFilter<T> = (value?: T | string | null) => boolean;

export interface FormApi<T extends object> {
  onFieldChange: <K extends keyof T>(
    key: K,
    value: T[K] | string | null
  ) => void;
  reset(...triggers: Array<Unit<any>>): void;
  setFieldEvent: Event<{ key: keyof T; value: any }>;
  initEvent: Event<Form<T>>;
  resetFieldEvent: Event<keyof T>;
  resetEvent: Event<void>;
  lockEvent: Event<boolean>;
  form: {
    $raw: Store<Form<T>>;
    $parsed: Store<Form<T>>;
    $diff: Store<Diff<T>>;
    $hasChanges: Store<boolean>;
    $locked: Store<boolean>;
  };
}

type Filters<T> = Partial<{ [key in keyof T]: ValueFilter<any> }>;
type Parsers<T> = Partial<{ [key in keyof T]: ValueParser<any> }>;
type Formatters<T> = Partial<{ [key in keyof T]: ValueFormatter<any> }>;

function formApi<T extends object>(
  domain: Domain,
  initial?: Partial<T>,
  opts?: {
    name?: string;
    parsers?: Parsers<T>;
    filters?: Filters<T>;
    formatters?: Formatters<T>;
    diffIgnore?: Array<keyof T>;
  }
): FormApi<T> {
  const diffIgnore = opts?.diffIgnore || [];
  const filters: Filters<T> = opts?.filters || {};
  const formatters: Formatters<T> = opts?.formatters || {};
  const parsers: Parsers<T> = opts?.parsers || {};
  const setFieldEvent = createEvent<{ key: keyof T; value: any }>().filter({
    fn: ({ key, value }) => {
      const filter = filters[key];
      return !filter || filter(value);
    },
  });
  const initEvent = createEvent<Form<T>>();
  const lockEvent = createEvent<boolean>();
  const resetEvent = createEvent();
  const resetFieldEvent = createEvent<keyof T>();
  resetFieldEvent.watch((key) => setFieldEvent({ key, value: null }));
  const $locked = domain
    .createStore<boolean>(false)
    .on(lockEvent, (_, payload) => payload);
  const setFieldLockableEvent = sample({
    source: $locked,
    clock: setFieldEvent,
    fn: (locked, setField) =>
      (!locked ? setField : null) as { key: keyof T; value: any },
  }).filter({ fn: (setField) => !!setField });
  const $raw = domain
    .createStore<Form<T>>(initial || {}, {
      name: opts?.name,
    })
    .on(initEvent, (_, t) => {
      return Object.entries(t).reduce((agg, entry) => {
        const key = entry[0] as keyof T;
        const formatter = formatters[key];
        return {
          ...agg,
          [entry[0]]: formatter ? formatter(entry[1]) : entry[1],
        };
      }, {});
    })
    .on(setFieldLockableEvent, (s, { key, value }) =>
      produce(s, (draft: Form<T>) => {
        if (value !== null && value !== undefined) {
          draft[key] = value;
        } else {
          delete draft[key];
        }
      })
    )
    .reset(resetEvent);

  const $parsed = domain
    .createStore<Form<T>>(initial || {}, {
      name: `${opts?.name} parsed`,
    })
    .on(initEvent, (_, payload) => payload)
    .on(setFieldEvent, (parsed, { key, value }) =>
      produce(parsed, (draft: Form<T>) => {
        if (value !== null && value !== undefined) {
          const parser = parsers[key];
          if (parser) {
            const parsed = parser(value);
            draft[key] = parsed;
          } else {
            draft[key] = value;
          }
        } else {
          delete draft[key];
        }
      })
    )
    .reset(resetEvent);

  const $diff = domain
    .createStore<Diff<T>>(
      { original: {}, diff: {} },
      {
        name: `${opts?.name} diff`,
      }
    )
    .on(initEvent, (_, payload) => ({
      original: payload,
      diff: {},
    }))
    .on(
      sample({
        source: $parsed,
        clock: setFieldEvent,
        fn: (parsed, { key }) => ({ parsed, key }),
      }),
      (state, { parsed, key }) =>
        produce(state, (draft: Diff<T>) => {
          if (!diffIgnore.includes(key)) {
            if (
              !(
                (parsed[key] === undefined || null) &&
                (state.original[key] === undefined || null)
              ) &&
              !deepEqual(parsed[key], state.original[key], { strict: true })
            ) {
              draft.diff[key] = parsed[key];
            } else {
              delete draft.diff[key];
            }
          }
        })
    )
    .reset(resetEvent);

  const onFieldChange = (key: keyof T, value: any) =>
    setFieldEvent({ key, value });

  function reset(...triggers: Unit<any>[]) {
    $raw.reset(triggers);
    $parsed.reset(triggers);
    $diff.reset(triggers);
  }

  return {
    onFieldChange,
    setFieldEvent,
    resetFieldEvent,
    reset,
    resetEvent,
    initEvent,
    lockEvent,
    form: {
      $raw,
      $parsed,
      $diff,
      $hasChanges: $diff.map((state) => Object.keys(state.diff).length > 0),
      $locked,
    },
  };
}

export const formApis = {
  form: formApi,
};
