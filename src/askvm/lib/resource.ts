import { AskCode } from '../../askcode';
import { asyncMap } from '../../utils';
import { Options as RunOptions, run, runUntyped } from './run';
import { any, empty, Type } from './type';
import { TypedValue, untyped } from './typed';

/**
 * Resource is the basic value wrapper in AskCode.
 */
export class Resource<T, A extends any[]> {
  // extends TypedValue ?
  readonly name!: string;
  readonly type!: Type<T>;
  readonly argsType!: Type<A>;

  async resolver(...argsOrParams: A): Promise<T> {
    throw new Error('This resource requires resolver to be defined');
  }

  async compute(options: RunOptions, code: AskCode, args?: A): Promise<T> {
    // TODO assert args according to argsType

    if (args) {
      return this.resolver(...(args.map(untyped) as A));
    }
    const params = await asyncMap(code.params ?? [], (param) =>
      runUntyped(options, param)
    );
    return this.resolver(...(params as any));
  }
}

const defaults: Pick<Resource<any, any>, 'type' | 'name' | 'argsType'> = {
  type: any,
  name: 'resource',
  argsType: empty, // TODO empty list
};

export function resource<T, A extends any[]>(
  options?: Partial<Resource<T, A>>
): Resource<T, A> {
  return Object.assign(
    new Resource(),
    defaults as Partial<Resource<T, A>>,
    options
  );
}

export type Resources = Record<string, Resource<any, any>>;