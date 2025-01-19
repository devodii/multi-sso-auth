import { DeepPartial } from 'typeorm';

export const sql = String.raw;

export type PartialOrPromise<T> = Partial<T> | Promise<Partial<T>>;

export const mergeProps = <T>(base: T, attrs: NoInfer<DeepPartial<T>>) => {
  return Object.assign<T, DeepPartial<T>>(base, attrs);
};
