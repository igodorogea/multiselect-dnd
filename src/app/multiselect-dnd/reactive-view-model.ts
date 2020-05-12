export type MutationFn<T> = (vm: T) => T;
export type UpdateVmFn<T> = (prevVm: T, mutationFn: MutationFn<T>) => T;

export function updateVmFn<T>(): UpdateVmFn<T> {
  return (prevVm, mutationFn) => mutationFn(prevVm);
}
