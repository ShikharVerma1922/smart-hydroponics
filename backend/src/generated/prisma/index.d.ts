
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Device
 * 
 */
export type Device = $Result.DefaultSelection<Prisma.$DevicePayload>
/**
 * Model CropRecipe
 * 
 */
export type CropRecipe = $Result.DefaultSelection<Prisma.$CropRecipePayload>
/**
 * Model DiagnosticReport
 * 
 */
export type DiagnosticReport = $Result.DefaultSelection<Prisma.$DiagnosticReportPayload>
/**
 * Model DosingLog
 * 
 */
export type DosingLog = $Result.DefaultSelection<Prisma.$DosingLogPayload>
/**
 * Model SystemAlert
 * 
 */
export type SystemAlert = $Result.DefaultSelection<Prisma.$SystemAlertPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const DosingSource: {
  AUTONOMOUS_EC: 'AUTONOMOUS_EC',
  AUTONOMOUS_PH: 'AUTONOMOUS_PH',
  ML_BIASED: 'ML_BIASED',
  MANUAL_OVERRIDE: 'MANUAL_OVERRIDE'
};

export type DosingSource = (typeof DosingSource)[keyof typeof DosingSource]


export const PumpType: {
  PH_DOWN: 'PH_DOWN',
  NUTRIENT_A: 'NUTRIENT_A',
  NUTRIENT_B: 'NUTRIENT_B'
};

export type PumpType = (typeof PumpType)[keyof typeof PumpType]


export const SeverityLevel: {
  NONE: 'NONE',
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export type SeverityLevel = (typeof SeverityLevel)[keyof typeof SeverityLevel]


export const AlertType: {
  ACIDIC_CRASH: 'ACIDIC_CRASH',
  OSMOTIC_TOXICITY: 'OSMOTIC_TOXICITY',
  LOW_WATER_LEVEL: 'LOW_WATER_LEVEL',
  BIOTIC_STRESS: 'BIOTIC_STRESS',
  DESYNC_WARNING: 'DESYNC_WARNING',
  SENSOR_FAULT: 'SENSOR_FAULT',
  ACTUATOR_COMMS_FAILURE: 'ACTUATOR_COMMS_FAILURE',
  PARTIAL_DOSE: 'PARTIAL_DOSE',
  DOSE_CAP_EXCEEDED: 'DOSE_CAP_EXCEEDED'
};

export type AlertType = (typeof AlertType)[keyof typeof AlertType]

}

export type DosingSource = $Enums.DosingSource

export const DosingSource: typeof $Enums.DosingSource

export type PumpType = $Enums.PumpType

export const PumpType: typeof $Enums.PumpType

export type SeverityLevel = $Enums.SeverityLevel

export const SeverityLevel: typeof $Enums.SeverityLevel

export type AlertType = $Enums.AlertType

export const AlertType: typeof $Enums.AlertType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Devices
 * const devices = await prisma.device.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Devices
   * const devices = await prisma.device.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.device`: Exposes CRUD operations for the **Device** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Devices
    * const devices = await prisma.device.findMany()
    * ```
    */
  get device(): Prisma.DeviceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cropRecipe`: Exposes CRUD operations for the **CropRecipe** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CropRecipes
    * const cropRecipes = await prisma.cropRecipe.findMany()
    * ```
    */
  get cropRecipe(): Prisma.CropRecipeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.diagnosticReport`: Exposes CRUD operations for the **DiagnosticReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DiagnosticReports
    * const diagnosticReports = await prisma.diagnosticReport.findMany()
    * ```
    */
  get diagnosticReport(): Prisma.DiagnosticReportDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dosingLog`: Exposes CRUD operations for the **DosingLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DosingLogs
    * const dosingLogs = await prisma.dosingLog.findMany()
    * ```
    */
  get dosingLog(): Prisma.DosingLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.systemAlert`: Exposes CRUD operations for the **SystemAlert** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemAlerts
    * const systemAlerts = await prisma.systemAlert.findMany()
    * ```
    */
  get systemAlert(): Prisma.SystemAlertDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.10.0
   * Query Engine version: 0edf323efd1d98336f3f0a68684b56f689b900d3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Device: 'Device',
    CropRecipe: 'CropRecipe',
    DiagnosticReport: 'DiagnosticReport',
    DosingLog: 'DosingLog',
    SystemAlert: 'SystemAlert'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "device" | "cropRecipe" | "diagnosticReport" | "dosingLog" | "systemAlert"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Device: {
        payload: Prisma.$DevicePayload<ExtArgs>
        fields: Prisma.DeviceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeviceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeviceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>
          }
          findFirst: {
            args: Prisma.DeviceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeviceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>
          }
          findMany: {
            args: Prisma.DeviceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>[]
          }
          create: {
            args: Prisma.DeviceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>
          }
          createMany: {
            args: Prisma.DeviceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeviceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>[]
          }
          delete: {
            args: Prisma.DeviceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>
          }
          update: {
            args: Prisma.DeviceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>
          }
          deleteMany: {
            args: Prisma.DeviceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeviceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DeviceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>[]
          }
          upsert: {
            args: Prisma.DeviceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>
          }
          aggregate: {
            args: Prisma.DeviceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDevice>
          }
          groupBy: {
            args: Prisma.DeviceGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeviceGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeviceCountArgs<ExtArgs>
            result: $Utils.Optional<DeviceCountAggregateOutputType> | number
          }
        }
      }
      CropRecipe: {
        payload: Prisma.$CropRecipePayload<ExtArgs>
        fields: Prisma.CropRecipeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CropRecipeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CropRecipeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>
          }
          findFirst: {
            args: Prisma.CropRecipeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CropRecipeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>
          }
          findMany: {
            args: Prisma.CropRecipeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>[]
          }
          create: {
            args: Prisma.CropRecipeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>
          }
          createMany: {
            args: Prisma.CropRecipeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CropRecipeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>[]
          }
          delete: {
            args: Prisma.CropRecipeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>
          }
          update: {
            args: Prisma.CropRecipeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>
          }
          deleteMany: {
            args: Prisma.CropRecipeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CropRecipeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CropRecipeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>[]
          }
          upsert: {
            args: Prisma.CropRecipeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CropRecipePayload>
          }
          aggregate: {
            args: Prisma.CropRecipeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCropRecipe>
          }
          groupBy: {
            args: Prisma.CropRecipeGroupByArgs<ExtArgs>
            result: $Utils.Optional<CropRecipeGroupByOutputType>[]
          }
          count: {
            args: Prisma.CropRecipeCountArgs<ExtArgs>
            result: $Utils.Optional<CropRecipeCountAggregateOutputType> | number
          }
        }
      }
      DiagnosticReport: {
        payload: Prisma.$DiagnosticReportPayload<ExtArgs>
        fields: Prisma.DiagnosticReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DiagnosticReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DiagnosticReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>
          }
          findFirst: {
            args: Prisma.DiagnosticReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DiagnosticReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>
          }
          findMany: {
            args: Prisma.DiagnosticReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>[]
          }
          create: {
            args: Prisma.DiagnosticReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>
          }
          createMany: {
            args: Prisma.DiagnosticReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DiagnosticReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>[]
          }
          delete: {
            args: Prisma.DiagnosticReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>
          }
          update: {
            args: Prisma.DiagnosticReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>
          }
          deleteMany: {
            args: Prisma.DiagnosticReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DiagnosticReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DiagnosticReportUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>[]
          }
          upsert: {
            args: Prisma.DiagnosticReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiagnosticReportPayload>
          }
          aggregate: {
            args: Prisma.DiagnosticReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiagnosticReport>
          }
          groupBy: {
            args: Prisma.DiagnosticReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<DiagnosticReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.DiagnosticReportCountArgs<ExtArgs>
            result: $Utils.Optional<DiagnosticReportCountAggregateOutputType> | number
          }
        }
      }
      DosingLog: {
        payload: Prisma.$DosingLogPayload<ExtArgs>
        fields: Prisma.DosingLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DosingLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DosingLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>
          }
          findFirst: {
            args: Prisma.DosingLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DosingLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>
          }
          findMany: {
            args: Prisma.DosingLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>[]
          }
          create: {
            args: Prisma.DosingLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>
          }
          createMany: {
            args: Prisma.DosingLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DosingLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>[]
          }
          delete: {
            args: Prisma.DosingLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>
          }
          update: {
            args: Prisma.DosingLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>
          }
          deleteMany: {
            args: Prisma.DosingLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DosingLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DosingLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>[]
          }
          upsert: {
            args: Prisma.DosingLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DosingLogPayload>
          }
          aggregate: {
            args: Prisma.DosingLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDosingLog>
          }
          groupBy: {
            args: Prisma.DosingLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<DosingLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.DosingLogCountArgs<ExtArgs>
            result: $Utils.Optional<DosingLogCountAggregateOutputType> | number
          }
        }
      }
      SystemAlert: {
        payload: Prisma.$SystemAlertPayload<ExtArgs>
        fields: Prisma.SystemAlertFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemAlertFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemAlertFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>
          }
          findFirst: {
            args: Prisma.SystemAlertFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemAlertFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>
          }
          findMany: {
            args: Prisma.SystemAlertFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>[]
          }
          create: {
            args: Prisma.SystemAlertCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>
          }
          createMany: {
            args: Prisma.SystemAlertCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SystemAlertCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>[]
          }
          delete: {
            args: Prisma.SystemAlertDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>
          }
          update: {
            args: Prisma.SystemAlertUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>
          }
          deleteMany: {
            args: Prisma.SystemAlertDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemAlertUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SystemAlertUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>[]
          }
          upsert: {
            args: Prisma.SystemAlertUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAlertPayload>
          }
          aggregate: {
            args: Prisma.SystemAlertAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemAlert>
          }
          groupBy: {
            args: Prisma.SystemAlertGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemAlertGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemAlertCountArgs<ExtArgs>
            result: $Utils.Optional<SystemAlertCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    device?: DeviceOmit
    cropRecipe?: CropRecipeOmit
    diagnosticReport?: DiagnosticReportOmit
    dosingLog?: DosingLogOmit
    systemAlert?: SystemAlertOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type DeviceCountOutputType
   */

  export type DeviceCountOutputType = {
    diagnosticReports: number
    dosingLogs: number
    alerts: number
  }

  export type DeviceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    diagnosticReports?: boolean | DeviceCountOutputTypeCountDiagnosticReportsArgs
    dosingLogs?: boolean | DeviceCountOutputTypeCountDosingLogsArgs
    alerts?: boolean | DeviceCountOutputTypeCountAlertsArgs
  }

  // Custom InputTypes
  /**
   * DeviceCountOutputType without action
   */
  export type DeviceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceCountOutputType
     */
    select?: DeviceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DeviceCountOutputType without action
   */
  export type DeviceCountOutputTypeCountDiagnosticReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiagnosticReportWhereInput
  }

  /**
   * DeviceCountOutputType without action
   */
  export type DeviceCountOutputTypeCountDosingLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DosingLogWhereInput
  }

  /**
   * DeviceCountOutputType without action
   */
  export type DeviceCountOutputTypeCountAlertsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemAlertWhereInput
  }


  /**
   * Count Type CropRecipeCountOutputType
   */

  export type CropRecipeCountOutputType = {
    assignedDevices: number
  }

  export type CropRecipeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assignedDevices?: boolean | CropRecipeCountOutputTypeCountAssignedDevicesArgs
  }

  // Custom InputTypes
  /**
   * CropRecipeCountOutputType without action
   */
  export type CropRecipeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipeCountOutputType
     */
    select?: CropRecipeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CropRecipeCountOutputType without action
   */
  export type CropRecipeCountOutputTypeCountAssignedDevicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeviceWhereInput
  }


  /**
   * Count Type DiagnosticReportCountOutputType
   */

  export type DiagnosticReportCountOutputType = {
    dosingEvents: number
  }

  export type DiagnosticReportCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dosingEvents?: boolean | DiagnosticReportCountOutputTypeCountDosingEventsArgs
  }

  // Custom InputTypes
  /**
   * DiagnosticReportCountOutputType without action
   */
  export type DiagnosticReportCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReportCountOutputType
     */
    select?: DiagnosticReportCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DiagnosticReportCountOutputType without action
   */
  export type DiagnosticReportCountOutputTypeCountDosingEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DosingLogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Device
   */

  export type AggregateDevice = {
    _count: DeviceCountAggregateOutputType | null
    _avg: DeviceAvgAggregateOutputType | null
    _sum: DeviceSumAggregateOutputType | null
    _min: DeviceMinAggregateOutputType | null
    _max: DeviceMaxAggregateOutputType | null
  }

  export type DeviceAvgAggregateOutputType = {
    circRunMin: number | null
    circRestMin: number | null
  }

  export type DeviceSumAggregateOutputType = {
    circRunMin: number | null
    circRestMin: number | null
  }

  export type DeviceMinAggregateOutputType = {
    id: string | null
    name: string | null
    location: string | null
    isOnline: boolean | null
    createdAt: Date | null
    activeRecipeId: string | null
    circulationMode: string | null
    circRunMin: number | null
    circRestMin: number | null
    circUpdatedAt: Date | null
  }

  export type DeviceMaxAggregateOutputType = {
    id: string | null
    name: string | null
    location: string | null
    isOnline: boolean | null
    createdAt: Date | null
    activeRecipeId: string | null
    circulationMode: string | null
    circRunMin: number | null
    circRestMin: number | null
    circUpdatedAt: Date | null
  }

  export type DeviceCountAggregateOutputType = {
    id: number
    name: number
    location: number
    isOnline: number
    createdAt: number
    activeRecipeId: number
    circulationMode: number
    circRunMin: number
    circRestMin: number
    circUpdatedAt: number
    _all: number
  }


  export type DeviceAvgAggregateInputType = {
    circRunMin?: true
    circRestMin?: true
  }

  export type DeviceSumAggregateInputType = {
    circRunMin?: true
    circRestMin?: true
  }

  export type DeviceMinAggregateInputType = {
    id?: true
    name?: true
    location?: true
    isOnline?: true
    createdAt?: true
    activeRecipeId?: true
    circulationMode?: true
    circRunMin?: true
    circRestMin?: true
    circUpdatedAt?: true
  }

  export type DeviceMaxAggregateInputType = {
    id?: true
    name?: true
    location?: true
    isOnline?: true
    createdAt?: true
    activeRecipeId?: true
    circulationMode?: true
    circRunMin?: true
    circRestMin?: true
    circUpdatedAt?: true
  }

  export type DeviceCountAggregateInputType = {
    id?: true
    name?: true
    location?: true
    isOnline?: true
    createdAt?: true
    activeRecipeId?: true
    circulationMode?: true
    circRunMin?: true
    circRestMin?: true
    circUpdatedAt?: true
    _all?: true
  }

  export type DeviceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Device to aggregate.
     */
    where?: DeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devices to fetch.
     */
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Devices
    **/
    _count?: true | DeviceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DeviceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DeviceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeviceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeviceMaxAggregateInputType
  }

  export type GetDeviceAggregateType<T extends DeviceAggregateArgs> = {
        [P in keyof T & keyof AggregateDevice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDevice[P]>
      : GetScalarType<T[P], AggregateDevice[P]>
  }




  export type DeviceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeviceWhereInput
    orderBy?: DeviceOrderByWithAggregationInput | DeviceOrderByWithAggregationInput[]
    by: DeviceScalarFieldEnum[] | DeviceScalarFieldEnum
    having?: DeviceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeviceCountAggregateInputType | true
    _avg?: DeviceAvgAggregateInputType
    _sum?: DeviceSumAggregateInputType
    _min?: DeviceMinAggregateInputType
    _max?: DeviceMaxAggregateInputType
  }

  export type DeviceGroupByOutputType = {
    id: string
    name: string
    location: string | null
    isOnline: boolean
    createdAt: Date
    activeRecipeId: string | null
    circulationMode: string
    circRunMin: number
    circRestMin: number
    circUpdatedAt: Date
    _count: DeviceCountAggregateOutputType | null
    _avg: DeviceAvgAggregateOutputType | null
    _sum: DeviceSumAggregateOutputType | null
    _min: DeviceMinAggregateOutputType | null
    _max: DeviceMaxAggregateOutputType | null
  }

  type GetDeviceGroupByPayload<T extends DeviceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeviceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeviceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeviceGroupByOutputType[P]>
            : GetScalarType<T[P], DeviceGroupByOutputType[P]>
        }
      >
    >


  export type DeviceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    isOnline?: boolean
    createdAt?: boolean
    activeRecipeId?: boolean
    circulationMode?: boolean
    circRunMin?: boolean
    circRestMin?: boolean
    circUpdatedAt?: boolean
    activeRecipe?: boolean | Device$activeRecipeArgs<ExtArgs>
    diagnosticReports?: boolean | Device$diagnosticReportsArgs<ExtArgs>
    dosingLogs?: boolean | Device$dosingLogsArgs<ExtArgs>
    alerts?: boolean | Device$alertsArgs<ExtArgs>
    _count?: boolean | DeviceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["device"]>

  export type DeviceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    isOnline?: boolean
    createdAt?: boolean
    activeRecipeId?: boolean
    circulationMode?: boolean
    circRunMin?: boolean
    circRestMin?: boolean
    circUpdatedAt?: boolean
    activeRecipe?: boolean | Device$activeRecipeArgs<ExtArgs>
  }, ExtArgs["result"]["device"]>

  export type DeviceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    isOnline?: boolean
    createdAt?: boolean
    activeRecipeId?: boolean
    circulationMode?: boolean
    circRunMin?: boolean
    circRestMin?: boolean
    circUpdatedAt?: boolean
    activeRecipe?: boolean | Device$activeRecipeArgs<ExtArgs>
  }, ExtArgs["result"]["device"]>

  export type DeviceSelectScalar = {
    id?: boolean
    name?: boolean
    location?: boolean
    isOnline?: boolean
    createdAt?: boolean
    activeRecipeId?: boolean
    circulationMode?: boolean
    circRunMin?: boolean
    circRestMin?: boolean
    circUpdatedAt?: boolean
  }

  export type DeviceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "location" | "isOnline" | "createdAt" | "activeRecipeId" | "circulationMode" | "circRunMin" | "circRestMin" | "circUpdatedAt", ExtArgs["result"]["device"]>
  export type DeviceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    activeRecipe?: boolean | Device$activeRecipeArgs<ExtArgs>
    diagnosticReports?: boolean | Device$diagnosticReportsArgs<ExtArgs>
    dosingLogs?: boolean | Device$dosingLogsArgs<ExtArgs>
    alerts?: boolean | Device$alertsArgs<ExtArgs>
    _count?: boolean | DeviceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DeviceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    activeRecipe?: boolean | Device$activeRecipeArgs<ExtArgs>
  }
  export type DeviceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    activeRecipe?: boolean | Device$activeRecipeArgs<ExtArgs>
  }

  export type $DevicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Device"
    objects: {
      activeRecipe: Prisma.$CropRecipePayload<ExtArgs> | null
      diagnosticReports: Prisma.$DiagnosticReportPayload<ExtArgs>[]
      dosingLogs: Prisma.$DosingLogPayload<ExtArgs>[]
      alerts: Prisma.$SystemAlertPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      location: string | null
      isOnline: boolean
      createdAt: Date
      activeRecipeId: string | null
      circulationMode: string
      circRunMin: number
      circRestMin: number
      circUpdatedAt: Date
    }, ExtArgs["result"]["device"]>
    composites: {}
  }

  type DeviceGetPayload<S extends boolean | null | undefined | DeviceDefaultArgs> = $Result.GetResult<Prisma.$DevicePayload, S>

  type DeviceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DeviceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DeviceCountAggregateInputType | true
    }

  export interface DeviceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Device'], meta: { name: 'Device' } }
    /**
     * Find zero or one Device that matches the filter.
     * @param {DeviceFindUniqueArgs} args - Arguments to find a Device
     * @example
     * // Get one Device
     * const device = await prisma.device.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeviceFindUniqueArgs>(args: SelectSubset<T, DeviceFindUniqueArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Device that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DeviceFindUniqueOrThrowArgs} args - Arguments to find a Device
     * @example
     * // Get one Device
     * const device = await prisma.device.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeviceFindUniqueOrThrowArgs>(args: SelectSubset<T, DeviceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Device that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFindFirstArgs} args - Arguments to find a Device
     * @example
     * // Get one Device
     * const device = await prisma.device.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeviceFindFirstArgs>(args?: SelectSubset<T, DeviceFindFirstArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Device that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFindFirstOrThrowArgs} args - Arguments to find a Device
     * @example
     * // Get one Device
     * const device = await prisma.device.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeviceFindFirstOrThrowArgs>(args?: SelectSubset<T, DeviceFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Devices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Devices
     * const devices = await prisma.device.findMany()
     * 
     * // Get first 10 Devices
     * const devices = await prisma.device.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deviceWithIdOnly = await prisma.device.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeviceFindManyArgs>(args?: SelectSubset<T, DeviceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Device.
     * @param {DeviceCreateArgs} args - Arguments to create a Device.
     * @example
     * // Create one Device
     * const Device = await prisma.device.create({
     *   data: {
     *     // ... data to create a Device
     *   }
     * })
     * 
     */
    create<T extends DeviceCreateArgs>(args: SelectSubset<T, DeviceCreateArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Devices.
     * @param {DeviceCreateManyArgs} args - Arguments to create many Devices.
     * @example
     * // Create many Devices
     * const device = await prisma.device.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeviceCreateManyArgs>(args?: SelectSubset<T, DeviceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Devices and returns the data saved in the database.
     * @param {DeviceCreateManyAndReturnArgs} args - Arguments to create many Devices.
     * @example
     * // Create many Devices
     * const device = await prisma.device.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Devices and only return the `id`
     * const deviceWithIdOnly = await prisma.device.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeviceCreateManyAndReturnArgs>(args?: SelectSubset<T, DeviceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Device.
     * @param {DeviceDeleteArgs} args - Arguments to delete one Device.
     * @example
     * // Delete one Device
     * const Device = await prisma.device.delete({
     *   where: {
     *     // ... filter to delete one Device
     *   }
     * })
     * 
     */
    delete<T extends DeviceDeleteArgs>(args: SelectSubset<T, DeviceDeleteArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Device.
     * @param {DeviceUpdateArgs} args - Arguments to update one Device.
     * @example
     * // Update one Device
     * const device = await prisma.device.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeviceUpdateArgs>(args: SelectSubset<T, DeviceUpdateArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Devices.
     * @param {DeviceDeleteManyArgs} args - Arguments to filter Devices to delete.
     * @example
     * // Delete a few Devices
     * const { count } = await prisma.device.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeviceDeleteManyArgs>(args?: SelectSubset<T, DeviceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Devices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Devices
     * const device = await prisma.device.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeviceUpdateManyArgs>(args: SelectSubset<T, DeviceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Devices and returns the data updated in the database.
     * @param {DeviceUpdateManyAndReturnArgs} args - Arguments to update many Devices.
     * @example
     * // Update many Devices
     * const device = await prisma.device.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Devices and only return the `id`
     * const deviceWithIdOnly = await prisma.device.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DeviceUpdateManyAndReturnArgs>(args: SelectSubset<T, DeviceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Device.
     * @param {DeviceUpsertArgs} args - Arguments to update or create a Device.
     * @example
     * // Update or create a Device
     * const device = await prisma.device.upsert({
     *   create: {
     *     // ... data to create a Device
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Device we want to update
     *   }
     * })
     */
    upsert<T extends DeviceUpsertArgs>(args: SelectSubset<T, DeviceUpsertArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Devices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceCountArgs} args - Arguments to filter Devices to count.
     * @example
     * // Count the number of Devices
     * const count = await prisma.device.count({
     *   where: {
     *     // ... the filter for the Devices we want to count
     *   }
     * })
    **/
    count<T extends DeviceCountArgs>(
      args?: Subset<T, DeviceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeviceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Device.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeviceAggregateArgs>(args: Subset<T, DeviceAggregateArgs>): Prisma.PrismaPromise<GetDeviceAggregateType<T>>

    /**
     * Group by Device.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeviceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeviceGroupByArgs['orderBy'] }
        : { orderBy?: DeviceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeviceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeviceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Device model
   */
  readonly fields: DeviceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Device.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeviceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    activeRecipe<T extends Device$activeRecipeArgs<ExtArgs> = {}>(args?: Subset<T, Device$activeRecipeArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    diagnosticReports<T extends Device$diagnosticReportsArgs<ExtArgs> = {}>(args?: Subset<T, Device$diagnosticReportsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    dosingLogs<T extends Device$dosingLogsArgs<ExtArgs> = {}>(args?: Subset<T, Device$dosingLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    alerts<T extends Device$alertsArgs<ExtArgs> = {}>(args?: Subset<T, Device$alertsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Device model
   */
  interface DeviceFieldRefs {
    readonly id: FieldRef<"Device", 'String'>
    readonly name: FieldRef<"Device", 'String'>
    readonly location: FieldRef<"Device", 'String'>
    readonly isOnline: FieldRef<"Device", 'Boolean'>
    readonly createdAt: FieldRef<"Device", 'DateTime'>
    readonly activeRecipeId: FieldRef<"Device", 'String'>
    readonly circulationMode: FieldRef<"Device", 'String'>
    readonly circRunMin: FieldRef<"Device", 'Int'>
    readonly circRestMin: FieldRef<"Device", 'Int'>
    readonly circUpdatedAt: FieldRef<"Device", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Device findUnique
   */
  export type DeviceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * Filter, which Device to fetch.
     */
    where: DeviceWhereUniqueInput
  }

  /**
   * Device findUniqueOrThrow
   */
  export type DeviceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * Filter, which Device to fetch.
     */
    where: DeviceWhereUniqueInput
  }

  /**
   * Device findFirst
   */
  export type DeviceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * Filter, which Device to fetch.
     */
    where?: DeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devices to fetch.
     */
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Devices.
     */
    cursor?: DeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Devices.
     */
    distinct?: DeviceScalarFieldEnum | DeviceScalarFieldEnum[]
  }

  /**
   * Device findFirstOrThrow
   */
  export type DeviceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * Filter, which Device to fetch.
     */
    where?: DeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devices to fetch.
     */
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Devices.
     */
    cursor?: DeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Devices.
     */
    distinct?: DeviceScalarFieldEnum | DeviceScalarFieldEnum[]
  }

  /**
   * Device findMany
   */
  export type DeviceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * Filter, which Devices to fetch.
     */
    where?: DeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devices to fetch.
     */
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Devices.
     */
    cursor?: DeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Devices.
     */
    distinct?: DeviceScalarFieldEnum | DeviceScalarFieldEnum[]
  }

  /**
   * Device create
   */
  export type DeviceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * The data needed to create a Device.
     */
    data: XOR<DeviceCreateInput, DeviceUncheckedCreateInput>
  }

  /**
   * Device createMany
   */
  export type DeviceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Devices.
     */
    data: DeviceCreateManyInput | DeviceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Device createManyAndReturn
   */
  export type DeviceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * The data used to create many Devices.
     */
    data: DeviceCreateManyInput | DeviceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Device update
   */
  export type DeviceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * The data needed to update a Device.
     */
    data: XOR<DeviceUpdateInput, DeviceUncheckedUpdateInput>
    /**
     * Choose, which Device to update.
     */
    where: DeviceWhereUniqueInput
  }

  /**
   * Device updateMany
   */
  export type DeviceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Devices.
     */
    data: XOR<DeviceUpdateManyMutationInput, DeviceUncheckedUpdateManyInput>
    /**
     * Filter which Devices to update
     */
    where?: DeviceWhereInput
    /**
     * Limit how many Devices to update.
     */
    limit?: number
  }

  /**
   * Device updateManyAndReturn
   */
  export type DeviceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * The data used to update Devices.
     */
    data: XOR<DeviceUpdateManyMutationInput, DeviceUncheckedUpdateManyInput>
    /**
     * Filter which Devices to update
     */
    where?: DeviceWhereInput
    /**
     * Limit how many Devices to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Device upsert
   */
  export type DeviceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * The filter to search for the Device to update in case it exists.
     */
    where: DeviceWhereUniqueInput
    /**
     * In case the Device found by the `where` argument doesn't exist, create a new Device with this data.
     */
    create: XOR<DeviceCreateInput, DeviceUncheckedCreateInput>
    /**
     * In case the Device was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeviceUpdateInput, DeviceUncheckedUpdateInput>
  }

  /**
   * Device delete
   */
  export type DeviceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    /**
     * Filter which Device to delete.
     */
    where: DeviceWhereUniqueInput
  }

  /**
   * Device deleteMany
   */
  export type DeviceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Devices to delete
     */
    where?: DeviceWhereInput
    /**
     * Limit how many Devices to delete.
     */
    limit?: number
  }

  /**
   * Device.activeRecipe
   */
  export type Device$activeRecipeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    where?: CropRecipeWhereInput
  }

  /**
   * Device.diagnosticReports
   */
  export type Device$diagnosticReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    where?: DiagnosticReportWhereInput
    orderBy?: DiagnosticReportOrderByWithRelationInput | DiagnosticReportOrderByWithRelationInput[]
    cursor?: DiagnosticReportWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DiagnosticReportScalarFieldEnum | DiagnosticReportScalarFieldEnum[]
  }

  /**
   * Device.dosingLogs
   */
  export type Device$dosingLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    where?: DosingLogWhereInput
    orderBy?: DosingLogOrderByWithRelationInput | DosingLogOrderByWithRelationInput[]
    cursor?: DosingLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DosingLogScalarFieldEnum | DosingLogScalarFieldEnum[]
  }

  /**
   * Device.alerts
   */
  export type Device$alertsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    where?: SystemAlertWhereInput
    orderBy?: SystemAlertOrderByWithRelationInput | SystemAlertOrderByWithRelationInput[]
    cursor?: SystemAlertWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SystemAlertScalarFieldEnum | SystemAlertScalarFieldEnum[]
  }

  /**
   * Device without action
   */
  export type DeviceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
  }


  /**
   * Model CropRecipe
   */

  export type AggregateCropRecipe = {
    _count: CropRecipeCountAggregateOutputType | null
    _avg: CropRecipeAvgAggregateOutputType | null
    _sum: CropRecipeSumAggregateOutputType | null
    _min: CropRecipeMinAggregateOutputType | null
    _max: CropRecipeMaxAggregateOutputType | null
  }

  export type CropRecipeAvgAggregateOutputType = {
    targetPhMin: number | null
    targetPhMax: number | null
    targetEcMin: number | null
    targetEcMax: number | null
    ecCeiling: number | null
    minWaterLevel: number | null
  }

  export type CropRecipeSumAggregateOutputType = {
    targetPhMin: number | null
    targetPhMax: number | null
    targetEcMin: number | null
    targetEcMax: number | null
    ecCeiling: number | null
    minWaterLevel: number | null
  }

  export type CropRecipeMinAggregateOutputType = {
    id: string | null
    cropName: string | null
    targetPhMin: number | null
    targetPhMax: number | null
    targetEcMin: number | null
    targetEcMax: number | null
    ecCeiling: number | null
    minWaterLevel: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CropRecipeMaxAggregateOutputType = {
    id: string | null
    cropName: string | null
    targetPhMin: number | null
    targetPhMax: number | null
    targetEcMin: number | null
    targetEcMax: number | null
    ecCeiling: number | null
    minWaterLevel: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CropRecipeCountAggregateOutputType = {
    id: number
    cropName: number
    targetPhMin: number
    targetPhMax: number
    targetEcMin: number
    targetEcMax: number
    ecCeiling: number
    minWaterLevel: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CropRecipeAvgAggregateInputType = {
    targetPhMin?: true
    targetPhMax?: true
    targetEcMin?: true
    targetEcMax?: true
    ecCeiling?: true
    minWaterLevel?: true
  }

  export type CropRecipeSumAggregateInputType = {
    targetPhMin?: true
    targetPhMax?: true
    targetEcMin?: true
    targetEcMax?: true
    ecCeiling?: true
    minWaterLevel?: true
  }

  export type CropRecipeMinAggregateInputType = {
    id?: true
    cropName?: true
    targetPhMin?: true
    targetPhMax?: true
    targetEcMin?: true
    targetEcMax?: true
    ecCeiling?: true
    minWaterLevel?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CropRecipeMaxAggregateInputType = {
    id?: true
    cropName?: true
    targetPhMin?: true
    targetPhMax?: true
    targetEcMin?: true
    targetEcMax?: true
    ecCeiling?: true
    minWaterLevel?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CropRecipeCountAggregateInputType = {
    id?: true
    cropName?: true
    targetPhMin?: true
    targetPhMax?: true
    targetEcMin?: true
    targetEcMax?: true
    ecCeiling?: true
    minWaterLevel?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CropRecipeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CropRecipe to aggregate.
     */
    where?: CropRecipeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CropRecipes to fetch.
     */
    orderBy?: CropRecipeOrderByWithRelationInput | CropRecipeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CropRecipeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CropRecipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CropRecipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CropRecipes
    **/
    _count?: true | CropRecipeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CropRecipeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CropRecipeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CropRecipeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CropRecipeMaxAggregateInputType
  }

  export type GetCropRecipeAggregateType<T extends CropRecipeAggregateArgs> = {
        [P in keyof T & keyof AggregateCropRecipe]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCropRecipe[P]>
      : GetScalarType<T[P], AggregateCropRecipe[P]>
  }




  export type CropRecipeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CropRecipeWhereInput
    orderBy?: CropRecipeOrderByWithAggregationInput | CropRecipeOrderByWithAggregationInput[]
    by: CropRecipeScalarFieldEnum[] | CropRecipeScalarFieldEnum
    having?: CropRecipeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CropRecipeCountAggregateInputType | true
    _avg?: CropRecipeAvgAggregateInputType
    _sum?: CropRecipeSumAggregateInputType
    _min?: CropRecipeMinAggregateInputType
    _max?: CropRecipeMaxAggregateInputType
  }

  export type CropRecipeGroupByOutputType = {
    id: string
    cropName: string
    targetPhMin: number
    targetPhMax: number
    targetEcMin: number
    targetEcMax: number
    ecCeiling: number
    minWaterLevel: number
    createdAt: Date
    updatedAt: Date
    _count: CropRecipeCountAggregateOutputType | null
    _avg: CropRecipeAvgAggregateOutputType | null
    _sum: CropRecipeSumAggregateOutputType | null
    _min: CropRecipeMinAggregateOutputType | null
    _max: CropRecipeMaxAggregateOutputType | null
  }

  type GetCropRecipeGroupByPayload<T extends CropRecipeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CropRecipeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CropRecipeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CropRecipeGroupByOutputType[P]>
            : GetScalarType<T[P], CropRecipeGroupByOutputType[P]>
        }
      >
    >


  export type CropRecipeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cropName?: boolean
    targetPhMin?: boolean
    targetPhMax?: boolean
    targetEcMin?: boolean
    targetEcMax?: boolean
    ecCeiling?: boolean
    minWaterLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assignedDevices?: boolean | CropRecipe$assignedDevicesArgs<ExtArgs>
    _count?: boolean | CropRecipeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cropRecipe"]>

  export type CropRecipeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cropName?: boolean
    targetPhMin?: boolean
    targetPhMax?: boolean
    targetEcMin?: boolean
    targetEcMax?: boolean
    ecCeiling?: boolean
    minWaterLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cropRecipe"]>

  export type CropRecipeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cropName?: boolean
    targetPhMin?: boolean
    targetPhMax?: boolean
    targetEcMin?: boolean
    targetEcMax?: boolean
    ecCeiling?: boolean
    minWaterLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cropRecipe"]>

  export type CropRecipeSelectScalar = {
    id?: boolean
    cropName?: boolean
    targetPhMin?: boolean
    targetPhMax?: boolean
    targetEcMin?: boolean
    targetEcMax?: boolean
    ecCeiling?: boolean
    minWaterLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CropRecipeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cropName" | "targetPhMin" | "targetPhMax" | "targetEcMin" | "targetEcMax" | "ecCeiling" | "minWaterLevel" | "createdAt" | "updatedAt", ExtArgs["result"]["cropRecipe"]>
  export type CropRecipeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assignedDevices?: boolean | CropRecipe$assignedDevicesArgs<ExtArgs>
    _count?: boolean | CropRecipeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CropRecipeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CropRecipeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CropRecipePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CropRecipe"
    objects: {
      assignedDevices: Prisma.$DevicePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cropName: string
      targetPhMin: number
      targetPhMax: number
      targetEcMin: number
      targetEcMax: number
      ecCeiling: number
      minWaterLevel: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cropRecipe"]>
    composites: {}
  }

  type CropRecipeGetPayload<S extends boolean | null | undefined | CropRecipeDefaultArgs> = $Result.GetResult<Prisma.$CropRecipePayload, S>

  type CropRecipeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CropRecipeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CropRecipeCountAggregateInputType | true
    }

  export interface CropRecipeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CropRecipe'], meta: { name: 'CropRecipe' } }
    /**
     * Find zero or one CropRecipe that matches the filter.
     * @param {CropRecipeFindUniqueArgs} args - Arguments to find a CropRecipe
     * @example
     * // Get one CropRecipe
     * const cropRecipe = await prisma.cropRecipe.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CropRecipeFindUniqueArgs>(args: SelectSubset<T, CropRecipeFindUniqueArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CropRecipe that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CropRecipeFindUniqueOrThrowArgs} args - Arguments to find a CropRecipe
     * @example
     * // Get one CropRecipe
     * const cropRecipe = await prisma.cropRecipe.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CropRecipeFindUniqueOrThrowArgs>(args: SelectSubset<T, CropRecipeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CropRecipe that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CropRecipeFindFirstArgs} args - Arguments to find a CropRecipe
     * @example
     * // Get one CropRecipe
     * const cropRecipe = await prisma.cropRecipe.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CropRecipeFindFirstArgs>(args?: SelectSubset<T, CropRecipeFindFirstArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CropRecipe that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CropRecipeFindFirstOrThrowArgs} args - Arguments to find a CropRecipe
     * @example
     * // Get one CropRecipe
     * const cropRecipe = await prisma.cropRecipe.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CropRecipeFindFirstOrThrowArgs>(args?: SelectSubset<T, CropRecipeFindFirstOrThrowArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CropRecipes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CropRecipeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CropRecipes
     * const cropRecipes = await prisma.cropRecipe.findMany()
     * 
     * // Get first 10 CropRecipes
     * const cropRecipes = await prisma.cropRecipe.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cropRecipeWithIdOnly = await prisma.cropRecipe.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CropRecipeFindManyArgs>(args?: SelectSubset<T, CropRecipeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CropRecipe.
     * @param {CropRecipeCreateArgs} args - Arguments to create a CropRecipe.
     * @example
     * // Create one CropRecipe
     * const CropRecipe = await prisma.cropRecipe.create({
     *   data: {
     *     // ... data to create a CropRecipe
     *   }
     * })
     * 
     */
    create<T extends CropRecipeCreateArgs>(args: SelectSubset<T, CropRecipeCreateArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CropRecipes.
     * @param {CropRecipeCreateManyArgs} args - Arguments to create many CropRecipes.
     * @example
     * // Create many CropRecipes
     * const cropRecipe = await prisma.cropRecipe.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CropRecipeCreateManyArgs>(args?: SelectSubset<T, CropRecipeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CropRecipes and returns the data saved in the database.
     * @param {CropRecipeCreateManyAndReturnArgs} args - Arguments to create many CropRecipes.
     * @example
     * // Create many CropRecipes
     * const cropRecipe = await prisma.cropRecipe.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CropRecipes and only return the `id`
     * const cropRecipeWithIdOnly = await prisma.cropRecipe.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CropRecipeCreateManyAndReturnArgs>(args?: SelectSubset<T, CropRecipeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CropRecipe.
     * @param {CropRecipeDeleteArgs} args - Arguments to delete one CropRecipe.
     * @example
     * // Delete one CropRecipe
     * const CropRecipe = await prisma.cropRecipe.delete({
     *   where: {
     *     // ... filter to delete one CropRecipe
     *   }
     * })
     * 
     */
    delete<T extends CropRecipeDeleteArgs>(args: SelectSubset<T, CropRecipeDeleteArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CropRecipe.
     * @param {CropRecipeUpdateArgs} args - Arguments to update one CropRecipe.
     * @example
     * // Update one CropRecipe
     * const cropRecipe = await prisma.cropRecipe.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CropRecipeUpdateArgs>(args: SelectSubset<T, CropRecipeUpdateArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CropRecipes.
     * @param {CropRecipeDeleteManyArgs} args - Arguments to filter CropRecipes to delete.
     * @example
     * // Delete a few CropRecipes
     * const { count } = await prisma.cropRecipe.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CropRecipeDeleteManyArgs>(args?: SelectSubset<T, CropRecipeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CropRecipes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CropRecipeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CropRecipes
     * const cropRecipe = await prisma.cropRecipe.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CropRecipeUpdateManyArgs>(args: SelectSubset<T, CropRecipeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CropRecipes and returns the data updated in the database.
     * @param {CropRecipeUpdateManyAndReturnArgs} args - Arguments to update many CropRecipes.
     * @example
     * // Update many CropRecipes
     * const cropRecipe = await prisma.cropRecipe.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CropRecipes and only return the `id`
     * const cropRecipeWithIdOnly = await prisma.cropRecipe.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CropRecipeUpdateManyAndReturnArgs>(args: SelectSubset<T, CropRecipeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CropRecipe.
     * @param {CropRecipeUpsertArgs} args - Arguments to update or create a CropRecipe.
     * @example
     * // Update or create a CropRecipe
     * const cropRecipe = await prisma.cropRecipe.upsert({
     *   create: {
     *     // ... data to create a CropRecipe
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CropRecipe we want to update
     *   }
     * })
     */
    upsert<T extends CropRecipeUpsertArgs>(args: SelectSubset<T, CropRecipeUpsertArgs<ExtArgs>>): Prisma__CropRecipeClient<$Result.GetResult<Prisma.$CropRecipePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CropRecipes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CropRecipeCountArgs} args - Arguments to filter CropRecipes to count.
     * @example
     * // Count the number of CropRecipes
     * const count = await prisma.cropRecipe.count({
     *   where: {
     *     // ... the filter for the CropRecipes we want to count
     *   }
     * })
    **/
    count<T extends CropRecipeCountArgs>(
      args?: Subset<T, CropRecipeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CropRecipeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CropRecipe.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CropRecipeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CropRecipeAggregateArgs>(args: Subset<T, CropRecipeAggregateArgs>): Prisma.PrismaPromise<GetCropRecipeAggregateType<T>>

    /**
     * Group by CropRecipe.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CropRecipeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CropRecipeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CropRecipeGroupByArgs['orderBy'] }
        : { orderBy?: CropRecipeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CropRecipeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCropRecipeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CropRecipe model
   */
  readonly fields: CropRecipeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CropRecipe.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CropRecipeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    assignedDevices<T extends CropRecipe$assignedDevicesArgs<ExtArgs> = {}>(args?: Subset<T, CropRecipe$assignedDevicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CropRecipe model
   */
  interface CropRecipeFieldRefs {
    readonly id: FieldRef<"CropRecipe", 'String'>
    readonly cropName: FieldRef<"CropRecipe", 'String'>
    readonly targetPhMin: FieldRef<"CropRecipe", 'Float'>
    readonly targetPhMax: FieldRef<"CropRecipe", 'Float'>
    readonly targetEcMin: FieldRef<"CropRecipe", 'Float'>
    readonly targetEcMax: FieldRef<"CropRecipe", 'Float'>
    readonly ecCeiling: FieldRef<"CropRecipe", 'Float'>
    readonly minWaterLevel: FieldRef<"CropRecipe", 'Float'>
    readonly createdAt: FieldRef<"CropRecipe", 'DateTime'>
    readonly updatedAt: FieldRef<"CropRecipe", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CropRecipe findUnique
   */
  export type CropRecipeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * Filter, which CropRecipe to fetch.
     */
    where: CropRecipeWhereUniqueInput
  }

  /**
   * CropRecipe findUniqueOrThrow
   */
  export type CropRecipeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * Filter, which CropRecipe to fetch.
     */
    where: CropRecipeWhereUniqueInput
  }

  /**
   * CropRecipe findFirst
   */
  export type CropRecipeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * Filter, which CropRecipe to fetch.
     */
    where?: CropRecipeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CropRecipes to fetch.
     */
    orderBy?: CropRecipeOrderByWithRelationInput | CropRecipeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CropRecipes.
     */
    cursor?: CropRecipeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CropRecipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CropRecipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CropRecipes.
     */
    distinct?: CropRecipeScalarFieldEnum | CropRecipeScalarFieldEnum[]
  }

  /**
   * CropRecipe findFirstOrThrow
   */
  export type CropRecipeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * Filter, which CropRecipe to fetch.
     */
    where?: CropRecipeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CropRecipes to fetch.
     */
    orderBy?: CropRecipeOrderByWithRelationInput | CropRecipeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CropRecipes.
     */
    cursor?: CropRecipeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CropRecipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CropRecipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CropRecipes.
     */
    distinct?: CropRecipeScalarFieldEnum | CropRecipeScalarFieldEnum[]
  }

  /**
   * CropRecipe findMany
   */
  export type CropRecipeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * Filter, which CropRecipes to fetch.
     */
    where?: CropRecipeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CropRecipes to fetch.
     */
    orderBy?: CropRecipeOrderByWithRelationInput | CropRecipeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CropRecipes.
     */
    cursor?: CropRecipeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CropRecipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CropRecipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CropRecipes.
     */
    distinct?: CropRecipeScalarFieldEnum | CropRecipeScalarFieldEnum[]
  }

  /**
   * CropRecipe create
   */
  export type CropRecipeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * The data needed to create a CropRecipe.
     */
    data: XOR<CropRecipeCreateInput, CropRecipeUncheckedCreateInput>
  }

  /**
   * CropRecipe createMany
   */
  export type CropRecipeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CropRecipes.
     */
    data: CropRecipeCreateManyInput | CropRecipeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CropRecipe createManyAndReturn
   */
  export type CropRecipeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * The data used to create many CropRecipes.
     */
    data: CropRecipeCreateManyInput | CropRecipeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CropRecipe update
   */
  export type CropRecipeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * The data needed to update a CropRecipe.
     */
    data: XOR<CropRecipeUpdateInput, CropRecipeUncheckedUpdateInput>
    /**
     * Choose, which CropRecipe to update.
     */
    where: CropRecipeWhereUniqueInput
  }

  /**
   * CropRecipe updateMany
   */
  export type CropRecipeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CropRecipes.
     */
    data: XOR<CropRecipeUpdateManyMutationInput, CropRecipeUncheckedUpdateManyInput>
    /**
     * Filter which CropRecipes to update
     */
    where?: CropRecipeWhereInput
    /**
     * Limit how many CropRecipes to update.
     */
    limit?: number
  }

  /**
   * CropRecipe updateManyAndReturn
   */
  export type CropRecipeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * The data used to update CropRecipes.
     */
    data: XOR<CropRecipeUpdateManyMutationInput, CropRecipeUncheckedUpdateManyInput>
    /**
     * Filter which CropRecipes to update
     */
    where?: CropRecipeWhereInput
    /**
     * Limit how many CropRecipes to update.
     */
    limit?: number
  }

  /**
   * CropRecipe upsert
   */
  export type CropRecipeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * The filter to search for the CropRecipe to update in case it exists.
     */
    where: CropRecipeWhereUniqueInput
    /**
     * In case the CropRecipe found by the `where` argument doesn't exist, create a new CropRecipe with this data.
     */
    create: XOR<CropRecipeCreateInput, CropRecipeUncheckedCreateInput>
    /**
     * In case the CropRecipe was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CropRecipeUpdateInput, CropRecipeUncheckedUpdateInput>
  }

  /**
   * CropRecipe delete
   */
  export type CropRecipeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
    /**
     * Filter which CropRecipe to delete.
     */
    where: CropRecipeWhereUniqueInput
  }

  /**
   * CropRecipe deleteMany
   */
  export type CropRecipeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CropRecipes to delete
     */
    where?: CropRecipeWhereInput
    /**
     * Limit how many CropRecipes to delete.
     */
    limit?: number
  }

  /**
   * CropRecipe.assignedDevices
   */
  export type CropRecipe$assignedDevicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Device
     */
    omit?: DeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null
    where?: DeviceWhereInput
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[]
    cursor?: DeviceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DeviceScalarFieldEnum | DeviceScalarFieldEnum[]
  }

  /**
   * CropRecipe without action
   */
  export type CropRecipeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CropRecipe
     */
    select?: CropRecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CropRecipe
     */
    omit?: CropRecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CropRecipeInclude<ExtArgs> | null
  }


  /**
   * Model DiagnosticReport
   */

  export type AggregateDiagnosticReport = {
    _count: DiagnosticReportCountAggregateOutputType | null
    _avg: DiagnosticReportAvgAggregateOutputType | null
    _sum: DiagnosticReportSumAggregateOutputType | null
    _min: DiagnosticReportMinAggregateOutputType | null
    _max: DiagnosticReportMaxAggregateOutputType | null
  }

  export type DiagnosticReportAvgAggregateOutputType = {
    confidence: number | null
  }

  export type DiagnosticReportSumAggregateOutputType = {
    confidence: number | null
  }

  export type DiagnosticReportMinAggregateOutputType = {
    id: string | null
    deviceId: string | null
    timestamp: Date | null
    imageUrl: string | null
    primaryLabel: string | null
    confidence: number | null
    severity: $Enums.SeverityLevel | null
    actionTaken: string | null
    cooldownActiveTill: Date | null
  }

  export type DiagnosticReportMaxAggregateOutputType = {
    id: string | null
    deviceId: string | null
    timestamp: Date | null
    imageUrl: string | null
    primaryLabel: string | null
    confidence: number | null
    severity: $Enums.SeverityLevel | null
    actionTaken: string | null
    cooldownActiveTill: Date | null
  }

  export type DiagnosticReportCountAggregateOutputType = {
    id: number
    deviceId: number
    timestamp: number
    imageUrl: number
    primaryLabel: number
    confidence: number
    severity: number
    classProbabilities: number
    actionTaken: number
    cooldownActiveTill: number
    _all: number
  }


  export type DiagnosticReportAvgAggregateInputType = {
    confidence?: true
  }

  export type DiagnosticReportSumAggregateInputType = {
    confidence?: true
  }

  export type DiagnosticReportMinAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    imageUrl?: true
    primaryLabel?: true
    confidence?: true
    severity?: true
    actionTaken?: true
    cooldownActiveTill?: true
  }

  export type DiagnosticReportMaxAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    imageUrl?: true
    primaryLabel?: true
    confidence?: true
    severity?: true
    actionTaken?: true
    cooldownActiveTill?: true
  }

  export type DiagnosticReportCountAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    imageUrl?: true
    primaryLabel?: true
    confidence?: true
    severity?: true
    classProbabilities?: true
    actionTaken?: true
    cooldownActiveTill?: true
    _all?: true
  }

  export type DiagnosticReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DiagnosticReport to aggregate.
     */
    where?: DiagnosticReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiagnosticReports to fetch.
     */
    orderBy?: DiagnosticReportOrderByWithRelationInput | DiagnosticReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DiagnosticReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiagnosticReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiagnosticReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DiagnosticReports
    **/
    _count?: true | DiagnosticReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DiagnosticReportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DiagnosticReportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DiagnosticReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DiagnosticReportMaxAggregateInputType
  }

  export type GetDiagnosticReportAggregateType<T extends DiagnosticReportAggregateArgs> = {
        [P in keyof T & keyof AggregateDiagnosticReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiagnosticReport[P]>
      : GetScalarType<T[P], AggregateDiagnosticReport[P]>
  }




  export type DiagnosticReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiagnosticReportWhereInput
    orderBy?: DiagnosticReportOrderByWithAggregationInput | DiagnosticReportOrderByWithAggregationInput[]
    by: DiagnosticReportScalarFieldEnum[] | DiagnosticReportScalarFieldEnum
    having?: DiagnosticReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DiagnosticReportCountAggregateInputType | true
    _avg?: DiagnosticReportAvgAggregateInputType
    _sum?: DiagnosticReportSumAggregateInputType
    _min?: DiagnosticReportMinAggregateInputType
    _max?: DiagnosticReportMaxAggregateInputType
  }

  export type DiagnosticReportGroupByOutputType = {
    id: string
    deviceId: string
    timestamp: Date
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity: $Enums.SeverityLevel
    classProbabilities: JsonValue
    actionTaken: string | null
    cooldownActiveTill: Date | null
    _count: DiagnosticReportCountAggregateOutputType | null
    _avg: DiagnosticReportAvgAggregateOutputType | null
    _sum: DiagnosticReportSumAggregateOutputType | null
    _min: DiagnosticReportMinAggregateOutputType | null
    _max: DiagnosticReportMaxAggregateOutputType | null
  }

  type GetDiagnosticReportGroupByPayload<T extends DiagnosticReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DiagnosticReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DiagnosticReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DiagnosticReportGroupByOutputType[P]>
            : GetScalarType<T[P], DiagnosticReportGroupByOutputType[P]>
        }
      >
    >


  export type DiagnosticReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    imageUrl?: boolean
    primaryLabel?: boolean
    confidence?: boolean
    severity?: boolean
    classProbabilities?: boolean
    actionTaken?: boolean
    cooldownActiveTill?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
    dosingEvents?: boolean | DiagnosticReport$dosingEventsArgs<ExtArgs>
    _count?: boolean | DiagnosticReportCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["diagnosticReport"]>

  export type DiagnosticReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    imageUrl?: boolean
    primaryLabel?: boolean
    confidence?: boolean
    severity?: boolean
    classProbabilities?: boolean
    actionTaken?: boolean
    cooldownActiveTill?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["diagnosticReport"]>

  export type DiagnosticReportSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    imageUrl?: boolean
    primaryLabel?: boolean
    confidence?: boolean
    severity?: boolean
    classProbabilities?: boolean
    actionTaken?: boolean
    cooldownActiveTill?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["diagnosticReport"]>

  export type DiagnosticReportSelectScalar = {
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    imageUrl?: boolean
    primaryLabel?: boolean
    confidence?: boolean
    severity?: boolean
    classProbabilities?: boolean
    actionTaken?: boolean
    cooldownActiveTill?: boolean
  }

  export type DiagnosticReportOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "deviceId" | "timestamp" | "imageUrl" | "primaryLabel" | "confidence" | "severity" | "classProbabilities" | "actionTaken" | "cooldownActiveTill", ExtArgs["result"]["diagnosticReport"]>
  export type DiagnosticReportInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
    dosingEvents?: boolean | DiagnosticReport$dosingEventsArgs<ExtArgs>
    _count?: boolean | DiagnosticReportCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DiagnosticReportIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }
  export type DiagnosticReportIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }

  export type $DiagnosticReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DiagnosticReport"
    objects: {
      device: Prisma.$DevicePayload<ExtArgs>
      dosingEvents: Prisma.$DosingLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      deviceId: string
      timestamp: Date
      imageUrl: string
      primaryLabel: string
      confidence: number
      severity: $Enums.SeverityLevel
      classProbabilities: Prisma.JsonValue
      actionTaken: string | null
      cooldownActiveTill: Date | null
    }, ExtArgs["result"]["diagnosticReport"]>
    composites: {}
  }

  type DiagnosticReportGetPayload<S extends boolean | null | undefined | DiagnosticReportDefaultArgs> = $Result.GetResult<Prisma.$DiagnosticReportPayload, S>

  type DiagnosticReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DiagnosticReportFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DiagnosticReportCountAggregateInputType | true
    }

  export interface DiagnosticReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DiagnosticReport'], meta: { name: 'DiagnosticReport' } }
    /**
     * Find zero or one DiagnosticReport that matches the filter.
     * @param {DiagnosticReportFindUniqueArgs} args - Arguments to find a DiagnosticReport
     * @example
     * // Get one DiagnosticReport
     * const diagnosticReport = await prisma.diagnosticReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DiagnosticReportFindUniqueArgs>(args: SelectSubset<T, DiagnosticReportFindUniqueArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DiagnosticReport that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DiagnosticReportFindUniqueOrThrowArgs} args - Arguments to find a DiagnosticReport
     * @example
     * // Get one DiagnosticReport
     * const diagnosticReport = await prisma.diagnosticReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DiagnosticReportFindUniqueOrThrowArgs>(args: SelectSubset<T, DiagnosticReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DiagnosticReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiagnosticReportFindFirstArgs} args - Arguments to find a DiagnosticReport
     * @example
     * // Get one DiagnosticReport
     * const diagnosticReport = await prisma.diagnosticReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DiagnosticReportFindFirstArgs>(args?: SelectSubset<T, DiagnosticReportFindFirstArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DiagnosticReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiagnosticReportFindFirstOrThrowArgs} args - Arguments to find a DiagnosticReport
     * @example
     * // Get one DiagnosticReport
     * const diagnosticReport = await prisma.diagnosticReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DiagnosticReportFindFirstOrThrowArgs>(args?: SelectSubset<T, DiagnosticReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DiagnosticReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiagnosticReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DiagnosticReports
     * const diagnosticReports = await prisma.diagnosticReport.findMany()
     * 
     * // Get first 10 DiagnosticReports
     * const diagnosticReports = await prisma.diagnosticReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const diagnosticReportWithIdOnly = await prisma.diagnosticReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DiagnosticReportFindManyArgs>(args?: SelectSubset<T, DiagnosticReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DiagnosticReport.
     * @param {DiagnosticReportCreateArgs} args - Arguments to create a DiagnosticReport.
     * @example
     * // Create one DiagnosticReport
     * const DiagnosticReport = await prisma.diagnosticReport.create({
     *   data: {
     *     // ... data to create a DiagnosticReport
     *   }
     * })
     * 
     */
    create<T extends DiagnosticReportCreateArgs>(args: SelectSubset<T, DiagnosticReportCreateArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DiagnosticReports.
     * @param {DiagnosticReportCreateManyArgs} args - Arguments to create many DiagnosticReports.
     * @example
     * // Create many DiagnosticReports
     * const diagnosticReport = await prisma.diagnosticReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DiagnosticReportCreateManyArgs>(args?: SelectSubset<T, DiagnosticReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DiagnosticReports and returns the data saved in the database.
     * @param {DiagnosticReportCreateManyAndReturnArgs} args - Arguments to create many DiagnosticReports.
     * @example
     * // Create many DiagnosticReports
     * const diagnosticReport = await prisma.diagnosticReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DiagnosticReports and only return the `id`
     * const diagnosticReportWithIdOnly = await prisma.diagnosticReport.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DiagnosticReportCreateManyAndReturnArgs>(args?: SelectSubset<T, DiagnosticReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DiagnosticReport.
     * @param {DiagnosticReportDeleteArgs} args - Arguments to delete one DiagnosticReport.
     * @example
     * // Delete one DiagnosticReport
     * const DiagnosticReport = await prisma.diagnosticReport.delete({
     *   where: {
     *     // ... filter to delete one DiagnosticReport
     *   }
     * })
     * 
     */
    delete<T extends DiagnosticReportDeleteArgs>(args: SelectSubset<T, DiagnosticReportDeleteArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DiagnosticReport.
     * @param {DiagnosticReportUpdateArgs} args - Arguments to update one DiagnosticReport.
     * @example
     * // Update one DiagnosticReport
     * const diagnosticReport = await prisma.diagnosticReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DiagnosticReportUpdateArgs>(args: SelectSubset<T, DiagnosticReportUpdateArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DiagnosticReports.
     * @param {DiagnosticReportDeleteManyArgs} args - Arguments to filter DiagnosticReports to delete.
     * @example
     * // Delete a few DiagnosticReports
     * const { count } = await prisma.diagnosticReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DiagnosticReportDeleteManyArgs>(args?: SelectSubset<T, DiagnosticReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DiagnosticReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiagnosticReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DiagnosticReports
     * const diagnosticReport = await prisma.diagnosticReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DiagnosticReportUpdateManyArgs>(args: SelectSubset<T, DiagnosticReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DiagnosticReports and returns the data updated in the database.
     * @param {DiagnosticReportUpdateManyAndReturnArgs} args - Arguments to update many DiagnosticReports.
     * @example
     * // Update many DiagnosticReports
     * const diagnosticReport = await prisma.diagnosticReport.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DiagnosticReports and only return the `id`
     * const diagnosticReportWithIdOnly = await prisma.diagnosticReport.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DiagnosticReportUpdateManyAndReturnArgs>(args: SelectSubset<T, DiagnosticReportUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DiagnosticReport.
     * @param {DiagnosticReportUpsertArgs} args - Arguments to update or create a DiagnosticReport.
     * @example
     * // Update or create a DiagnosticReport
     * const diagnosticReport = await prisma.diagnosticReport.upsert({
     *   create: {
     *     // ... data to create a DiagnosticReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DiagnosticReport we want to update
     *   }
     * })
     */
    upsert<T extends DiagnosticReportUpsertArgs>(args: SelectSubset<T, DiagnosticReportUpsertArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DiagnosticReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiagnosticReportCountArgs} args - Arguments to filter DiagnosticReports to count.
     * @example
     * // Count the number of DiagnosticReports
     * const count = await prisma.diagnosticReport.count({
     *   where: {
     *     // ... the filter for the DiagnosticReports we want to count
     *   }
     * })
    **/
    count<T extends DiagnosticReportCountArgs>(
      args?: Subset<T, DiagnosticReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DiagnosticReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DiagnosticReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiagnosticReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DiagnosticReportAggregateArgs>(args: Subset<T, DiagnosticReportAggregateArgs>): Prisma.PrismaPromise<GetDiagnosticReportAggregateType<T>>

    /**
     * Group by DiagnosticReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiagnosticReportGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DiagnosticReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DiagnosticReportGroupByArgs['orderBy'] }
        : { orderBy?: DiagnosticReportGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DiagnosticReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiagnosticReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DiagnosticReport model
   */
  readonly fields: DiagnosticReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DiagnosticReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DiagnosticReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    device<T extends DeviceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DeviceDefaultArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    dosingEvents<T extends DiagnosticReport$dosingEventsArgs<ExtArgs> = {}>(args?: Subset<T, DiagnosticReport$dosingEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DiagnosticReport model
   */
  interface DiagnosticReportFieldRefs {
    readonly id: FieldRef<"DiagnosticReport", 'String'>
    readonly deviceId: FieldRef<"DiagnosticReport", 'String'>
    readonly timestamp: FieldRef<"DiagnosticReport", 'DateTime'>
    readonly imageUrl: FieldRef<"DiagnosticReport", 'String'>
    readonly primaryLabel: FieldRef<"DiagnosticReport", 'String'>
    readonly confidence: FieldRef<"DiagnosticReport", 'Float'>
    readonly severity: FieldRef<"DiagnosticReport", 'SeverityLevel'>
    readonly classProbabilities: FieldRef<"DiagnosticReport", 'Json'>
    readonly actionTaken: FieldRef<"DiagnosticReport", 'String'>
    readonly cooldownActiveTill: FieldRef<"DiagnosticReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DiagnosticReport findUnique
   */
  export type DiagnosticReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * Filter, which DiagnosticReport to fetch.
     */
    where: DiagnosticReportWhereUniqueInput
  }

  /**
   * DiagnosticReport findUniqueOrThrow
   */
  export type DiagnosticReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * Filter, which DiagnosticReport to fetch.
     */
    where: DiagnosticReportWhereUniqueInput
  }

  /**
   * DiagnosticReport findFirst
   */
  export type DiagnosticReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * Filter, which DiagnosticReport to fetch.
     */
    where?: DiagnosticReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiagnosticReports to fetch.
     */
    orderBy?: DiagnosticReportOrderByWithRelationInput | DiagnosticReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DiagnosticReports.
     */
    cursor?: DiagnosticReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiagnosticReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiagnosticReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DiagnosticReports.
     */
    distinct?: DiagnosticReportScalarFieldEnum | DiagnosticReportScalarFieldEnum[]
  }

  /**
   * DiagnosticReport findFirstOrThrow
   */
  export type DiagnosticReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * Filter, which DiagnosticReport to fetch.
     */
    where?: DiagnosticReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiagnosticReports to fetch.
     */
    orderBy?: DiagnosticReportOrderByWithRelationInput | DiagnosticReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DiagnosticReports.
     */
    cursor?: DiagnosticReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiagnosticReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiagnosticReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DiagnosticReports.
     */
    distinct?: DiagnosticReportScalarFieldEnum | DiagnosticReportScalarFieldEnum[]
  }

  /**
   * DiagnosticReport findMany
   */
  export type DiagnosticReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * Filter, which DiagnosticReports to fetch.
     */
    where?: DiagnosticReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiagnosticReports to fetch.
     */
    orderBy?: DiagnosticReportOrderByWithRelationInput | DiagnosticReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DiagnosticReports.
     */
    cursor?: DiagnosticReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiagnosticReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiagnosticReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DiagnosticReports.
     */
    distinct?: DiagnosticReportScalarFieldEnum | DiagnosticReportScalarFieldEnum[]
  }

  /**
   * DiagnosticReport create
   */
  export type DiagnosticReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * The data needed to create a DiagnosticReport.
     */
    data: XOR<DiagnosticReportCreateInput, DiagnosticReportUncheckedCreateInput>
  }

  /**
   * DiagnosticReport createMany
   */
  export type DiagnosticReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DiagnosticReports.
     */
    data: DiagnosticReportCreateManyInput | DiagnosticReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DiagnosticReport createManyAndReturn
   */
  export type DiagnosticReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * The data used to create many DiagnosticReports.
     */
    data: DiagnosticReportCreateManyInput | DiagnosticReportCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DiagnosticReport update
   */
  export type DiagnosticReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * The data needed to update a DiagnosticReport.
     */
    data: XOR<DiagnosticReportUpdateInput, DiagnosticReportUncheckedUpdateInput>
    /**
     * Choose, which DiagnosticReport to update.
     */
    where: DiagnosticReportWhereUniqueInput
  }

  /**
   * DiagnosticReport updateMany
   */
  export type DiagnosticReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DiagnosticReports.
     */
    data: XOR<DiagnosticReportUpdateManyMutationInput, DiagnosticReportUncheckedUpdateManyInput>
    /**
     * Filter which DiagnosticReports to update
     */
    where?: DiagnosticReportWhereInput
    /**
     * Limit how many DiagnosticReports to update.
     */
    limit?: number
  }

  /**
   * DiagnosticReport updateManyAndReturn
   */
  export type DiagnosticReportUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * The data used to update DiagnosticReports.
     */
    data: XOR<DiagnosticReportUpdateManyMutationInput, DiagnosticReportUncheckedUpdateManyInput>
    /**
     * Filter which DiagnosticReports to update
     */
    where?: DiagnosticReportWhereInput
    /**
     * Limit how many DiagnosticReports to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DiagnosticReport upsert
   */
  export type DiagnosticReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * The filter to search for the DiagnosticReport to update in case it exists.
     */
    where: DiagnosticReportWhereUniqueInput
    /**
     * In case the DiagnosticReport found by the `where` argument doesn't exist, create a new DiagnosticReport with this data.
     */
    create: XOR<DiagnosticReportCreateInput, DiagnosticReportUncheckedCreateInput>
    /**
     * In case the DiagnosticReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DiagnosticReportUpdateInput, DiagnosticReportUncheckedUpdateInput>
  }

  /**
   * DiagnosticReport delete
   */
  export type DiagnosticReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    /**
     * Filter which DiagnosticReport to delete.
     */
    where: DiagnosticReportWhereUniqueInput
  }

  /**
   * DiagnosticReport deleteMany
   */
  export type DiagnosticReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DiagnosticReports to delete
     */
    where?: DiagnosticReportWhereInput
    /**
     * Limit how many DiagnosticReports to delete.
     */
    limit?: number
  }

  /**
   * DiagnosticReport.dosingEvents
   */
  export type DiagnosticReport$dosingEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    where?: DosingLogWhereInput
    orderBy?: DosingLogOrderByWithRelationInput | DosingLogOrderByWithRelationInput[]
    cursor?: DosingLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DosingLogScalarFieldEnum | DosingLogScalarFieldEnum[]
  }

  /**
   * DiagnosticReport without action
   */
  export type DiagnosticReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
  }


  /**
   * Model DosingLog
   */

  export type AggregateDosingLog = {
    _count: DosingLogCountAggregateOutputType | null
    _avg: DosingLogAvgAggregateOutputType | null
    _sum: DosingLogSumAggregateOutputType | null
    _min: DosingLogMinAggregateOutputType | null
    _max: DosingLogMaxAggregateOutputType | null
  }

  export type DosingLogAvgAggregateOutputType = {
    durationMs: number | null
    mixingLockoutMin: number | null
  }

  export type DosingLogSumAggregateOutputType = {
    durationMs: number | null
    mixingLockoutMin: number | null
  }

  export type DosingLogMinAggregateOutputType = {
    id: string | null
    deviceId: string | null
    timestamp: Date | null
    source: $Enums.DosingSource | null
    pumpType: $Enums.PumpType | null
    durationMs: number | null
    rationale: string | null
    mixingLockoutMin: number | null
    diagnosticReportId: string | null
  }

  export type DosingLogMaxAggregateOutputType = {
    id: string | null
    deviceId: string | null
    timestamp: Date | null
    source: $Enums.DosingSource | null
    pumpType: $Enums.PumpType | null
    durationMs: number | null
    rationale: string | null
    mixingLockoutMin: number | null
    diagnosticReportId: string | null
  }

  export type DosingLogCountAggregateOutputType = {
    id: number
    deviceId: number
    timestamp: number
    source: number
    pumpType: number
    durationMs: number
    rationale: number
    mixingLockoutMin: number
    diagnosticReportId: number
    _all: number
  }


  export type DosingLogAvgAggregateInputType = {
    durationMs?: true
    mixingLockoutMin?: true
  }

  export type DosingLogSumAggregateInputType = {
    durationMs?: true
    mixingLockoutMin?: true
  }

  export type DosingLogMinAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    source?: true
    pumpType?: true
    durationMs?: true
    rationale?: true
    mixingLockoutMin?: true
    diagnosticReportId?: true
  }

  export type DosingLogMaxAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    source?: true
    pumpType?: true
    durationMs?: true
    rationale?: true
    mixingLockoutMin?: true
    diagnosticReportId?: true
  }

  export type DosingLogCountAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    source?: true
    pumpType?: true
    durationMs?: true
    rationale?: true
    mixingLockoutMin?: true
    diagnosticReportId?: true
    _all?: true
  }

  export type DosingLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DosingLog to aggregate.
     */
    where?: DosingLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DosingLogs to fetch.
     */
    orderBy?: DosingLogOrderByWithRelationInput | DosingLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DosingLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DosingLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DosingLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DosingLogs
    **/
    _count?: true | DosingLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DosingLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DosingLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DosingLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DosingLogMaxAggregateInputType
  }

  export type GetDosingLogAggregateType<T extends DosingLogAggregateArgs> = {
        [P in keyof T & keyof AggregateDosingLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDosingLog[P]>
      : GetScalarType<T[P], AggregateDosingLog[P]>
  }




  export type DosingLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DosingLogWhereInput
    orderBy?: DosingLogOrderByWithAggregationInput | DosingLogOrderByWithAggregationInput[]
    by: DosingLogScalarFieldEnum[] | DosingLogScalarFieldEnum
    having?: DosingLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DosingLogCountAggregateInputType | true
    _avg?: DosingLogAvgAggregateInputType
    _sum?: DosingLogSumAggregateInputType
    _min?: DosingLogMinAggregateInputType
    _max?: DosingLogMaxAggregateInputType
  }

  export type DosingLogGroupByOutputType = {
    id: string
    deviceId: string
    timestamp: Date
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin: number
    diagnosticReportId: string | null
    _count: DosingLogCountAggregateOutputType | null
    _avg: DosingLogAvgAggregateOutputType | null
    _sum: DosingLogSumAggregateOutputType | null
    _min: DosingLogMinAggregateOutputType | null
    _max: DosingLogMaxAggregateOutputType | null
  }

  type GetDosingLogGroupByPayload<T extends DosingLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DosingLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DosingLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DosingLogGroupByOutputType[P]>
            : GetScalarType<T[P], DosingLogGroupByOutputType[P]>
        }
      >
    >


  export type DosingLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    source?: boolean
    pumpType?: boolean
    durationMs?: boolean
    rationale?: boolean
    mixingLockoutMin?: boolean
    diagnosticReportId?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
    diagnosticReport?: boolean | DosingLog$diagnosticReportArgs<ExtArgs>
  }, ExtArgs["result"]["dosingLog"]>

  export type DosingLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    source?: boolean
    pumpType?: boolean
    durationMs?: boolean
    rationale?: boolean
    mixingLockoutMin?: boolean
    diagnosticReportId?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
    diagnosticReport?: boolean | DosingLog$diagnosticReportArgs<ExtArgs>
  }, ExtArgs["result"]["dosingLog"]>

  export type DosingLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    source?: boolean
    pumpType?: boolean
    durationMs?: boolean
    rationale?: boolean
    mixingLockoutMin?: boolean
    diagnosticReportId?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
    diagnosticReport?: boolean | DosingLog$diagnosticReportArgs<ExtArgs>
  }, ExtArgs["result"]["dosingLog"]>

  export type DosingLogSelectScalar = {
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    source?: boolean
    pumpType?: boolean
    durationMs?: boolean
    rationale?: boolean
    mixingLockoutMin?: boolean
    diagnosticReportId?: boolean
  }

  export type DosingLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "deviceId" | "timestamp" | "source" | "pumpType" | "durationMs" | "rationale" | "mixingLockoutMin" | "diagnosticReportId", ExtArgs["result"]["dosingLog"]>
  export type DosingLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
    diagnosticReport?: boolean | DosingLog$diagnosticReportArgs<ExtArgs>
  }
  export type DosingLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
    diagnosticReport?: boolean | DosingLog$diagnosticReportArgs<ExtArgs>
  }
  export type DosingLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
    diagnosticReport?: boolean | DosingLog$diagnosticReportArgs<ExtArgs>
  }

  export type $DosingLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DosingLog"
    objects: {
      device: Prisma.$DevicePayload<ExtArgs>
      diagnosticReport: Prisma.$DiagnosticReportPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      deviceId: string
      timestamp: Date
      source: $Enums.DosingSource
      pumpType: $Enums.PumpType
      durationMs: number
      rationale: string
      mixingLockoutMin: number
      diagnosticReportId: string | null
    }, ExtArgs["result"]["dosingLog"]>
    composites: {}
  }

  type DosingLogGetPayload<S extends boolean | null | undefined | DosingLogDefaultArgs> = $Result.GetResult<Prisma.$DosingLogPayload, S>

  type DosingLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DosingLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DosingLogCountAggregateInputType | true
    }

  export interface DosingLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DosingLog'], meta: { name: 'DosingLog' } }
    /**
     * Find zero or one DosingLog that matches the filter.
     * @param {DosingLogFindUniqueArgs} args - Arguments to find a DosingLog
     * @example
     * // Get one DosingLog
     * const dosingLog = await prisma.dosingLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DosingLogFindUniqueArgs>(args: SelectSubset<T, DosingLogFindUniqueArgs<ExtArgs>>): Prisma__DosingLogClient<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DosingLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DosingLogFindUniqueOrThrowArgs} args - Arguments to find a DosingLog
     * @example
     * // Get one DosingLog
     * const dosingLog = await prisma.dosingLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DosingLogFindUniqueOrThrowArgs>(args: SelectSubset<T, DosingLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DosingLogClient<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DosingLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DosingLogFindFirstArgs} args - Arguments to find a DosingLog
     * @example
     * // Get one DosingLog
     * const dosingLog = await prisma.dosingLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DosingLogFindFirstArgs>(args?: SelectSubset<T, DosingLogFindFirstArgs<ExtArgs>>): Prisma__DosingLogClient<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DosingLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DosingLogFindFirstOrThrowArgs} args - Arguments to find a DosingLog
     * @example
     * // Get one DosingLog
     * const dosingLog = await prisma.dosingLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DosingLogFindFirstOrThrowArgs>(args?: SelectSubset<T, DosingLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__DosingLogClient<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DosingLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DosingLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DosingLogs
     * const dosingLogs = await prisma.dosingLog.findMany()
     * 
     * // Get first 10 DosingLogs
     * const dosingLogs = await prisma.dosingLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dosingLogWithIdOnly = await prisma.dosingLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DosingLogFindManyArgs>(args?: SelectSubset<T, DosingLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DosingLog.
     * @param {DosingLogCreateArgs} args - Arguments to create a DosingLog.
     * @example
     * // Create one DosingLog
     * const DosingLog = await prisma.dosingLog.create({
     *   data: {
     *     // ... data to create a DosingLog
     *   }
     * })
     * 
     */
    create<T extends DosingLogCreateArgs>(args: SelectSubset<T, DosingLogCreateArgs<ExtArgs>>): Prisma__DosingLogClient<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DosingLogs.
     * @param {DosingLogCreateManyArgs} args - Arguments to create many DosingLogs.
     * @example
     * // Create many DosingLogs
     * const dosingLog = await prisma.dosingLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DosingLogCreateManyArgs>(args?: SelectSubset<T, DosingLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DosingLogs and returns the data saved in the database.
     * @param {DosingLogCreateManyAndReturnArgs} args - Arguments to create many DosingLogs.
     * @example
     * // Create many DosingLogs
     * const dosingLog = await prisma.dosingLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DosingLogs and only return the `id`
     * const dosingLogWithIdOnly = await prisma.dosingLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DosingLogCreateManyAndReturnArgs>(args?: SelectSubset<T, DosingLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DosingLog.
     * @param {DosingLogDeleteArgs} args - Arguments to delete one DosingLog.
     * @example
     * // Delete one DosingLog
     * const DosingLog = await prisma.dosingLog.delete({
     *   where: {
     *     // ... filter to delete one DosingLog
     *   }
     * })
     * 
     */
    delete<T extends DosingLogDeleteArgs>(args: SelectSubset<T, DosingLogDeleteArgs<ExtArgs>>): Prisma__DosingLogClient<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DosingLog.
     * @param {DosingLogUpdateArgs} args - Arguments to update one DosingLog.
     * @example
     * // Update one DosingLog
     * const dosingLog = await prisma.dosingLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DosingLogUpdateArgs>(args: SelectSubset<T, DosingLogUpdateArgs<ExtArgs>>): Prisma__DosingLogClient<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DosingLogs.
     * @param {DosingLogDeleteManyArgs} args - Arguments to filter DosingLogs to delete.
     * @example
     * // Delete a few DosingLogs
     * const { count } = await prisma.dosingLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DosingLogDeleteManyArgs>(args?: SelectSubset<T, DosingLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DosingLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DosingLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DosingLogs
     * const dosingLog = await prisma.dosingLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DosingLogUpdateManyArgs>(args: SelectSubset<T, DosingLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DosingLogs and returns the data updated in the database.
     * @param {DosingLogUpdateManyAndReturnArgs} args - Arguments to update many DosingLogs.
     * @example
     * // Update many DosingLogs
     * const dosingLog = await prisma.dosingLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DosingLogs and only return the `id`
     * const dosingLogWithIdOnly = await prisma.dosingLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DosingLogUpdateManyAndReturnArgs>(args: SelectSubset<T, DosingLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DosingLog.
     * @param {DosingLogUpsertArgs} args - Arguments to update or create a DosingLog.
     * @example
     * // Update or create a DosingLog
     * const dosingLog = await prisma.dosingLog.upsert({
     *   create: {
     *     // ... data to create a DosingLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DosingLog we want to update
     *   }
     * })
     */
    upsert<T extends DosingLogUpsertArgs>(args: SelectSubset<T, DosingLogUpsertArgs<ExtArgs>>): Prisma__DosingLogClient<$Result.GetResult<Prisma.$DosingLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DosingLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DosingLogCountArgs} args - Arguments to filter DosingLogs to count.
     * @example
     * // Count the number of DosingLogs
     * const count = await prisma.dosingLog.count({
     *   where: {
     *     // ... the filter for the DosingLogs we want to count
     *   }
     * })
    **/
    count<T extends DosingLogCountArgs>(
      args?: Subset<T, DosingLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DosingLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DosingLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DosingLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DosingLogAggregateArgs>(args: Subset<T, DosingLogAggregateArgs>): Prisma.PrismaPromise<GetDosingLogAggregateType<T>>

    /**
     * Group by DosingLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DosingLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DosingLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DosingLogGroupByArgs['orderBy'] }
        : { orderBy?: DosingLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DosingLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDosingLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DosingLog model
   */
  readonly fields: DosingLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DosingLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DosingLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    device<T extends DeviceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DeviceDefaultArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    diagnosticReport<T extends DosingLog$diagnosticReportArgs<ExtArgs> = {}>(args?: Subset<T, DosingLog$diagnosticReportArgs<ExtArgs>>): Prisma__DiagnosticReportClient<$Result.GetResult<Prisma.$DiagnosticReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DosingLog model
   */
  interface DosingLogFieldRefs {
    readonly id: FieldRef<"DosingLog", 'String'>
    readonly deviceId: FieldRef<"DosingLog", 'String'>
    readonly timestamp: FieldRef<"DosingLog", 'DateTime'>
    readonly source: FieldRef<"DosingLog", 'DosingSource'>
    readonly pumpType: FieldRef<"DosingLog", 'PumpType'>
    readonly durationMs: FieldRef<"DosingLog", 'Int'>
    readonly rationale: FieldRef<"DosingLog", 'String'>
    readonly mixingLockoutMin: FieldRef<"DosingLog", 'Int'>
    readonly diagnosticReportId: FieldRef<"DosingLog", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DosingLog findUnique
   */
  export type DosingLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * Filter, which DosingLog to fetch.
     */
    where: DosingLogWhereUniqueInput
  }

  /**
   * DosingLog findUniqueOrThrow
   */
  export type DosingLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * Filter, which DosingLog to fetch.
     */
    where: DosingLogWhereUniqueInput
  }

  /**
   * DosingLog findFirst
   */
  export type DosingLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * Filter, which DosingLog to fetch.
     */
    where?: DosingLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DosingLogs to fetch.
     */
    orderBy?: DosingLogOrderByWithRelationInput | DosingLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DosingLogs.
     */
    cursor?: DosingLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DosingLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DosingLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DosingLogs.
     */
    distinct?: DosingLogScalarFieldEnum | DosingLogScalarFieldEnum[]
  }

  /**
   * DosingLog findFirstOrThrow
   */
  export type DosingLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * Filter, which DosingLog to fetch.
     */
    where?: DosingLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DosingLogs to fetch.
     */
    orderBy?: DosingLogOrderByWithRelationInput | DosingLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DosingLogs.
     */
    cursor?: DosingLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DosingLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DosingLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DosingLogs.
     */
    distinct?: DosingLogScalarFieldEnum | DosingLogScalarFieldEnum[]
  }

  /**
   * DosingLog findMany
   */
  export type DosingLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * Filter, which DosingLogs to fetch.
     */
    where?: DosingLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DosingLogs to fetch.
     */
    orderBy?: DosingLogOrderByWithRelationInput | DosingLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DosingLogs.
     */
    cursor?: DosingLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DosingLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DosingLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DosingLogs.
     */
    distinct?: DosingLogScalarFieldEnum | DosingLogScalarFieldEnum[]
  }

  /**
   * DosingLog create
   */
  export type DosingLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * The data needed to create a DosingLog.
     */
    data: XOR<DosingLogCreateInput, DosingLogUncheckedCreateInput>
  }

  /**
   * DosingLog createMany
   */
  export type DosingLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DosingLogs.
     */
    data: DosingLogCreateManyInput | DosingLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DosingLog createManyAndReturn
   */
  export type DosingLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * The data used to create many DosingLogs.
     */
    data: DosingLogCreateManyInput | DosingLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DosingLog update
   */
  export type DosingLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * The data needed to update a DosingLog.
     */
    data: XOR<DosingLogUpdateInput, DosingLogUncheckedUpdateInput>
    /**
     * Choose, which DosingLog to update.
     */
    where: DosingLogWhereUniqueInput
  }

  /**
   * DosingLog updateMany
   */
  export type DosingLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DosingLogs.
     */
    data: XOR<DosingLogUpdateManyMutationInput, DosingLogUncheckedUpdateManyInput>
    /**
     * Filter which DosingLogs to update
     */
    where?: DosingLogWhereInput
    /**
     * Limit how many DosingLogs to update.
     */
    limit?: number
  }

  /**
   * DosingLog updateManyAndReturn
   */
  export type DosingLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * The data used to update DosingLogs.
     */
    data: XOR<DosingLogUpdateManyMutationInput, DosingLogUncheckedUpdateManyInput>
    /**
     * Filter which DosingLogs to update
     */
    where?: DosingLogWhereInput
    /**
     * Limit how many DosingLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DosingLog upsert
   */
  export type DosingLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * The filter to search for the DosingLog to update in case it exists.
     */
    where: DosingLogWhereUniqueInput
    /**
     * In case the DosingLog found by the `where` argument doesn't exist, create a new DosingLog with this data.
     */
    create: XOR<DosingLogCreateInput, DosingLogUncheckedCreateInput>
    /**
     * In case the DosingLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DosingLogUpdateInput, DosingLogUncheckedUpdateInput>
  }

  /**
   * DosingLog delete
   */
  export type DosingLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
    /**
     * Filter which DosingLog to delete.
     */
    where: DosingLogWhereUniqueInput
  }

  /**
   * DosingLog deleteMany
   */
  export type DosingLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DosingLogs to delete
     */
    where?: DosingLogWhereInput
    /**
     * Limit how many DosingLogs to delete.
     */
    limit?: number
  }

  /**
   * DosingLog.diagnosticReport
   */
  export type DosingLog$diagnosticReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiagnosticReport
     */
    select?: DiagnosticReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiagnosticReport
     */
    omit?: DiagnosticReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DiagnosticReportInclude<ExtArgs> | null
    where?: DiagnosticReportWhereInput
  }

  /**
   * DosingLog without action
   */
  export type DosingLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DosingLog
     */
    select?: DosingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DosingLog
     */
    omit?: DosingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DosingLogInclude<ExtArgs> | null
  }


  /**
   * Model SystemAlert
   */

  export type AggregateSystemAlert = {
    _count: SystemAlertCountAggregateOutputType | null
    _min: SystemAlertMinAggregateOutputType | null
    _max: SystemAlertMaxAggregateOutputType | null
  }

  export type SystemAlertMinAggregateOutputType = {
    id: string | null
    deviceId: string | null
    timestamp: Date | null
    alertType: $Enums.AlertType | null
    severity: $Enums.SeverityLevel | null
    message: string | null
    isResolved: boolean | null
    resolvedAt: Date | null
    resolvedBy: string | null
  }

  export type SystemAlertMaxAggregateOutputType = {
    id: string | null
    deviceId: string | null
    timestamp: Date | null
    alertType: $Enums.AlertType | null
    severity: $Enums.SeverityLevel | null
    message: string | null
    isResolved: boolean | null
    resolvedAt: Date | null
    resolvedBy: string | null
  }

  export type SystemAlertCountAggregateOutputType = {
    id: number
    deviceId: number
    timestamp: number
    alertType: number
    severity: number
    message: number
    isResolved: number
    resolvedAt: number
    resolvedBy: number
    _all: number
  }


  export type SystemAlertMinAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    alertType?: true
    severity?: true
    message?: true
    isResolved?: true
    resolvedAt?: true
    resolvedBy?: true
  }

  export type SystemAlertMaxAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    alertType?: true
    severity?: true
    message?: true
    isResolved?: true
    resolvedAt?: true
    resolvedBy?: true
  }

  export type SystemAlertCountAggregateInputType = {
    id?: true
    deviceId?: true
    timestamp?: true
    alertType?: true
    severity?: true
    message?: true
    isResolved?: true
    resolvedAt?: true
    resolvedBy?: true
    _all?: true
  }

  export type SystemAlertAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemAlert to aggregate.
     */
    where?: SystemAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemAlerts to fetch.
     */
    orderBy?: SystemAlertOrderByWithRelationInput | SystemAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemAlerts
    **/
    _count?: true | SystemAlertCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemAlertMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemAlertMaxAggregateInputType
  }

  export type GetSystemAlertAggregateType<T extends SystemAlertAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemAlert]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemAlert[P]>
      : GetScalarType<T[P], AggregateSystemAlert[P]>
  }




  export type SystemAlertGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemAlertWhereInput
    orderBy?: SystemAlertOrderByWithAggregationInput | SystemAlertOrderByWithAggregationInput[]
    by: SystemAlertScalarFieldEnum[] | SystemAlertScalarFieldEnum
    having?: SystemAlertScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemAlertCountAggregateInputType | true
    _min?: SystemAlertMinAggregateInputType
    _max?: SystemAlertMaxAggregateInputType
  }

  export type SystemAlertGroupByOutputType = {
    id: string
    deviceId: string
    timestamp: Date
    alertType: $Enums.AlertType
    severity: $Enums.SeverityLevel
    message: string
    isResolved: boolean
    resolvedAt: Date | null
    resolvedBy: string | null
    _count: SystemAlertCountAggregateOutputType | null
    _min: SystemAlertMinAggregateOutputType | null
    _max: SystemAlertMaxAggregateOutputType | null
  }

  type GetSystemAlertGroupByPayload<T extends SystemAlertGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemAlertGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemAlertGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemAlertGroupByOutputType[P]>
            : GetScalarType<T[P], SystemAlertGroupByOutputType[P]>
        }
      >
    >


  export type SystemAlertSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    alertType?: boolean
    severity?: boolean
    message?: boolean
    isResolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["systemAlert"]>

  export type SystemAlertSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    alertType?: boolean
    severity?: boolean
    message?: boolean
    isResolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["systemAlert"]>

  export type SystemAlertSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    alertType?: boolean
    severity?: boolean
    message?: boolean
    isResolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["systemAlert"]>

  export type SystemAlertSelectScalar = {
    id?: boolean
    deviceId?: boolean
    timestamp?: boolean
    alertType?: boolean
    severity?: boolean
    message?: boolean
    isResolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
  }

  export type SystemAlertOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "deviceId" | "timestamp" | "alertType" | "severity" | "message" | "isResolved" | "resolvedAt" | "resolvedBy", ExtArgs["result"]["systemAlert"]>
  export type SystemAlertInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }
  export type SystemAlertIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }
  export type SystemAlertIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    device?: boolean | DeviceDefaultArgs<ExtArgs>
  }

  export type $SystemAlertPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemAlert"
    objects: {
      device: Prisma.$DevicePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      deviceId: string
      timestamp: Date
      alertType: $Enums.AlertType
      severity: $Enums.SeverityLevel
      message: string
      isResolved: boolean
      resolvedAt: Date | null
      resolvedBy: string | null
    }, ExtArgs["result"]["systemAlert"]>
    composites: {}
  }

  type SystemAlertGetPayload<S extends boolean | null | undefined | SystemAlertDefaultArgs> = $Result.GetResult<Prisma.$SystemAlertPayload, S>

  type SystemAlertCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SystemAlertFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SystemAlertCountAggregateInputType | true
    }

  export interface SystemAlertDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemAlert'], meta: { name: 'SystemAlert' } }
    /**
     * Find zero or one SystemAlert that matches the filter.
     * @param {SystemAlertFindUniqueArgs} args - Arguments to find a SystemAlert
     * @example
     * // Get one SystemAlert
     * const systemAlert = await prisma.systemAlert.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemAlertFindUniqueArgs>(args: SelectSubset<T, SystemAlertFindUniqueArgs<ExtArgs>>): Prisma__SystemAlertClient<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SystemAlert that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SystemAlertFindUniqueOrThrowArgs} args - Arguments to find a SystemAlert
     * @example
     * // Get one SystemAlert
     * const systemAlert = await prisma.systemAlert.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemAlertFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemAlertFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemAlertClient<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemAlert that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAlertFindFirstArgs} args - Arguments to find a SystemAlert
     * @example
     * // Get one SystemAlert
     * const systemAlert = await prisma.systemAlert.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemAlertFindFirstArgs>(args?: SelectSubset<T, SystemAlertFindFirstArgs<ExtArgs>>): Prisma__SystemAlertClient<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemAlert that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAlertFindFirstOrThrowArgs} args - Arguments to find a SystemAlert
     * @example
     * // Get one SystemAlert
     * const systemAlert = await prisma.systemAlert.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemAlertFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemAlertFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemAlertClient<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SystemAlerts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAlertFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemAlerts
     * const systemAlerts = await prisma.systemAlert.findMany()
     * 
     * // Get first 10 SystemAlerts
     * const systemAlerts = await prisma.systemAlert.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemAlertWithIdOnly = await prisma.systemAlert.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemAlertFindManyArgs>(args?: SelectSubset<T, SystemAlertFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SystemAlert.
     * @param {SystemAlertCreateArgs} args - Arguments to create a SystemAlert.
     * @example
     * // Create one SystemAlert
     * const SystemAlert = await prisma.systemAlert.create({
     *   data: {
     *     // ... data to create a SystemAlert
     *   }
     * })
     * 
     */
    create<T extends SystemAlertCreateArgs>(args: SelectSubset<T, SystemAlertCreateArgs<ExtArgs>>): Prisma__SystemAlertClient<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SystemAlerts.
     * @param {SystemAlertCreateManyArgs} args - Arguments to create many SystemAlerts.
     * @example
     * // Create many SystemAlerts
     * const systemAlert = await prisma.systemAlert.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemAlertCreateManyArgs>(args?: SelectSubset<T, SystemAlertCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SystemAlerts and returns the data saved in the database.
     * @param {SystemAlertCreateManyAndReturnArgs} args - Arguments to create many SystemAlerts.
     * @example
     * // Create many SystemAlerts
     * const systemAlert = await prisma.systemAlert.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SystemAlerts and only return the `id`
     * const systemAlertWithIdOnly = await prisma.systemAlert.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SystemAlertCreateManyAndReturnArgs>(args?: SelectSubset<T, SystemAlertCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SystemAlert.
     * @param {SystemAlertDeleteArgs} args - Arguments to delete one SystemAlert.
     * @example
     * // Delete one SystemAlert
     * const SystemAlert = await prisma.systemAlert.delete({
     *   where: {
     *     // ... filter to delete one SystemAlert
     *   }
     * })
     * 
     */
    delete<T extends SystemAlertDeleteArgs>(args: SelectSubset<T, SystemAlertDeleteArgs<ExtArgs>>): Prisma__SystemAlertClient<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SystemAlert.
     * @param {SystemAlertUpdateArgs} args - Arguments to update one SystemAlert.
     * @example
     * // Update one SystemAlert
     * const systemAlert = await prisma.systemAlert.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemAlertUpdateArgs>(args: SelectSubset<T, SystemAlertUpdateArgs<ExtArgs>>): Prisma__SystemAlertClient<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SystemAlerts.
     * @param {SystemAlertDeleteManyArgs} args - Arguments to filter SystemAlerts to delete.
     * @example
     * // Delete a few SystemAlerts
     * const { count } = await prisma.systemAlert.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemAlertDeleteManyArgs>(args?: SelectSubset<T, SystemAlertDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemAlerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAlertUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemAlerts
     * const systemAlert = await prisma.systemAlert.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemAlertUpdateManyArgs>(args: SelectSubset<T, SystemAlertUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemAlerts and returns the data updated in the database.
     * @param {SystemAlertUpdateManyAndReturnArgs} args - Arguments to update many SystemAlerts.
     * @example
     * // Update many SystemAlerts
     * const systemAlert = await prisma.systemAlert.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SystemAlerts and only return the `id`
     * const systemAlertWithIdOnly = await prisma.systemAlert.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SystemAlertUpdateManyAndReturnArgs>(args: SelectSubset<T, SystemAlertUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SystemAlert.
     * @param {SystemAlertUpsertArgs} args - Arguments to update or create a SystemAlert.
     * @example
     * // Update or create a SystemAlert
     * const systemAlert = await prisma.systemAlert.upsert({
     *   create: {
     *     // ... data to create a SystemAlert
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemAlert we want to update
     *   }
     * })
     */
    upsert<T extends SystemAlertUpsertArgs>(args: SelectSubset<T, SystemAlertUpsertArgs<ExtArgs>>): Prisma__SystemAlertClient<$Result.GetResult<Prisma.$SystemAlertPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SystemAlerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAlertCountArgs} args - Arguments to filter SystemAlerts to count.
     * @example
     * // Count the number of SystemAlerts
     * const count = await prisma.systemAlert.count({
     *   where: {
     *     // ... the filter for the SystemAlerts we want to count
     *   }
     * })
    **/
    count<T extends SystemAlertCountArgs>(
      args?: Subset<T, SystemAlertCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemAlertCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemAlert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAlertAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemAlertAggregateArgs>(args: Subset<T, SystemAlertAggregateArgs>): Prisma.PrismaPromise<GetSystemAlertAggregateType<T>>

    /**
     * Group by SystemAlert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAlertGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemAlertGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemAlertGroupByArgs['orderBy'] }
        : { orderBy?: SystemAlertGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemAlertGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemAlertGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemAlert model
   */
  readonly fields: SystemAlertFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemAlert.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemAlertClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    device<T extends DeviceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DeviceDefaultArgs<ExtArgs>>): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemAlert model
   */
  interface SystemAlertFieldRefs {
    readonly id: FieldRef<"SystemAlert", 'String'>
    readonly deviceId: FieldRef<"SystemAlert", 'String'>
    readonly timestamp: FieldRef<"SystemAlert", 'DateTime'>
    readonly alertType: FieldRef<"SystemAlert", 'AlertType'>
    readonly severity: FieldRef<"SystemAlert", 'SeverityLevel'>
    readonly message: FieldRef<"SystemAlert", 'String'>
    readonly isResolved: FieldRef<"SystemAlert", 'Boolean'>
    readonly resolvedAt: FieldRef<"SystemAlert", 'DateTime'>
    readonly resolvedBy: FieldRef<"SystemAlert", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SystemAlert findUnique
   */
  export type SystemAlertFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * Filter, which SystemAlert to fetch.
     */
    where: SystemAlertWhereUniqueInput
  }

  /**
   * SystemAlert findUniqueOrThrow
   */
  export type SystemAlertFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * Filter, which SystemAlert to fetch.
     */
    where: SystemAlertWhereUniqueInput
  }

  /**
   * SystemAlert findFirst
   */
  export type SystemAlertFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * Filter, which SystemAlert to fetch.
     */
    where?: SystemAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemAlerts to fetch.
     */
    orderBy?: SystemAlertOrderByWithRelationInput | SystemAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemAlerts.
     */
    cursor?: SystemAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemAlerts.
     */
    distinct?: SystemAlertScalarFieldEnum | SystemAlertScalarFieldEnum[]
  }

  /**
   * SystemAlert findFirstOrThrow
   */
  export type SystemAlertFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * Filter, which SystemAlert to fetch.
     */
    where?: SystemAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemAlerts to fetch.
     */
    orderBy?: SystemAlertOrderByWithRelationInput | SystemAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemAlerts.
     */
    cursor?: SystemAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemAlerts.
     */
    distinct?: SystemAlertScalarFieldEnum | SystemAlertScalarFieldEnum[]
  }

  /**
   * SystemAlert findMany
   */
  export type SystemAlertFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * Filter, which SystemAlerts to fetch.
     */
    where?: SystemAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemAlerts to fetch.
     */
    orderBy?: SystemAlertOrderByWithRelationInput | SystemAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemAlerts.
     */
    cursor?: SystemAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemAlerts.
     */
    distinct?: SystemAlertScalarFieldEnum | SystemAlertScalarFieldEnum[]
  }

  /**
   * SystemAlert create
   */
  export type SystemAlertCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * The data needed to create a SystemAlert.
     */
    data: XOR<SystemAlertCreateInput, SystemAlertUncheckedCreateInput>
  }

  /**
   * SystemAlert createMany
   */
  export type SystemAlertCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemAlerts.
     */
    data: SystemAlertCreateManyInput | SystemAlertCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemAlert createManyAndReturn
   */
  export type SystemAlertCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * The data used to create many SystemAlerts.
     */
    data: SystemAlertCreateManyInput | SystemAlertCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SystemAlert update
   */
  export type SystemAlertUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * The data needed to update a SystemAlert.
     */
    data: XOR<SystemAlertUpdateInput, SystemAlertUncheckedUpdateInput>
    /**
     * Choose, which SystemAlert to update.
     */
    where: SystemAlertWhereUniqueInput
  }

  /**
   * SystemAlert updateMany
   */
  export type SystemAlertUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemAlerts.
     */
    data: XOR<SystemAlertUpdateManyMutationInput, SystemAlertUncheckedUpdateManyInput>
    /**
     * Filter which SystemAlerts to update
     */
    where?: SystemAlertWhereInput
    /**
     * Limit how many SystemAlerts to update.
     */
    limit?: number
  }

  /**
   * SystemAlert updateManyAndReturn
   */
  export type SystemAlertUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * The data used to update SystemAlerts.
     */
    data: XOR<SystemAlertUpdateManyMutationInput, SystemAlertUncheckedUpdateManyInput>
    /**
     * Filter which SystemAlerts to update
     */
    where?: SystemAlertWhereInput
    /**
     * Limit how many SystemAlerts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SystemAlert upsert
   */
  export type SystemAlertUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * The filter to search for the SystemAlert to update in case it exists.
     */
    where: SystemAlertWhereUniqueInput
    /**
     * In case the SystemAlert found by the `where` argument doesn't exist, create a new SystemAlert with this data.
     */
    create: XOR<SystemAlertCreateInput, SystemAlertUncheckedCreateInput>
    /**
     * In case the SystemAlert was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemAlertUpdateInput, SystemAlertUncheckedUpdateInput>
  }

  /**
   * SystemAlert delete
   */
  export type SystemAlertDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
    /**
     * Filter which SystemAlert to delete.
     */
    where: SystemAlertWhereUniqueInput
  }

  /**
   * SystemAlert deleteMany
   */
  export type SystemAlertDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemAlerts to delete
     */
    where?: SystemAlertWhereInput
    /**
     * Limit how many SystemAlerts to delete.
     */
    limit?: number
  }

  /**
   * SystemAlert without action
   */
  export type SystemAlertDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAlert
     */
    select?: SystemAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemAlert
     */
    omit?: SystemAlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemAlertInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const DeviceScalarFieldEnum: {
    id: 'id',
    name: 'name',
    location: 'location',
    isOnline: 'isOnline',
    createdAt: 'createdAt',
    activeRecipeId: 'activeRecipeId',
    circulationMode: 'circulationMode',
    circRunMin: 'circRunMin',
    circRestMin: 'circRestMin',
    circUpdatedAt: 'circUpdatedAt'
  };

  export type DeviceScalarFieldEnum = (typeof DeviceScalarFieldEnum)[keyof typeof DeviceScalarFieldEnum]


  export const CropRecipeScalarFieldEnum: {
    id: 'id',
    cropName: 'cropName',
    targetPhMin: 'targetPhMin',
    targetPhMax: 'targetPhMax',
    targetEcMin: 'targetEcMin',
    targetEcMax: 'targetEcMax',
    ecCeiling: 'ecCeiling',
    minWaterLevel: 'minWaterLevel',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CropRecipeScalarFieldEnum = (typeof CropRecipeScalarFieldEnum)[keyof typeof CropRecipeScalarFieldEnum]


  export const DiagnosticReportScalarFieldEnum: {
    id: 'id',
    deviceId: 'deviceId',
    timestamp: 'timestamp',
    imageUrl: 'imageUrl',
    primaryLabel: 'primaryLabel',
    confidence: 'confidence',
    severity: 'severity',
    classProbabilities: 'classProbabilities',
    actionTaken: 'actionTaken',
    cooldownActiveTill: 'cooldownActiveTill'
  };

  export type DiagnosticReportScalarFieldEnum = (typeof DiagnosticReportScalarFieldEnum)[keyof typeof DiagnosticReportScalarFieldEnum]


  export const DosingLogScalarFieldEnum: {
    id: 'id',
    deviceId: 'deviceId',
    timestamp: 'timestamp',
    source: 'source',
    pumpType: 'pumpType',
    durationMs: 'durationMs',
    rationale: 'rationale',
    mixingLockoutMin: 'mixingLockoutMin',
    diagnosticReportId: 'diagnosticReportId'
  };

  export type DosingLogScalarFieldEnum = (typeof DosingLogScalarFieldEnum)[keyof typeof DosingLogScalarFieldEnum]


  export const SystemAlertScalarFieldEnum: {
    id: 'id',
    deviceId: 'deviceId',
    timestamp: 'timestamp',
    alertType: 'alertType',
    severity: 'severity',
    message: 'message',
    isResolved: 'isResolved',
    resolvedAt: 'resolvedAt',
    resolvedBy: 'resolvedBy'
  };

  export type SystemAlertScalarFieldEnum = (typeof SystemAlertScalarFieldEnum)[keyof typeof SystemAlertScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'SeverityLevel'
   */
  export type EnumSeverityLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SeverityLevel'>
    


  /**
   * Reference to a field of type 'SeverityLevel[]'
   */
  export type ListEnumSeverityLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SeverityLevel[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DosingSource'
   */
  export type EnumDosingSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DosingSource'>
    


  /**
   * Reference to a field of type 'DosingSource[]'
   */
  export type ListEnumDosingSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DosingSource[]'>
    


  /**
   * Reference to a field of type 'PumpType'
   */
  export type EnumPumpTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PumpType'>
    


  /**
   * Reference to a field of type 'PumpType[]'
   */
  export type ListEnumPumpTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PumpType[]'>
    


  /**
   * Reference to a field of type 'AlertType'
   */
  export type EnumAlertTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertType'>
    


  /**
   * Reference to a field of type 'AlertType[]'
   */
  export type ListEnumAlertTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertType[]'>
    
  /**
   * Deep Input Types
   */


  export type DeviceWhereInput = {
    AND?: DeviceWhereInput | DeviceWhereInput[]
    OR?: DeviceWhereInput[]
    NOT?: DeviceWhereInput | DeviceWhereInput[]
    id?: StringFilter<"Device"> | string
    name?: StringFilter<"Device"> | string
    location?: StringNullableFilter<"Device"> | string | null
    isOnline?: BoolFilter<"Device"> | boolean
    createdAt?: DateTimeFilter<"Device"> | Date | string
    activeRecipeId?: StringNullableFilter<"Device"> | string | null
    circulationMode?: StringFilter<"Device"> | string
    circRunMin?: IntFilter<"Device"> | number
    circRestMin?: IntFilter<"Device"> | number
    circUpdatedAt?: DateTimeFilter<"Device"> | Date | string
    activeRecipe?: XOR<CropRecipeNullableScalarRelationFilter, CropRecipeWhereInput> | null
    diagnosticReports?: DiagnosticReportListRelationFilter
    dosingLogs?: DosingLogListRelationFilter
    alerts?: SystemAlertListRelationFilter
  }

  export type DeviceOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrderInput | SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
    activeRecipeId?: SortOrderInput | SortOrder
    circulationMode?: SortOrder
    circRunMin?: SortOrder
    circRestMin?: SortOrder
    circUpdatedAt?: SortOrder
    activeRecipe?: CropRecipeOrderByWithRelationInput
    diagnosticReports?: DiagnosticReportOrderByRelationAggregateInput
    dosingLogs?: DosingLogOrderByRelationAggregateInput
    alerts?: SystemAlertOrderByRelationAggregateInput
  }

  export type DeviceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeviceWhereInput | DeviceWhereInput[]
    OR?: DeviceWhereInput[]
    NOT?: DeviceWhereInput | DeviceWhereInput[]
    name?: StringFilter<"Device"> | string
    location?: StringNullableFilter<"Device"> | string | null
    isOnline?: BoolFilter<"Device"> | boolean
    createdAt?: DateTimeFilter<"Device"> | Date | string
    activeRecipeId?: StringNullableFilter<"Device"> | string | null
    circulationMode?: StringFilter<"Device"> | string
    circRunMin?: IntFilter<"Device"> | number
    circRestMin?: IntFilter<"Device"> | number
    circUpdatedAt?: DateTimeFilter<"Device"> | Date | string
    activeRecipe?: XOR<CropRecipeNullableScalarRelationFilter, CropRecipeWhereInput> | null
    diagnosticReports?: DiagnosticReportListRelationFilter
    dosingLogs?: DosingLogListRelationFilter
    alerts?: SystemAlertListRelationFilter
  }, "id">

  export type DeviceOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrderInput | SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
    activeRecipeId?: SortOrderInput | SortOrder
    circulationMode?: SortOrder
    circRunMin?: SortOrder
    circRestMin?: SortOrder
    circUpdatedAt?: SortOrder
    _count?: DeviceCountOrderByAggregateInput
    _avg?: DeviceAvgOrderByAggregateInput
    _max?: DeviceMaxOrderByAggregateInput
    _min?: DeviceMinOrderByAggregateInput
    _sum?: DeviceSumOrderByAggregateInput
  }

  export type DeviceScalarWhereWithAggregatesInput = {
    AND?: DeviceScalarWhereWithAggregatesInput | DeviceScalarWhereWithAggregatesInput[]
    OR?: DeviceScalarWhereWithAggregatesInput[]
    NOT?: DeviceScalarWhereWithAggregatesInput | DeviceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Device"> | string
    name?: StringWithAggregatesFilter<"Device"> | string
    location?: StringNullableWithAggregatesFilter<"Device"> | string | null
    isOnline?: BoolWithAggregatesFilter<"Device"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Device"> | Date | string
    activeRecipeId?: StringNullableWithAggregatesFilter<"Device"> | string | null
    circulationMode?: StringWithAggregatesFilter<"Device"> | string
    circRunMin?: IntWithAggregatesFilter<"Device"> | number
    circRestMin?: IntWithAggregatesFilter<"Device"> | number
    circUpdatedAt?: DateTimeWithAggregatesFilter<"Device"> | Date | string
  }

  export type CropRecipeWhereInput = {
    AND?: CropRecipeWhereInput | CropRecipeWhereInput[]
    OR?: CropRecipeWhereInput[]
    NOT?: CropRecipeWhereInput | CropRecipeWhereInput[]
    id?: StringFilter<"CropRecipe"> | string
    cropName?: StringFilter<"CropRecipe"> | string
    targetPhMin?: FloatFilter<"CropRecipe"> | number
    targetPhMax?: FloatFilter<"CropRecipe"> | number
    targetEcMin?: FloatFilter<"CropRecipe"> | number
    targetEcMax?: FloatFilter<"CropRecipe"> | number
    ecCeiling?: FloatFilter<"CropRecipe"> | number
    minWaterLevel?: FloatFilter<"CropRecipe"> | number
    createdAt?: DateTimeFilter<"CropRecipe"> | Date | string
    updatedAt?: DateTimeFilter<"CropRecipe"> | Date | string
    assignedDevices?: DeviceListRelationFilter
  }

  export type CropRecipeOrderByWithRelationInput = {
    id?: SortOrder
    cropName?: SortOrder
    targetPhMin?: SortOrder
    targetPhMax?: SortOrder
    targetEcMin?: SortOrder
    targetEcMax?: SortOrder
    ecCeiling?: SortOrder
    minWaterLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    assignedDevices?: DeviceOrderByRelationAggregateInput
  }

  export type CropRecipeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    cropName?: string
    AND?: CropRecipeWhereInput | CropRecipeWhereInput[]
    OR?: CropRecipeWhereInput[]
    NOT?: CropRecipeWhereInput | CropRecipeWhereInput[]
    targetPhMin?: FloatFilter<"CropRecipe"> | number
    targetPhMax?: FloatFilter<"CropRecipe"> | number
    targetEcMin?: FloatFilter<"CropRecipe"> | number
    targetEcMax?: FloatFilter<"CropRecipe"> | number
    ecCeiling?: FloatFilter<"CropRecipe"> | number
    minWaterLevel?: FloatFilter<"CropRecipe"> | number
    createdAt?: DateTimeFilter<"CropRecipe"> | Date | string
    updatedAt?: DateTimeFilter<"CropRecipe"> | Date | string
    assignedDevices?: DeviceListRelationFilter
  }, "id" | "cropName">

  export type CropRecipeOrderByWithAggregationInput = {
    id?: SortOrder
    cropName?: SortOrder
    targetPhMin?: SortOrder
    targetPhMax?: SortOrder
    targetEcMin?: SortOrder
    targetEcMax?: SortOrder
    ecCeiling?: SortOrder
    minWaterLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CropRecipeCountOrderByAggregateInput
    _avg?: CropRecipeAvgOrderByAggregateInput
    _max?: CropRecipeMaxOrderByAggregateInput
    _min?: CropRecipeMinOrderByAggregateInput
    _sum?: CropRecipeSumOrderByAggregateInput
  }

  export type CropRecipeScalarWhereWithAggregatesInput = {
    AND?: CropRecipeScalarWhereWithAggregatesInput | CropRecipeScalarWhereWithAggregatesInput[]
    OR?: CropRecipeScalarWhereWithAggregatesInput[]
    NOT?: CropRecipeScalarWhereWithAggregatesInput | CropRecipeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CropRecipe"> | string
    cropName?: StringWithAggregatesFilter<"CropRecipe"> | string
    targetPhMin?: FloatWithAggregatesFilter<"CropRecipe"> | number
    targetPhMax?: FloatWithAggregatesFilter<"CropRecipe"> | number
    targetEcMin?: FloatWithAggregatesFilter<"CropRecipe"> | number
    targetEcMax?: FloatWithAggregatesFilter<"CropRecipe"> | number
    ecCeiling?: FloatWithAggregatesFilter<"CropRecipe"> | number
    minWaterLevel?: FloatWithAggregatesFilter<"CropRecipe"> | number
    createdAt?: DateTimeWithAggregatesFilter<"CropRecipe"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CropRecipe"> | Date | string
  }

  export type DiagnosticReportWhereInput = {
    AND?: DiagnosticReportWhereInput | DiagnosticReportWhereInput[]
    OR?: DiagnosticReportWhereInput[]
    NOT?: DiagnosticReportWhereInput | DiagnosticReportWhereInput[]
    id?: StringFilter<"DiagnosticReport"> | string
    deviceId?: StringFilter<"DiagnosticReport"> | string
    timestamp?: DateTimeFilter<"DiagnosticReport"> | Date | string
    imageUrl?: StringFilter<"DiagnosticReport"> | string
    primaryLabel?: StringFilter<"DiagnosticReport"> | string
    confidence?: FloatFilter<"DiagnosticReport"> | number
    severity?: EnumSeverityLevelFilter<"DiagnosticReport"> | $Enums.SeverityLevel
    classProbabilities?: JsonFilter<"DiagnosticReport">
    actionTaken?: StringNullableFilter<"DiagnosticReport"> | string | null
    cooldownActiveTill?: DateTimeNullableFilter<"DiagnosticReport"> | Date | string | null
    device?: XOR<DeviceScalarRelationFilter, DeviceWhereInput>
    dosingEvents?: DosingLogListRelationFilter
  }

  export type DiagnosticReportOrderByWithRelationInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    imageUrl?: SortOrder
    primaryLabel?: SortOrder
    confidence?: SortOrder
    severity?: SortOrder
    classProbabilities?: SortOrder
    actionTaken?: SortOrderInput | SortOrder
    cooldownActiveTill?: SortOrderInput | SortOrder
    device?: DeviceOrderByWithRelationInput
    dosingEvents?: DosingLogOrderByRelationAggregateInput
  }

  export type DiagnosticReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DiagnosticReportWhereInput | DiagnosticReportWhereInput[]
    OR?: DiagnosticReportWhereInput[]
    NOT?: DiagnosticReportWhereInput | DiagnosticReportWhereInput[]
    deviceId?: StringFilter<"DiagnosticReport"> | string
    timestamp?: DateTimeFilter<"DiagnosticReport"> | Date | string
    imageUrl?: StringFilter<"DiagnosticReport"> | string
    primaryLabel?: StringFilter<"DiagnosticReport"> | string
    confidence?: FloatFilter<"DiagnosticReport"> | number
    severity?: EnumSeverityLevelFilter<"DiagnosticReport"> | $Enums.SeverityLevel
    classProbabilities?: JsonFilter<"DiagnosticReport">
    actionTaken?: StringNullableFilter<"DiagnosticReport"> | string | null
    cooldownActiveTill?: DateTimeNullableFilter<"DiagnosticReport"> | Date | string | null
    device?: XOR<DeviceScalarRelationFilter, DeviceWhereInput>
    dosingEvents?: DosingLogListRelationFilter
  }, "id">

  export type DiagnosticReportOrderByWithAggregationInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    imageUrl?: SortOrder
    primaryLabel?: SortOrder
    confidence?: SortOrder
    severity?: SortOrder
    classProbabilities?: SortOrder
    actionTaken?: SortOrderInput | SortOrder
    cooldownActiveTill?: SortOrderInput | SortOrder
    _count?: DiagnosticReportCountOrderByAggregateInput
    _avg?: DiagnosticReportAvgOrderByAggregateInput
    _max?: DiagnosticReportMaxOrderByAggregateInput
    _min?: DiagnosticReportMinOrderByAggregateInput
    _sum?: DiagnosticReportSumOrderByAggregateInput
  }

  export type DiagnosticReportScalarWhereWithAggregatesInput = {
    AND?: DiagnosticReportScalarWhereWithAggregatesInput | DiagnosticReportScalarWhereWithAggregatesInput[]
    OR?: DiagnosticReportScalarWhereWithAggregatesInput[]
    NOT?: DiagnosticReportScalarWhereWithAggregatesInput | DiagnosticReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DiagnosticReport"> | string
    deviceId?: StringWithAggregatesFilter<"DiagnosticReport"> | string
    timestamp?: DateTimeWithAggregatesFilter<"DiagnosticReport"> | Date | string
    imageUrl?: StringWithAggregatesFilter<"DiagnosticReport"> | string
    primaryLabel?: StringWithAggregatesFilter<"DiagnosticReport"> | string
    confidence?: FloatWithAggregatesFilter<"DiagnosticReport"> | number
    severity?: EnumSeverityLevelWithAggregatesFilter<"DiagnosticReport"> | $Enums.SeverityLevel
    classProbabilities?: JsonWithAggregatesFilter<"DiagnosticReport">
    actionTaken?: StringNullableWithAggregatesFilter<"DiagnosticReport"> | string | null
    cooldownActiveTill?: DateTimeNullableWithAggregatesFilter<"DiagnosticReport"> | Date | string | null
  }

  export type DosingLogWhereInput = {
    AND?: DosingLogWhereInput | DosingLogWhereInput[]
    OR?: DosingLogWhereInput[]
    NOT?: DosingLogWhereInput | DosingLogWhereInput[]
    id?: StringFilter<"DosingLog"> | string
    deviceId?: StringFilter<"DosingLog"> | string
    timestamp?: DateTimeFilter<"DosingLog"> | Date | string
    source?: EnumDosingSourceFilter<"DosingLog"> | $Enums.DosingSource
    pumpType?: EnumPumpTypeFilter<"DosingLog"> | $Enums.PumpType
    durationMs?: IntFilter<"DosingLog"> | number
    rationale?: StringFilter<"DosingLog"> | string
    mixingLockoutMin?: IntFilter<"DosingLog"> | number
    diagnosticReportId?: StringNullableFilter<"DosingLog"> | string | null
    device?: XOR<DeviceScalarRelationFilter, DeviceWhereInput>
    diagnosticReport?: XOR<DiagnosticReportNullableScalarRelationFilter, DiagnosticReportWhereInput> | null
  }

  export type DosingLogOrderByWithRelationInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    source?: SortOrder
    pumpType?: SortOrder
    durationMs?: SortOrder
    rationale?: SortOrder
    mixingLockoutMin?: SortOrder
    diagnosticReportId?: SortOrderInput | SortOrder
    device?: DeviceOrderByWithRelationInput
    diagnosticReport?: DiagnosticReportOrderByWithRelationInput
  }

  export type DosingLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DosingLogWhereInput | DosingLogWhereInput[]
    OR?: DosingLogWhereInput[]
    NOT?: DosingLogWhereInput | DosingLogWhereInput[]
    deviceId?: StringFilter<"DosingLog"> | string
    timestamp?: DateTimeFilter<"DosingLog"> | Date | string
    source?: EnumDosingSourceFilter<"DosingLog"> | $Enums.DosingSource
    pumpType?: EnumPumpTypeFilter<"DosingLog"> | $Enums.PumpType
    durationMs?: IntFilter<"DosingLog"> | number
    rationale?: StringFilter<"DosingLog"> | string
    mixingLockoutMin?: IntFilter<"DosingLog"> | number
    diagnosticReportId?: StringNullableFilter<"DosingLog"> | string | null
    device?: XOR<DeviceScalarRelationFilter, DeviceWhereInput>
    diagnosticReport?: XOR<DiagnosticReportNullableScalarRelationFilter, DiagnosticReportWhereInput> | null
  }, "id">

  export type DosingLogOrderByWithAggregationInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    source?: SortOrder
    pumpType?: SortOrder
    durationMs?: SortOrder
    rationale?: SortOrder
    mixingLockoutMin?: SortOrder
    diagnosticReportId?: SortOrderInput | SortOrder
    _count?: DosingLogCountOrderByAggregateInput
    _avg?: DosingLogAvgOrderByAggregateInput
    _max?: DosingLogMaxOrderByAggregateInput
    _min?: DosingLogMinOrderByAggregateInput
    _sum?: DosingLogSumOrderByAggregateInput
  }

  export type DosingLogScalarWhereWithAggregatesInput = {
    AND?: DosingLogScalarWhereWithAggregatesInput | DosingLogScalarWhereWithAggregatesInput[]
    OR?: DosingLogScalarWhereWithAggregatesInput[]
    NOT?: DosingLogScalarWhereWithAggregatesInput | DosingLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DosingLog"> | string
    deviceId?: StringWithAggregatesFilter<"DosingLog"> | string
    timestamp?: DateTimeWithAggregatesFilter<"DosingLog"> | Date | string
    source?: EnumDosingSourceWithAggregatesFilter<"DosingLog"> | $Enums.DosingSource
    pumpType?: EnumPumpTypeWithAggregatesFilter<"DosingLog"> | $Enums.PumpType
    durationMs?: IntWithAggregatesFilter<"DosingLog"> | number
    rationale?: StringWithAggregatesFilter<"DosingLog"> | string
    mixingLockoutMin?: IntWithAggregatesFilter<"DosingLog"> | number
    diagnosticReportId?: StringNullableWithAggregatesFilter<"DosingLog"> | string | null
  }

  export type SystemAlertWhereInput = {
    AND?: SystemAlertWhereInput | SystemAlertWhereInput[]
    OR?: SystemAlertWhereInput[]
    NOT?: SystemAlertWhereInput | SystemAlertWhereInput[]
    id?: StringFilter<"SystemAlert"> | string
    deviceId?: StringFilter<"SystemAlert"> | string
    timestamp?: DateTimeFilter<"SystemAlert"> | Date | string
    alertType?: EnumAlertTypeFilter<"SystemAlert"> | $Enums.AlertType
    severity?: EnumSeverityLevelFilter<"SystemAlert"> | $Enums.SeverityLevel
    message?: StringFilter<"SystemAlert"> | string
    isResolved?: BoolFilter<"SystemAlert"> | boolean
    resolvedAt?: DateTimeNullableFilter<"SystemAlert"> | Date | string | null
    resolvedBy?: StringNullableFilter<"SystemAlert"> | string | null
    device?: XOR<DeviceScalarRelationFilter, DeviceWhereInput>
  }

  export type SystemAlertOrderByWithRelationInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    alertType?: SortOrder
    severity?: SortOrder
    message?: SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolvedBy?: SortOrderInput | SortOrder
    device?: DeviceOrderByWithRelationInput
  }

  export type SystemAlertWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SystemAlertWhereInput | SystemAlertWhereInput[]
    OR?: SystemAlertWhereInput[]
    NOT?: SystemAlertWhereInput | SystemAlertWhereInput[]
    deviceId?: StringFilter<"SystemAlert"> | string
    timestamp?: DateTimeFilter<"SystemAlert"> | Date | string
    alertType?: EnumAlertTypeFilter<"SystemAlert"> | $Enums.AlertType
    severity?: EnumSeverityLevelFilter<"SystemAlert"> | $Enums.SeverityLevel
    message?: StringFilter<"SystemAlert"> | string
    isResolved?: BoolFilter<"SystemAlert"> | boolean
    resolvedAt?: DateTimeNullableFilter<"SystemAlert"> | Date | string | null
    resolvedBy?: StringNullableFilter<"SystemAlert"> | string | null
    device?: XOR<DeviceScalarRelationFilter, DeviceWhereInput>
  }, "id">

  export type SystemAlertOrderByWithAggregationInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    alertType?: SortOrder
    severity?: SortOrder
    message?: SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolvedBy?: SortOrderInput | SortOrder
    _count?: SystemAlertCountOrderByAggregateInput
    _max?: SystemAlertMaxOrderByAggregateInput
    _min?: SystemAlertMinOrderByAggregateInput
  }

  export type SystemAlertScalarWhereWithAggregatesInput = {
    AND?: SystemAlertScalarWhereWithAggregatesInput | SystemAlertScalarWhereWithAggregatesInput[]
    OR?: SystemAlertScalarWhereWithAggregatesInput[]
    NOT?: SystemAlertScalarWhereWithAggregatesInput | SystemAlertScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SystemAlert"> | string
    deviceId?: StringWithAggregatesFilter<"SystemAlert"> | string
    timestamp?: DateTimeWithAggregatesFilter<"SystemAlert"> | Date | string
    alertType?: EnumAlertTypeWithAggregatesFilter<"SystemAlert"> | $Enums.AlertType
    severity?: EnumSeverityLevelWithAggregatesFilter<"SystemAlert"> | $Enums.SeverityLevel
    message?: StringWithAggregatesFilter<"SystemAlert"> | string
    isResolved?: BoolWithAggregatesFilter<"SystemAlert"> | boolean
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"SystemAlert"> | Date | string | null
    resolvedBy?: StringNullableWithAggregatesFilter<"SystemAlert"> | string | null
  }

  export type DeviceCreateInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    activeRecipe?: CropRecipeCreateNestedOneWithoutAssignedDevicesInput
    diagnosticReports?: DiagnosticReportCreateNestedManyWithoutDeviceInput
    dosingLogs?: DosingLogCreateNestedManyWithoutDeviceInput
    alerts?: SystemAlertCreateNestedManyWithoutDeviceInput
  }

  export type DeviceUncheckedCreateInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    activeRecipeId?: string | null
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    diagnosticReports?: DiagnosticReportUncheckedCreateNestedManyWithoutDeviceInput
    dosingLogs?: DosingLogUncheckedCreateNestedManyWithoutDeviceInput
    alerts?: SystemAlertUncheckedCreateNestedManyWithoutDeviceInput
  }

  export type DeviceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipe?: CropRecipeUpdateOneWithoutAssignedDevicesNestedInput
    diagnosticReports?: DiagnosticReportUpdateManyWithoutDeviceNestedInput
    dosingLogs?: DosingLogUpdateManyWithoutDeviceNestedInput
    alerts?: SystemAlertUpdateManyWithoutDeviceNestedInput
  }

  export type DeviceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipeId?: NullableStringFieldUpdateOperationsInput | string | null
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    diagnosticReports?: DiagnosticReportUncheckedUpdateManyWithoutDeviceNestedInput
    dosingLogs?: DosingLogUncheckedUpdateManyWithoutDeviceNestedInput
    alerts?: SystemAlertUncheckedUpdateManyWithoutDeviceNestedInput
  }

  export type DeviceCreateManyInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    activeRecipeId?: string | null
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
  }

  export type DeviceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeviceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipeId?: NullableStringFieldUpdateOperationsInput | string | null
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CropRecipeCreateInput = {
    id?: string
    cropName: string
    targetPhMin?: number
    targetPhMax?: number
    targetEcMin?: number
    targetEcMax?: number
    ecCeiling?: number
    minWaterLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    assignedDevices?: DeviceCreateNestedManyWithoutActiveRecipeInput
  }

  export type CropRecipeUncheckedCreateInput = {
    id?: string
    cropName: string
    targetPhMin?: number
    targetPhMax?: number
    targetEcMin?: number
    targetEcMax?: number
    ecCeiling?: number
    minWaterLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    assignedDevices?: DeviceUncheckedCreateNestedManyWithoutActiveRecipeInput
  }

  export type CropRecipeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cropName?: StringFieldUpdateOperationsInput | string
    targetPhMin?: FloatFieldUpdateOperationsInput | number
    targetPhMax?: FloatFieldUpdateOperationsInput | number
    targetEcMin?: FloatFieldUpdateOperationsInput | number
    targetEcMax?: FloatFieldUpdateOperationsInput | number
    ecCeiling?: FloatFieldUpdateOperationsInput | number
    minWaterLevel?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedDevices?: DeviceUpdateManyWithoutActiveRecipeNestedInput
  }

  export type CropRecipeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cropName?: StringFieldUpdateOperationsInput | string
    targetPhMin?: FloatFieldUpdateOperationsInput | number
    targetPhMax?: FloatFieldUpdateOperationsInput | number
    targetEcMin?: FloatFieldUpdateOperationsInput | number
    targetEcMax?: FloatFieldUpdateOperationsInput | number
    ecCeiling?: FloatFieldUpdateOperationsInput | number
    minWaterLevel?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedDevices?: DeviceUncheckedUpdateManyWithoutActiveRecipeNestedInput
  }

  export type CropRecipeCreateManyInput = {
    id?: string
    cropName: string
    targetPhMin?: number
    targetPhMax?: number
    targetEcMin?: number
    targetEcMax?: number
    ecCeiling?: number
    minWaterLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CropRecipeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    cropName?: StringFieldUpdateOperationsInput | string
    targetPhMin?: FloatFieldUpdateOperationsInput | number
    targetPhMax?: FloatFieldUpdateOperationsInput | number
    targetEcMin?: FloatFieldUpdateOperationsInput | number
    targetEcMax?: FloatFieldUpdateOperationsInput | number
    ecCeiling?: FloatFieldUpdateOperationsInput | number
    minWaterLevel?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CropRecipeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    cropName?: StringFieldUpdateOperationsInput | string
    targetPhMin?: FloatFieldUpdateOperationsInput | number
    targetPhMax?: FloatFieldUpdateOperationsInput | number
    targetEcMin?: FloatFieldUpdateOperationsInput | number
    targetEcMax?: FloatFieldUpdateOperationsInput | number
    ecCeiling?: FloatFieldUpdateOperationsInput | number
    minWaterLevel?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiagnosticReportCreateInput = {
    id?: string
    timestamp?: Date | string
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity?: $Enums.SeverityLevel
    classProbabilities: JsonNullValueInput | InputJsonValue
    actionTaken?: string | null
    cooldownActiveTill?: Date | string | null
    device: DeviceCreateNestedOneWithoutDiagnosticReportsInput
    dosingEvents?: DosingLogCreateNestedManyWithoutDiagnosticReportInput
  }

  export type DiagnosticReportUncheckedCreateInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity?: $Enums.SeverityLevel
    classProbabilities: JsonNullValueInput | InputJsonValue
    actionTaken?: string | null
    cooldownActiveTill?: Date | string | null
    dosingEvents?: DosingLogUncheckedCreateNestedManyWithoutDiagnosticReportInput
  }

  export type DiagnosticReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    device?: DeviceUpdateOneRequiredWithoutDiagnosticReportsNestedInput
    dosingEvents?: DosingLogUpdateManyWithoutDiagnosticReportNestedInput
  }

  export type DiagnosticReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dosingEvents?: DosingLogUncheckedUpdateManyWithoutDiagnosticReportNestedInput
  }

  export type DiagnosticReportCreateManyInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity?: $Enums.SeverityLevel
    classProbabilities: JsonNullValueInput | InputJsonValue
    actionTaken?: string | null
    cooldownActiveTill?: Date | string | null
  }

  export type DiagnosticReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DiagnosticReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DosingLogCreateInput = {
    id?: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
    device: DeviceCreateNestedOneWithoutDosingLogsInput
    diagnosticReport?: DiagnosticReportCreateNestedOneWithoutDosingEventsInput
  }

  export type DosingLogUncheckedCreateInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
    diagnosticReportId?: string | null
  }

  export type DosingLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
    device?: DeviceUpdateOneRequiredWithoutDosingLogsNestedInput
    diagnosticReport?: DiagnosticReportUpdateOneWithoutDosingEventsNestedInput
  }

  export type DosingLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
    diagnosticReportId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DosingLogCreateManyInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
    diagnosticReportId?: string | null
  }

  export type DosingLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
  }

  export type DosingLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
    diagnosticReportId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemAlertCreateInput = {
    id?: string
    timestamp?: Date | string
    alertType: $Enums.AlertType
    severity?: $Enums.SeverityLevel
    message: string
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    device: DeviceCreateNestedOneWithoutAlertsInput
  }

  export type SystemAlertUncheckedCreateInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    alertType: $Enums.AlertType
    severity?: $Enums.SeverityLevel
    message: string
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
  }

  export type SystemAlertUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    message?: StringFieldUpdateOperationsInput | string
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    device?: DeviceUpdateOneRequiredWithoutAlertsNestedInput
  }

  export type SystemAlertUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    message?: StringFieldUpdateOperationsInput | string
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemAlertCreateManyInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    alertType: $Enums.AlertType
    severity?: $Enums.SeverityLevel
    message: string
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
  }

  export type SystemAlertUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    message?: StringFieldUpdateOperationsInput | string
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemAlertUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    message?: StringFieldUpdateOperationsInput | string
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type CropRecipeNullableScalarRelationFilter = {
    is?: CropRecipeWhereInput | null
    isNot?: CropRecipeWhereInput | null
  }

  export type DiagnosticReportListRelationFilter = {
    every?: DiagnosticReportWhereInput
    some?: DiagnosticReportWhereInput
    none?: DiagnosticReportWhereInput
  }

  export type DosingLogListRelationFilter = {
    every?: DosingLogWhereInput
    some?: DosingLogWhereInput
    none?: DosingLogWhereInput
  }

  export type SystemAlertListRelationFilter = {
    every?: SystemAlertWhereInput
    some?: SystemAlertWhereInput
    none?: SystemAlertWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DiagnosticReportOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DosingLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SystemAlertOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DeviceCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
    activeRecipeId?: SortOrder
    circulationMode?: SortOrder
    circRunMin?: SortOrder
    circRestMin?: SortOrder
    circUpdatedAt?: SortOrder
  }

  export type DeviceAvgOrderByAggregateInput = {
    circRunMin?: SortOrder
    circRestMin?: SortOrder
  }

  export type DeviceMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
    activeRecipeId?: SortOrder
    circulationMode?: SortOrder
    circRunMin?: SortOrder
    circRestMin?: SortOrder
    circUpdatedAt?: SortOrder
  }

  export type DeviceMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    isOnline?: SortOrder
    createdAt?: SortOrder
    activeRecipeId?: SortOrder
    circulationMode?: SortOrder
    circRunMin?: SortOrder
    circRestMin?: SortOrder
    circUpdatedAt?: SortOrder
  }

  export type DeviceSumOrderByAggregateInput = {
    circRunMin?: SortOrder
    circRestMin?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DeviceListRelationFilter = {
    every?: DeviceWhereInput
    some?: DeviceWhereInput
    none?: DeviceWhereInput
  }

  export type DeviceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CropRecipeCountOrderByAggregateInput = {
    id?: SortOrder
    cropName?: SortOrder
    targetPhMin?: SortOrder
    targetPhMax?: SortOrder
    targetEcMin?: SortOrder
    targetEcMax?: SortOrder
    ecCeiling?: SortOrder
    minWaterLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CropRecipeAvgOrderByAggregateInput = {
    targetPhMin?: SortOrder
    targetPhMax?: SortOrder
    targetEcMin?: SortOrder
    targetEcMax?: SortOrder
    ecCeiling?: SortOrder
    minWaterLevel?: SortOrder
  }

  export type CropRecipeMaxOrderByAggregateInput = {
    id?: SortOrder
    cropName?: SortOrder
    targetPhMin?: SortOrder
    targetPhMax?: SortOrder
    targetEcMin?: SortOrder
    targetEcMax?: SortOrder
    ecCeiling?: SortOrder
    minWaterLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CropRecipeMinOrderByAggregateInput = {
    id?: SortOrder
    cropName?: SortOrder
    targetPhMin?: SortOrder
    targetPhMax?: SortOrder
    targetEcMin?: SortOrder
    targetEcMax?: SortOrder
    ecCeiling?: SortOrder
    minWaterLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CropRecipeSumOrderByAggregateInput = {
    targetPhMin?: SortOrder
    targetPhMax?: SortOrder
    targetEcMin?: SortOrder
    targetEcMax?: SortOrder
    ecCeiling?: SortOrder
    minWaterLevel?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumSeverityLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.SeverityLevel | EnumSeverityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumSeverityLevelFilter<$PrismaModel> | $Enums.SeverityLevel
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DeviceScalarRelationFilter = {
    is?: DeviceWhereInput
    isNot?: DeviceWhereInput
  }

  export type DiagnosticReportCountOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    imageUrl?: SortOrder
    primaryLabel?: SortOrder
    confidence?: SortOrder
    severity?: SortOrder
    classProbabilities?: SortOrder
    actionTaken?: SortOrder
    cooldownActiveTill?: SortOrder
  }

  export type DiagnosticReportAvgOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type DiagnosticReportMaxOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    imageUrl?: SortOrder
    primaryLabel?: SortOrder
    confidence?: SortOrder
    severity?: SortOrder
    actionTaken?: SortOrder
    cooldownActiveTill?: SortOrder
  }

  export type DiagnosticReportMinOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    imageUrl?: SortOrder
    primaryLabel?: SortOrder
    confidence?: SortOrder
    severity?: SortOrder
    actionTaken?: SortOrder
    cooldownActiveTill?: SortOrder
  }

  export type DiagnosticReportSumOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type EnumSeverityLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SeverityLevel | EnumSeverityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumSeverityLevelWithAggregatesFilter<$PrismaModel> | $Enums.SeverityLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSeverityLevelFilter<$PrismaModel>
    _max?: NestedEnumSeverityLevelFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumDosingSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.DosingSource | EnumDosingSourceFieldRefInput<$PrismaModel>
    in?: $Enums.DosingSource[] | ListEnumDosingSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.DosingSource[] | ListEnumDosingSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumDosingSourceFilter<$PrismaModel> | $Enums.DosingSource
  }

  export type EnumPumpTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PumpType | EnumPumpTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PumpType[] | ListEnumPumpTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PumpType[] | ListEnumPumpTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPumpTypeFilter<$PrismaModel> | $Enums.PumpType
  }

  export type DiagnosticReportNullableScalarRelationFilter = {
    is?: DiagnosticReportWhereInput | null
    isNot?: DiagnosticReportWhereInput | null
  }

  export type DosingLogCountOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    source?: SortOrder
    pumpType?: SortOrder
    durationMs?: SortOrder
    rationale?: SortOrder
    mixingLockoutMin?: SortOrder
    diagnosticReportId?: SortOrder
  }

  export type DosingLogAvgOrderByAggregateInput = {
    durationMs?: SortOrder
    mixingLockoutMin?: SortOrder
  }

  export type DosingLogMaxOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    source?: SortOrder
    pumpType?: SortOrder
    durationMs?: SortOrder
    rationale?: SortOrder
    mixingLockoutMin?: SortOrder
    diagnosticReportId?: SortOrder
  }

  export type DosingLogMinOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    source?: SortOrder
    pumpType?: SortOrder
    durationMs?: SortOrder
    rationale?: SortOrder
    mixingLockoutMin?: SortOrder
    diagnosticReportId?: SortOrder
  }

  export type DosingLogSumOrderByAggregateInput = {
    durationMs?: SortOrder
    mixingLockoutMin?: SortOrder
  }

  export type EnumDosingSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DosingSource | EnumDosingSourceFieldRefInput<$PrismaModel>
    in?: $Enums.DosingSource[] | ListEnumDosingSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.DosingSource[] | ListEnumDosingSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumDosingSourceWithAggregatesFilter<$PrismaModel> | $Enums.DosingSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDosingSourceFilter<$PrismaModel>
    _max?: NestedEnumDosingSourceFilter<$PrismaModel>
  }

  export type EnumPumpTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PumpType | EnumPumpTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PumpType[] | ListEnumPumpTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PumpType[] | ListEnumPumpTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPumpTypeWithAggregatesFilter<$PrismaModel> | $Enums.PumpType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPumpTypeFilter<$PrismaModel>
    _max?: NestedEnumPumpTypeFilter<$PrismaModel>
  }

  export type EnumAlertTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertType | EnumAlertTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertTypeFilter<$PrismaModel> | $Enums.AlertType
  }

  export type SystemAlertCountOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    alertType?: SortOrder
    severity?: SortOrder
    message?: SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
  }

  export type SystemAlertMaxOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    alertType?: SortOrder
    severity?: SortOrder
    message?: SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
  }

  export type SystemAlertMinOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    timestamp?: SortOrder
    alertType?: SortOrder
    severity?: SortOrder
    message?: SortOrder
    isResolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
  }

  export type EnumAlertTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertType | EnumAlertTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertTypeWithAggregatesFilter<$PrismaModel> | $Enums.AlertType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertTypeFilter<$PrismaModel>
    _max?: NestedEnumAlertTypeFilter<$PrismaModel>
  }

  export type CropRecipeCreateNestedOneWithoutAssignedDevicesInput = {
    create?: XOR<CropRecipeCreateWithoutAssignedDevicesInput, CropRecipeUncheckedCreateWithoutAssignedDevicesInput>
    connectOrCreate?: CropRecipeCreateOrConnectWithoutAssignedDevicesInput
    connect?: CropRecipeWhereUniqueInput
  }

  export type DiagnosticReportCreateNestedManyWithoutDeviceInput = {
    create?: XOR<DiagnosticReportCreateWithoutDeviceInput, DiagnosticReportUncheckedCreateWithoutDeviceInput> | DiagnosticReportCreateWithoutDeviceInput[] | DiagnosticReportUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: DiagnosticReportCreateOrConnectWithoutDeviceInput | DiagnosticReportCreateOrConnectWithoutDeviceInput[]
    createMany?: DiagnosticReportCreateManyDeviceInputEnvelope
    connect?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
  }

  export type DosingLogCreateNestedManyWithoutDeviceInput = {
    create?: XOR<DosingLogCreateWithoutDeviceInput, DosingLogUncheckedCreateWithoutDeviceInput> | DosingLogCreateWithoutDeviceInput[] | DosingLogUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: DosingLogCreateOrConnectWithoutDeviceInput | DosingLogCreateOrConnectWithoutDeviceInput[]
    createMany?: DosingLogCreateManyDeviceInputEnvelope
    connect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
  }

  export type SystemAlertCreateNestedManyWithoutDeviceInput = {
    create?: XOR<SystemAlertCreateWithoutDeviceInput, SystemAlertUncheckedCreateWithoutDeviceInput> | SystemAlertCreateWithoutDeviceInput[] | SystemAlertUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: SystemAlertCreateOrConnectWithoutDeviceInput | SystemAlertCreateOrConnectWithoutDeviceInput[]
    createMany?: SystemAlertCreateManyDeviceInputEnvelope
    connect?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
  }

  export type DiagnosticReportUncheckedCreateNestedManyWithoutDeviceInput = {
    create?: XOR<DiagnosticReportCreateWithoutDeviceInput, DiagnosticReportUncheckedCreateWithoutDeviceInput> | DiagnosticReportCreateWithoutDeviceInput[] | DiagnosticReportUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: DiagnosticReportCreateOrConnectWithoutDeviceInput | DiagnosticReportCreateOrConnectWithoutDeviceInput[]
    createMany?: DiagnosticReportCreateManyDeviceInputEnvelope
    connect?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
  }

  export type DosingLogUncheckedCreateNestedManyWithoutDeviceInput = {
    create?: XOR<DosingLogCreateWithoutDeviceInput, DosingLogUncheckedCreateWithoutDeviceInput> | DosingLogCreateWithoutDeviceInput[] | DosingLogUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: DosingLogCreateOrConnectWithoutDeviceInput | DosingLogCreateOrConnectWithoutDeviceInput[]
    createMany?: DosingLogCreateManyDeviceInputEnvelope
    connect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
  }

  export type SystemAlertUncheckedCreateNestedManyWithoutDeviceInput = {
    create?: XOR<SystemAlertCreateWithoutDeviceInput, SystemAlertUncheckedCreateWithoutDeviceInput> | SystemAlertCreateWithoutDeviceInput[] | SystemAlertUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: SystemAlertCreateOrConnectWithoutDeviceInput | SystemAlertCreateOrConnectWithoutDeviceInput[]
    createMany?: SystemAlertCreateManyDeviceInputEnvelope
    connect?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CropRecipeUpdateOneWithoutAssignedDevicesNestedInput = {
    create?: XOR<CropRecipeCreateWithoutAssignedDevicesInput, CropRecipeUncheckedCreateWithoutAssignedDevicesInput>
    connectOrCreate?: CropRecipeCreateOrConnectWithoutAssignedDevicesInput
    upsert?: CropRecipeUpsertWithoutAssignedDevicesInput
    disconnect?: CropRecipeWhereInput | boolean
    delete?: CropRecipeWhereInput | boolean
    connect?: CropRecipeWhereUniqueInput
    update?: XOR<XOR<CropRecipeUpdateToOneWithWhereWithoutAssignedDevicesInput, CropRecipeUpdateWithoutAssignedDevicesInput>, CropRecipeUncheckedUpdateWithoutAssignedDevicesInput>
  }

  export type DiagnosticReportUpdateManyWithoutDeviceNestedInput = {
    create?: XOR<DiagnosticReportCreateWithoutDeviceInput, DiagnosticReportUncheckedCreateWithoutDeviceInput> | DiagnosticReportCreateWithoutDeviceInput[] | DiagnosticReportUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: DiagnosticReportCreateOrConnectWithoutDeviceInput | DiagnosticReportCreateOrConnectWithoutDeviceInput[]
    upsert?: DiagnosticReportUpsertWithWhereUniqueWithoutDeviceInput | DiagnosticReportUpsertWithWhereUniqueWithoutDeviceInput[]
    createMany?: DiagnosticReportCreateManyDeviceInputEnvelope
    set?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
    disconnect?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
    delete?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
    connect?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
    update?: DiagnosticReportUpdateWithWhereUniqueWithoutDeviceInput | DiagnosticReportUpdateWithWhereUniqueWithoutDeviceInput[]
    updateMany?: DiagnosticReportUpdateManyWithWhereWithoutDeviceInput | DiagnosticReportUpdateManyWithWhereWithoutDeviceInput[]
    deleteMany?: DiagnosticReportScalarWhereInput | DiagnosticReportScalarWhereInput[]
  }

  export type DosingLogUpdateManyWithoutDeviceNestedInput = {
    create?: XOR<DosingLogCreateWithoutDeviceInput, DosingLogUncheckedCreateWithoutDeviceInput> | DosingLogCreateWithoutDeviceInput[] | DosingLogUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: DosingLogCreateOrConnectWithoutDeviceInput | DosingLogCreateOrConnectWithoutDeviceInput[]
    upsert?: DosingLogUpsertWithWhereUniqueWithoutDeviceInput | DosingLogUpsertWithWhereUniqueWithoutDeviceInput[]
    createMany?: DosingLogCreateManyDeviceInputEnvelope
    set?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    disconnect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    delete?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    connect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    update?: DosingLogUpdateWithWhereUniqueWithoutDeviceInput | DosingLogUpdateWithWhereUniqueWithoutDeviceInput[]
    updateMany?: DosingLogUpdateManyWithWhereWithoutDeviceInput | DosingLogUpdateManyWithWhereWithoutDeviceInput[]
    deleteMany?: DosingLogScalarWhereInput | DosingLogScalarWhereInput[]
  }

  export type SystemAlertUpdateManyWithoutDeviceNestedInput = {
    create?: XOR<SystemAlertCreateWithoutDeviceInput, SystemAlertUncheckedCreateWithoutDeviceInput> | SystemAlertCreateWithoutDeviceInput[] | SystemAlertUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: SystemAlertCreateOrConnectWithoutDeviceInput | SystemAlertCreateOrConnectWithoutDeviceInput[]
    upsert?: SystemAlertUpsertWithWhereUniqueWithoutDeviceInput | SystemAlertUpsertWithWhereUniqueWithoutDeviceInput[]
    createMany?: SystemAlertCreateManyDeviceInputEnvelope
    set?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
    disconnect?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
    delete?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
    connect?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
    update?: SystemAlertUpdateWithWhereUniqueWithoutDeviceInput | SystemAlertUpdateWithWhereUniqueWithoutDeviceInput[]
    updateMany?: SystemAlertUpdateManyWithWhereWithoutDeviceInput | SystemAlertUpdateManyWithWhereWithoutDeviceInput[]
    deleteMany?: SystemAlertScalarWhereInput | SystemAlertScalarWhereInput[]
  }

  export type DiagnosticReportUncheckedUpdateManyWithoutDeviceNestedInput = {
    create?: XOR<DiagnosticReportCreateWithoutDeviceInput, DiagnosticReportUncheckedCreateWithoutDeviceInput> | DiagnosticReportCreateWithoutDeviceInput[] | DiagnosticReportUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: DiagnosticReportCreateOrConnectWithoutDeviceInput | DiagnosticReportCreateOrConnectWithoutDeviceInput[]
    upsert?: DiagnosticReportUpsertWithWhereUniqueWithoutDeviceInput | DiagnosticReportUpsertWithWhereUniqueWithoutDeviceInput[]
    createMany?: DiagnosticReportCreateManyDeviceInputEnvelope
    set?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
    disconnect?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
    delete?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
    connect?: DiagnosticReportWhereUniqueInput | DiagnosticReportWhereUniqueInput[]
    update?: DiagnosticReportUpdateWithWhereUniqueWithoutDeviceInput | DiagnosticReportUpdateWithWhereUniqueWithoutDeviceInput[]
    updateMany?: DiagnosticReportUpdateManyWithWhereWithoutDeviceInput | DiagnosticReportUpdateManyWithWhereWithoutDeviceInput[]
    deleteMany?: DiagnosticReportScalarWhereInput | DiagnosticReportScalarWhereInput[]
  }

  export type DosingLogUncheckedUpdateManyWithoutDeviceNestedInput = {
    create?: XOR<DosingLogCreateWithoutDeviceInput, DosingLogUncheckedCreateWithoutDeviceInput> | DosingLogCreateWithoutDeviceInput[] | DosingLogUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: DosingLogCreateOrConnectWithoutDeviceInput | DosingLogCreateOrConnectWithoutDeviceInput[]
    upsert?: DosingLogUpsertWithWhereUniqueWithoutDeviceInput | DosingLogUpsertWithWhereUniqueWithoutDeviceInput[]
    createMany?: DosingLogCreateManyDeviceInputEnvelope
    set?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    disconnect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    delete?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    connect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    update?: DosingLogUpdateWithWhereUniqueWithoutDeviceInput | DosingLogUpdateWithWhereUniqueWithoutDeviceInput[]
    updateMany?: DosingLogUpdateManyWithWhereWithoutDeviceInput | DosingLogUpdateManyWithWhereWithoutDeviceInput[]
    deleteMany?: DosingLogScalarWhereInput | DosingLogScalarWhereInput[]
  }

  export type SystemAlertUncheckedUpdateManyWithoutDeviceNestedInput = {
    create?: XOR<SystemAlertCreateWithoutDeviceInput, SystemAlertUncheckedCreateWithoutDeviceInput> | SystemAlertCreateWithoutDeviceInput[] | SystemAlertUncheckedCreateWithoutDeviceInput[]
    connectOrCreate?: SystemAlertCreateOrConnectWithoutDeviceInput | SystemAlertCreateOrConnectWithoutDeviceInput[]
    upsert?: SystemAlertUpsertWithWhereUniqueWithoutDeviceInput | SystemAlertUpsertWithWhereUniqueWithoutDeviceInput[]
    createMany?: SystemAlertCreateManyDeviceInputEnvelope
    set?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
    disconnect?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
    delete?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
    connect?: SystemAlertWhereUniqueInput | SystemAlertWhereUniqueInput[]
    update?: SystemAlertUpdateWithWhereUniqueWithoutDeviceInput | SystemAlertUpdateWithWhereUniqueWithoutDeviceInput[]
    updateMany?: SystemAlertUpdateManyWithWhereWithoutDeviceInput | SystemAlertUpdateManyWithWhereWithoutDeviceInput[]
    deleteMany?: SystemAlertScalarWhereInput | SystemAlertScalarWhereInput[]
  }

  export type DeviceCreateNestedManyWithoutActiveRecipeInput = {
    create?: XOR<DeviceCreateWithoutActiveRecipeInput, DeviceUncheckedCreateWithoutActiveRecipeInput> | DeviceCreateWithoutActiveRecipeInput[] | DeviceUncheckedCreateWithoutActiveRecipeInput[]
    connectOrCreate?: DeviceCreateOrConnectWithoutActiveRecipeInput | DeviceCreateOrConnectWithoutActiveRecipeInput[]
    createMany?: DeviceCreateManyActiveRecipeInputEnvelope
    connect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
  }

  export type DeviceUncheckedCreateNestedManyWithoutActiveRecipeInput = {
    create?: XOR<DeviceCreateWithoutActiveRecipeInput, DeviceUncheckedCreateWithoutActiveRecipeInput> | DeviceCreateWithoutActiveRecipeInput[] | DeviceUncheckedCreateWithoutActiveRecipeInput[]
    connectOrCreate?: DeviceCreateOrConnectWithoutActiveRecipeInput | DeviceCreateOrConnectWithoutActiveRecipeInput[]
    createMany?: DeviceCreateManyActiveRecipeInputEnvelope
    connect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DeviceUpdateManyWithoutActiveRecipeNestedInput = {
    create?: XOR<DeviceCreateWithoutActiveRecipeInput, DeviceUncheckedCreateWithoutActiveRecipeInput> | DeviceCreateWithoutActiveRecipeInput[] | DeviceUncheckedCreateWithoutActiveRecipeInput[]
    connectOrCreate?: DeviceCreateOrConnectWithoutActiveRecipeInput | DeviceCreateOrConnectWithoutActiveRecipeInput[]
    upsert?: DeviceUpsertWithWhereUniqueWithoutActiveRecipeInput | DeviceUpsertWithWhereUniqueWithoutActiveRecipeInput[]
    createMany?: DeviceCreateManyActiveRecipeInputEnvelope
    set?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
    disconnect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
    delete?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
    connect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
    update?: DeviceUpdateWithWhereUniqueWithoutActiveRecipeInput | DeviceUpdateWithWhereUniqueWithoutActiveRecipeInput[]
    updateMany?: DeviceUpdateManyWithWhereWithoutActiveRecipeInput | DeviceUpdateManyWithWhereWithoutActiveRecipeInput[]
    deleteMany?: DeviceScalarWhereInput | DeviceScalarWhereInput[]
  }

  export type DeviceUncheckedUpdateManyWithoutActiveRecipeNestedInput = {
    create?: XOR<DeviceCreateWithoutActiveRecipeInput, DeviceUncheckedCreateWithoutActiveRecipeInput> | DeviceCreateWithoutActiveRecipeInput[] | DeviceUncheckedCreateWithoutActiveRecipeInput[]
    connectOrCreate?: DeviceCreateOrConnectWithoutActiveRecipeInput | DeviceCreateOrConnectWithoutActiveRecipeInput[]
    upsert?: DeviceUpsertWithWhereUniqueWithoutActiveRecipeInput | DeviceUpsertWithWhereUniqueWithoutActiveRecipeInput[]
    createMany?: DeviceCreateManyActiveRecipeInputEnvelope
    set?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
    disconnect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
    delete?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
    connect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[]
    update?: DeviceUpdateWithWhereUniqueWithoutActiveRecipeInput | DeviceUpdateWithWhereUniqueWithoutActiveRecipeInput[]
    updateMany?: DeviceUpdateManyWithWhereWithoutActiveRecipeInput | DeviceUpdateManyWithWhereWithoutActiveRecipeInput[]
    deleteMany?: DeviceScalarWhereInput | DeviceScalarWhereInput[]
  }

  export type DeviceCreateNestedOneWithoutDiagnosticReportsInput = {
    create?: XOR<DeviceCreateWithoutDiagnosticReportsInput, DeviceUncheckedCreateWithoutDiagnosticReportsInput>
    connectOrCreate?: DeviceCreateOrConnectWithoutDiagnosticReportsInput
    connect?: DeviceWhereUniqueInput
  }

  export type DosingLogCreateNestedManyWithoutDiagnosticReportInput = {
    create?: XOR<DosingLogCreateWithoutDiagnosticReportInput, DosingLogUncheckedCreateWithoutDiagnosticReportInput> | DosingLogCreateWithoutDiagnosticReportInput[] | DosingLogUncheckedCreateWithoutDiagnosticReportInput[]
    connectOrCreate?: DosingLogCreateOrConnectWithoutDiagnosticReportInput | DosingLogCreateOrConnectWithoutDiagnosticReportInput[]
    createMany?: DosingLogCreateManyDiagnosticReportInputEnvelope
    connect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
  }

  export type DosingLogUncheckedCreateNestedManyWithoutDiagnosticReportInput = {
    create?: XOR<DosingLogCreateWithoutDiagnosticReportInput, DosingLogUncheckedCreateWithoutDiagnosticReportInput> | DosingLogCreateWithoutDiagnosticReportInput[] | DosingLogUncheckedCreateWithoutDiagnosticReportInput[]
    connectOrCreate?: DosingLogCreateOrConnectWithoutDiagnosticReportInput | DosingLogCreateOrConnectWithoutDiagnosticReportInput[]
    createMany?: DosingLogCreateManyDiagnosticReportInputEnvelope
    connect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
  }

  export type EnumSeverityLevelFieldUpdateOperationsInput = {
    set?: $Enums.SeverityLevel
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DeviceUpdateOneRequiredWithoutDiagnosticReportsNestedInput = {
    create?: XOR<DeviceCreateWithoutDiagnosticReportsInput, DeviceUncheckedCreateWithoutDiagnosticReportsInput>
    connectOrCreate?: DeviceCreateOrConnectWithoutDiagnosticReportsInput
    upsert?: DeviceUpsertWithoutDiagnosticReportsInput
    connect?: DeviceWhereUniqueInput
    update?: XOR<XOR<DeviceUpdateToOneWithWhereWithoutDiagnosticReportsInput, DeviceUpdateWithoutDiagnosticReportsInput>, DeviceUncheckedUpdateWithoutDiagnosticReportsInput>
  }

  export type DosingLogUpdateManyWithoutDiagnosticReportNestedInput = {
    create?: XOR<DosingLogCreateWithoutDiagnosticReportInput, DosingLogUncheckedCreateWithoutDiagnosticReportInput> | DosingLogCreateWithoutDiagnosticReportInput[] | DosingLogUncheckedCreateWithoutDiagnosticReportInput[]
    connectOrCreate?: DosingLogCreateOrConnectWithoutDiagnosticReportInput | DosingLogCreateOrConnectWithoutDiagnosticReportInput[]
    upsert?: DosingLogUpsertWithWhereUniqueWithoutDiagnosticReportInput | DosingLogUpsertWithWhereUniqueWithoutDiagnosticReportInput[]
    createMany?: DosingLogCreateManyDiagnosticReportInputEnvelope
    set?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    disconnect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    delete?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    connect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    update?: DosingLogUpdateWithWhereUniqueWithoutDiagnosticReportInput | DosingLogUpdateWithWhereUniqueWithoutDiagnosticReportInput[]
    updateMany?: DosingLogUpdateManyWithWhereWithoutDiagnosticReportInput | DosingLogUpdateManyWithWhereWithoutDiagnosticReportInput[]
    deleteMany?: DosingLogScalarWhereInput | DosingLogScalarWhereInput[]
  }

  export type DosingLogUncheckedUpdateManyWithoutDiagnosticReportNestedInput = {
    create?: XOR<DosingLogCreateWithoutDiagnosticReportInput, DosingLogUncheckedCreateWithoutDiagnosticReportInput> | DosingLogCreateWithoutDiagnosticReportInput[] | DosingLogUncheckedCreateWithoutDiagnosticReportInput[]
    connectOrCreate?: DosingLogCreateOrConnectWithoutDiagnosticReportInput | DosingLogCreateOrConnectWithoutDiagnosticReportInput[]
    upsert?: DosingLogUpsertWithWhereUniqueWithoutDiagnosticReportInput | DosingLogUpsertWithWhereUniqueWithoutDiagnosticReportInput[]
    createMany?: DosingLogCreateManyDiagnosticReportInputEnvelope
    set?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    disconnect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    delete?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    connect?: DosingLogWhereUniqueInput | DosingLogWhereUniqueInput[]
    update?: DosingLogUpdateWithWhereUniqueWithoutDiagnosticReportInput | DosingLogUpdateWithWhereUniqueWithoutDiagnosticReportInput[]
    updateMany?: DosingLogUpdateManyWithWhereWithoutDiagnosticReportInput | DosingLogUpdateManyWithWhereWithoutDiagnosticReportInput[]
    deleteMany?: DosingLogScalarWhereInput | DosingLogScalarWhereInput[]
  }

  export type DeviceCreateNestedOneWithoutDosingLogsInput = {
    create?: XOR<DeviceCreateWithoutDosingLogsInput, DeviceUncheckedCreateWithoutDosingLogsInput>
    connectOrCreate?: DeviceCreateOrConnectWithoutDosingLogsInput
    connect?: DeviceWhereUniqueInput
  }

  export type DiagnosticReportCreateNestedOneWithoutDosingEventsInput = {
    create?: XOR<DiagnosticReportCreateWithoutDosingEventsInput, DiagnosticReportUncheckedCreateWithoutDosingEventsInput>
    connectOrCreate?: DiagnosticReportCreateOrConnectWithoutDosingEventsInput
    connect?: DiagnosticReportWhereUniqueInput
  }

  export type EnumDosingSourceFieldUpdateOperationsInput = {
    set?: $Enums.DosingSource
  }

  export type EnumPumpTypeFieldUpdateOperationsInput = {
    set?: $Enums.PumpType
  }

  export type DeviceUpdateOneRequiredWithoutDosingLogsNestedInput = {
    create?: XOR<DeviceCreateWithoutDosingLogsInput, DeviceUncheckedCreateWithoutDosingLogsInput>
    connectOrCreate?: DeviceCreateOrConnectWithoutDosingLogsInput
    upsert?: DeviceUpsertWithoutDosingLogsInput
    connect?: DeviceWhereUniqueInput
    update?: XOR<XOR<DeviceUpdateToOneWithWhereWithoutDosingLogsInput, DeviceUpdateWithoutDosingLogsInput>, DeviceUncheckedUpdateWithoutDosingLogsInput>
  }

  export type DiagnosticReportUpdateOneWithoutDosingEventsNestedInput = {
    create?: XOR<DiagnosticReportCreateWithoutDosingEventsInput, DiagnosticReportUncheckedCreateWithoutDosingEventsInput>
    connectOrCreate?: DiagnosticReportCreateOrConnectWithoutDosingEventsInput
    upsert?: DiagnosticReportUpsertWithoutDosingEventsInput
    disconnect?: DiagnosticReportWhereInput | boolean
    delete?: DiagnosticReportWhereInput | boolean
    connect?: DiagnosticReportWhereUniqueInput
    update?: XOR<XOR<DiagnosticReportUpdateToOneWithWhereWithoutDosingEventsInput, DiagnosticReportUpdateWithoutDosingEventsInput>, DiagnosticReportUncheckedUpdateWithoutDosingEventsInput>
  }

  export type DeviceCreateNestedOneWithoutAlertsInput = {
    create?: XOR<DeviceCreateWithoutAlertsInput, DeviceUncheckedCreateWithoutAlertsInput>
    connectOrCreate?: DeviceCreateOrConnectWithoutAlertsInput
    connect?: DeviceWhereUniqueInput
  }

  export type EnumAlertTypeFieldUpdateOperationsInput = {
    set?: $Enums.AlertType
  }

  export type DeviceUpdateOneRequiredWithoutAlertsNestedInput = {
    create?: XOR<DeviceCreateWithoutAlertsInput, DeviceUncheckedCreateWithoutAlertsInput>
    connectOrCreate?: DeviceCreateOrConnectWithoutAlertsInput
    upsert?: DeviceUpsertWithoutAlertsInput
    connect?: DeviceWhereUniqueInput
    update?: XOR<XOR<DeviceUpdateToOneWithWhereWithoutAlertsInput, DeviceUpdateWithoutAlertsInput>, DeviceUncheckedUpdateWithoutAlertsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumSeverityLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.SeverityLevel | EnumSeverityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumSeverityLevelFilter<$PrismaModel> | $Enums.SeverityLevel
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumSeverityLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SeverityLevel | EnumSeverityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumSeverityLevelWithAggregatesFilter<$PrismaModel> | $Enums.SeverityLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSeverityLevelFilter<$PrismaModel>
    _max?: NestedEnumSeverityLevelFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumDosingSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.DosingSource | EnumDosingSourceFieldRefInput<$PrismaModel>
    in?: $Enums.DosingSource[] | ListEnumDosingSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.DosingSource[] | ListEnumDosingSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumDosingSourceFilter<$PrismaModel> | $Enums.DosingSource
  }

  export type NestedEnumPumpTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PumpType | EnumPumpTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PumpType[] | ListEnumPumpTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PumpType[] | ListEnumPumpTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPumpTypeFilter<$PrismaModel> | $Enums.PumpType
  }

  export type NestedEnumDosingSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DosingSource | EnumDosingSourceFieldRefInput<$PrismaModel>
    in?: $Enums.DosingSource[] | ListEnumDosingSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.DosingSource[] | ListEnumDosingSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumDosingSourceWithAggregatesFilter<$PrismaModel> | $Enums.DosingSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDosingSourceFilter<$PrismaModel>
    _max?: NestedEnumDosingSourceFilter<$PrismaModel>
  }

  export type NestedEnumPumpTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PumpType | EnumPumpTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PumpType[] | ListEnumPumpTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PumpType[] | ListEnumPumpTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPumpTypeWithAggregatesFilter<$PrismaModel> | $Enums.PumpType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPumpTypeFilter<$PrismaModel>
    _max?: NestedEnumPumpTypeFilter<$PrismaModel>
  }

  export type NestedEnumAlertTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertType | EnumAlertTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertTypeFilter<$PrismaModel> | $Enums.AlertType
  }

  export type NestedEnumAlertTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertType | EnumAlertTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertTypeWithAggregatesFilter<$PrismaModel> | $Enums.AlertType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertTypeFilter<$PrismaModel>
    _max?: NestedEnumAlertTypeFilter<$PrismaModel>
  }

  export type CropRecipeCreateWithoutAssignedDevicesInput = {
    id?: string
    cropName: string
    targetPhMin?: number
    targetPhMax?: number
    targetEcMin?: number
    targetEcMax?: number
    ecCeiling?: number
    minWaterLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CropRecipeUncheckedCreateWithoutAssignedDevicesInput = {
    id?: string
    cropName: string
    targetPhMin?: number
    targetPhMax?: number
    targetEcMin?: number
    targetEcMax?: number
    ecCeiling?: number
    minWaterLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CropRecipeCreateOrConnectWithoutAssignedDevicesInput = {
    where: CropRecipeWhereUniqueInput
    create: XOR<CropRecipeCreateWithoutAssignedDevicesInput, CropRecipeUncheckedCreateWithoutAssignedDevicesInput>
  }

  export type DiagnosticReportCreateWithoutDeviceInput = {
    id?: string
    timestamp?: Date | string
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity?: $Enums.SeverityLevel
    classProbabilities: JsonNullValueInput | InputJsonValue
    actionTaken?: string | null
    cooldownActiveTill?: Date | string | null
    dosingEvents?: DosingLogCreateNestedManyWithoutDiagnosticReportInput
  }

  export type DiagnosticReportUncheckedCreateWithoutDeviceInput = {
    id?: string
    timestamp?: Date | string
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity?: $Enums.SeverityLevel
    classProbabilities: JsonNullValueInput | InputJsonValue
    actionTaken?: string | null
    cooldownActiveTill?: Date | string | null
    dosingEvents?: DosingLogUncheckedCreateNestedManyWithoutDiagnosticReportInput
  }

  export type DiagnosticReportCreateOrConnectWithoutDeviceInput = {
    where: DiagnosticReportWhereUniqueInput
    create: XOR<DiagnosticReportCreateWithoutDeviceInput, DiagnosticReportUncheckedCreateWithoutDeviceInput>
  }

  export type DiagnosticReportCreateManyDeviceInputEnvelope = {
    data: DiagnosticReportCreateManyDeviceInput | DiagnosticReportCreateManyDeviceInput[]
    skipDuplicates?: boolean
  }

  export type DosingLogCreateWithoutDeviceInput = {
    id?: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
    diagnosticReport?: DiagnosticReportCreateNestedOneWithoutDosingEventsInput
  }

  export type DosingLogUncheckedCreateWithoutDeviceInput = {
    id?: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
    diagnosticReportId?: string | null
  }

  export type DosingLogCreateOrConnectWithoutDeviceInput = {
    where: DosingLogWhereUniqueInput
    create: XOR<DosingLogCreateWithoutDeviceInput, DosingLogUncheckedCreateWithoutDeviceInput>
  }

  export type DosingLogCreateManyDeviceInputEnvelope = {
    data: DosingLogCreateManyDeviceInput | DosingLogCreateManyDeviceInput[]
    skipDuplicates?: boolean
  }

  export type SystemAlertCreateWithoutDeviceInput = {
    id?: string
    timestamp?: Date | string
    alertType: $Enums.AlertType
    severity?: $Enums.SeverityLevel
    message: string
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
  }

  export type SystemAlertUncheckedCreateWithoutDeviceInput = {
    id?: string
    timestamp?: Date | string
    alertType: $Enums.AlertType
    severity?: $Enums.SeverityLevel
    message: string
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
  }

  export type SystemAlertCreateOrConnectWithoutDeviceInput = {
    where: SystemAlertWhereUniqueInput
    create: XOR<SystemAlertCreateWithoutDeviceInput, SystemAlertUncheckedCreateWithoutDeviceInput>
  }

  export type SystemAlertCreateManyDeviceInputEnvelope = {
    data: SystemAlertCreateManyDeviceInput | SystemAlertCreateManyDeviceInput[]
    skipDuplicates?: boolean
  }

  export type CropRecipeUpsertWithoutAssignedDevicesInput = {
    update: XOR<CropRecipeUpdateWithoutAssignedDevicesInput, CropRecipeUncheckedUpdateWithoutAssignedDevicesInput>
    create: XOR<CropRecipeCreateWithoutAssignedDevicesInput, CropRecipeUncheckedCreateWithoutAssignedDevicesInput>
    where?: CropRecipeWhereInput
  }

  export type CropRecipeUpdateToOneWithWhereWithoutAssignedDevicesInput = {
    where?: CropRecipeWhereInput
    data: XOR<CropRecipeUpdateWithoutAssignedDevicesInput, CropRecipeUncheckedUpdateWithoutAssignedDevicesInput>
  }

  export type CropRecipeUpdateWithoutAssignedDevicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    cropName?: StringFieldUpdateOperationsInput | string
    targetPhMin?: FloatFieldUpdateOperationsInput | number
    targetPhMax?: FloatFieldUpdateOperationsInput | number
    targetEcMin?: FloatFieldUpdateOperationsInput | number
    targetEcMax?: FloatFieldUpdateOperationsInput | number
    ecCeiling?: FloatFieldUpdateOperationsInput | number
    minWaterLevel?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CropRecipeUncheckedUpdateWithoutAssignedDevicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    cropName?: StringFieldUpdateOperationsInput | string
    targetPhMin?: FloatFieldUpdateOperationsInput | number
    targetPhMax?: FloatFieldUpdateOperationsInput | number
    targetEcMin?: FloatFieldUpdateOperationsInput | number
    targetEcMax?: FloatFieldUpdateOperationsInput | number
    ecCeiling?: FloatFieldUpdateOperationsInput | number
    minWaterLevel?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiagnosticReportUpsertWithWhereUniqueWithoutDeviceInput = {
    where: DiagnosticReportWhereUniqueInput
    update: XOR<DiagnosticReportUpdateWithoutDeviceInput, DiagnosticReportUncheckedUpdateWithoutDeviceInput>
    create: XOR<DiagnosticReportCreateWithoutDeviceInput, DiagnosticReportUncheckedCreateWithoutDeviceInput>
  }

  export type DiagnosticReportUpdateWithWhereUniqueWithoutDeviceInput = {
    where: DiagnosticReportWhereUniqueInput
    data: XOR<DiagnosticReportUpdateWithoutDeviceInput, DiagnosticReportUncheckedUpdateWithoutDeviceInput>
  }

  export type DiagnosticReportUpdateManyWithWhereWithoutDeviceInput = {
    where: DiagnosticReportScalarWhereInput
    data: XOR<DiagnosticReportUpdateManyMutationInput, DiagnosticReportUncheckedUpdateManyWithoutDeviceInput>
  }

  export type DiagnosticReportScalarWhereInput = {
    AND?: DiagnosticReportScalarWhereInput | DiagnosticReportScalarWhereInput[]
    OR?: DiagnosticReportScalarWhereInput[]
    NOT?: DiagnosticReportScalarWhereInput | DiagnosticReportScalarWhereInput[]
    id?: StringFilter<"DiagnosticReport"> | string
    deviceId?: StringFilter<"DiagnosticReport"> | string
    timestamp?: DateTimeFilter<"DiagnosticReport"> | Date | string
    imageUrl?: StringFilter<"DiagnosticReport"> | string
    primaryLabel?: StringFilter<"DiagnosticReport"> | string
    confidence?: FloatFilter<"DiagnosticReport"> | number
    severity?: EnumSeverityLevelFilter<"DiagnosticReport"> | $Enums.SeverityLevel
    classProbabilities?: JsonFilter<"DiagnosticReport">
    actionTaken?: StringNullableFilter<"DiagnosticReport"> | string | null
    cooldownActiveTill?: DateTimeNullableFilter<"DiagnosticReport"> | Date | string | null
  }

  export type DosingLogUpsertWithWhereUniqueWithoutDeviceInput = {
    where: DosingLogWhereUniqueInput
    update: XOR<DosingLogUpdateWithoutDeviceInput, DosingLogUncheckedUpdateWithoutDeviceInput>
    create: XOR<DosingLogCreateWithoutDeviceInput, DosingLogUncheckedCreateWithoutDeviceInput>
  }

  export type DosingLogUpdateWithWhereUniqueWithoutDeviceInput = {
    where: DosingLogWhereUniqueInput
    data: XOR<DosingLogUpdateWithoutDeviceInput, DosingLogUncheckedUpdateWithoutDeviceInput>
  }

  export type DosingLogUpdateManyWithWhereWithoutDeviceInput = {
    where: DosingLogScalarWhereInput
    data: XOR<DosingLogUpdateManyMutationInput, DosingLogUncheckedUpdateManyWithoutDeviceInput>
  }

  export type DosingLogScalarWhereInput = {
    AND?: DosingLogScalarWhereInput | DosingLogScalarWhereInput[]
    OR?: DosingLogScalarWhereInput[]
    NOT?: DosingLogScalarWhereInput | DosingLogScalarWhereInput[]
    id?: StringFilter<"DosingLog"> | string
    deviceId?: StringFilter<"DosingLog"> | string
    timestamp?: DateTimeFilter<"DosingLog"> | Date | string
    source?: EnumDosingSourceFilter<"DosingLog"> | $Enums.DosingSource
    pumpType?: EnumPumpTypeFilter<"DosingLog"> | $Enums.PumpType
    durationMs?: IntFilter<"DosingLog"> | number
    rationale?: StringFilter<"DosingLog"> | string
    mixingLockoutMin?: IntFilter<"DosingLog"> | number
    diagnosticReportId?: StringNullableFilter<"DosingLog"> | string | null
  }

  export type SystemAlertUpsertWithWhereUniqueWithoutDeviceInput = {
    where: SystemAlertWhereUniqueInput
    update: XOR<SystemAlertUpdateWithoutDeviceInput, SystemAlertUncheckedUpdateWithoutDeviceInput>
    create: XOR<SystemAlertCreateWithoutDeviceInput, SystemAlertUncheckedCreateWithoutDeviceInput>
  }

  export type SystemAlertUpdateWithWhereUniqueWithoutDeviceInput = {
    where: SystemAlertWhereUniqueInput
    data: XOR<SystemAlertUpdateWithoutDeviceInput, SystemAlertUncheckedUpdateWithoutDeviceInput>
  }

  export type SystemAlertUpdateManyWithWhereWithoutDeviceInput = {
    where: SystemAlertScalarWhereInput
    data: XOR<SystemAlertUpdateManyMutationInput, SystemAlertUncheckedUpdateManyWithoutDeviceInput>
  }

  export type SystemAlertScalarWhereInput = {
    AND?: SystemAlertScalarWhereInput | SystemAlertScalarWhereInput[]
    OR?: SystemAlertScalarWhereInput[]
    NOT?: SystemAlertScalarWhereInput | SystemAlertScalarWhereInput[]
    id?: StringFilter<"SystemAlert"> | string
    deviceId?: StringFilter<"SystemAlert"> | string
    timestamp?: DateTimeFilter<"SystemAlert"> | Date | string
    alertType?: EnumAlertTypeFilter<"SystemAlert"> | $Enums.AlertType
    severity?: EnumSeverityLevelFilter<"SystemAlert"> | $Enums.SeverityLevel
    message?: StringFilter<"SystemAlert"> | string
    isResolved?: BoolFilter<"SystemAlert"> | boolean
    resolvedAt?: DateTimeNullableFilter<"SystemAlert"> | Date | string | null
    resolvedBy?: StringNullableFilter<"SystemAlert"> | string | null
  }

  export type DeviceCreateWithoutActiveRecipeInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    diagnosticReports?: DiagnosticReportCreateNestedManyWithoutDeviceInput
    dosingLogs?: DosingLogCreateNestedManyWithoutDeviceInput
    alerts?: SystemAlertCreateNestedManyWithoutDeviceInput
  }

  export type DeviceUncheckedCreateWithoutActiveRecipeInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    diagnosticReports?: DiagnosticReportUncheckedCreateNestedManyWithoutDeviceInput
    dosingLogs?: DosingLogUncheckedCreateNestedManyWithoutDeviceInput
    alerts?: SystemAlertUncheckedCreateNestedManyWithoutDeviceInput
  }

  export type DeviceCreateOrConnectWithoutActiveRecipeInput = {
    where: DeviceWhereUniqueInput
    create: XOR<DeviceCreateWithoutActiveRecipeInput, DeviceUncheckedCreateWithoutActiveRecipeInput>
  }

  export type DeviceCreateManyActiveRecipeInputEnvelope = {
    data: DeviceCreateManyActiveRecipeInput | DeviceCreateManyActiveRecipeInput[]
    skipDuplicates?: boolean
  }

  export type DeviceUpsertWithWhereUniqueWithoutActiveRecipeInput = {
    where: DeviceWhereUniqueInput
    update: XOR<DeviceUpdateWithoutActiveRecipeInput, DeviceUncheckedUpdateWithoutActiveRecipeInput>
    create: XOR<DeviceCreateWithoutActiveRecipeInput, DeviceUncheckedCreateWithoutActiveRecipeInput>
  }

  export type DeviceUpdateWithWhereUniqueWithoutActiveRecipeInput = {
    where: DeviceWhereUniqueInput
    data: XOR<DeviceUpdateWithoutActiveRecipeInput, DeviceUncheckedUpdateWithoutActiveRecipeInput>
  }

  export type DeviceUpdateManyWithWhereWithoutActiveRecipeInput = {
    where: DeviceScalarWhereInput
    data: XOR<DeviceUpdateManyMutationInput, DeviceUncheckedUpdateManyWithoutActiveRecipeInput>
  }

  export type DeviceScalarWhereInput = {
    AND?: DeviceScalarWhereInput | DeviceScalarWhereInput[]
    OR?: DeviceScalarWhereInput[]
    NOT?: DeviceScalarWhereInput | DeviceScalarWhereInput[]
    id?: StringFilter<"Device"> | string
    name?: StringFilter<"Device"> | string
    location?: StringNullableFilter<"Device"> | string | null
    isOnline?: BoolFilter<"Device"> | boolean
    createdAt?: DateTimeFilter<"Device"> | Date | string
    activeRecipeId?: StringNullableFilter<"Device"> | string | null
    circulationMode?: StringFilter<"Device"> | string
    circRunMin?: IntFilter<"Device"> | number
    circRestMin?: IntFilter<"Device"> | number
    circUpdatedAt?: DateTimeFilter<"Device"> | Date | string
  }

  export type DeviceCreateWithoutDiagnosticReportsInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    activeRecipe?: CropRecipeCreateNestedOneWithoutAssignedDevicesInput
    dosingLogs?: DosingLogCreateNestedManyWithoutDeviceInput
    alerts?: SystemAlertCreateNestedManyWithoutDeviceInput
  }

  export type DeviceUncheckedCreateWithoutDiagnosticReportsInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    activeRecipeId?: string | null
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    dosingLogs?: DosingLogUncheckedCreateNestedManyWithoutDeviceInput
    alerts?: SystemAlertUncheckedCreateNestedManyWithoutDeviceInput
  }

  export type DeviceCreateOrConnectWithoutDiagnosticReportsInput = {
    where: DeviceWhereUniqueInput
    create: XOR<DeviceCreateWithoutDiagnosticReportsInput, DeviceUncheckedCreateWithoutDiagnosticReportsInput>
  }

  export type DosingLogCreateWithoutDiagnosticReportInput = {
    id?: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
    device: DeviceCreateNestedOneWithoutDosingLogsInput
  }

  export type DosingLogUncheckedCreateWithoutDiagnosticReportInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
  }

  export type DosingLogCreateOrConnectWithoutDiagnosticReportInput = {
    where: DosingLogWhereUniqueInput
    create: XOR<DosingLogCreateWithoutDiagnosticReportInput, DosingLogUncheckedCreateWithoutDiagnosticReportInput>
  }

  export type DosingLogCreateManyDiagnosticReportInputEnvelope = {
    data: DosingLogCreateManyDiagnosticReportInput | DosingLogCreateManyDiagnosticReportInput[]
    skipDuplicates?: boolean
  }

  export type DeviceUpsertWithoutDiagnosticReportsInput = {
    update: XOR<DeviceUpdateWithoutDiagnosticReportsInput, DeviceUncheckedUpdateWithoutDiagnosticReportsInput>
    create: XOR<DeviceCreateWithoutDiagnosticReportsInput, DeviceUncheckedCreateWithoutDiagnosticReportsInput>
    where?: DeviceWhereInput
  }

  export type DeviceUpdateToOneWithWhereWithoutDiagnosticReportsInput = {
    where?: DeviceWhereInput
    data: XOR<DeviceUpdateWithoutDiagnosticReportsInput, DeviceUncheckedUpdateWithoutDiagnosticReportsInput>
  }

  export type DeviceUpdateWithoutDiagnosticReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipe?: CropRecipeUpdateOneWithoutAssignedDevicesNestedInput
    dosingLogs?: DosingLogUpdateManyWithoutDeviceNestedInput
    alerts?: SystemAlertUpdateManyWithoutDeviceNestedInput
  }

  export type DeviceUncheckedUpdateWithoutDiagnosticReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipeId?: NullableStringFieldUpdateOperationsInput | string | null
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dosingLogs?: DosingLogUncheckedUpdateManyWithoutDeviceNestedInput
    alerts?: SystemAlertUncheckedUpdateManyWithoutDeviceNestedInput
  }

  export type DosingLogUpsertWithWhereUniqueWithoutDiagnosticReportInput = {
    where: DosingLogWhereUniqueInput
    update: XOR<DosingLogUpdateWithoutDiagnosticReportInput, DosingLogUncheckedUpdateWithoutDiagnosticReportInput>
    create: XOR<DosingLogCreateWithoutDiagnosticReportInput, DosingLogUncheckedCreateWithoutDiagnosticReportInput>
  }

  export type DosingLogUpdateWithWhereUniqueWithoutDiagnosticReportInput = {
    where: DosingLogWhereUniqueInput
    data: XOR<DosingLogUpdateWithoutDiagnosticReportInput, DosingLogUncheckedUpdateWithoutDiagnosticReportInput>
  }

  export type DosingLogUpdateManyWithWhereWithoutDiagnosticReportInput = {
    where: DosingLogScalarWhereInput
    data: XOR<DosingLogUpdateManyMutationInput, DosingLogUncheckedUpdateManyWithoutDiagnosticReportInput>
  }

  export type DeviceCreateWithoutDosingLogsInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    activeRecipe?: CropRecipeCreateNestedOneWithoutAssignedDevicesInput
    diagnosticReports?: DiagnosticReportCreateNestedManyWithoutDeviceInput
    alerts?: SystemAlertCreateNestedManyWithoutDeviceInput
  }

  export type DeviceUncheckedCreateWithoutDosingLogsInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    activeRecipeId?: string | null
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    diagnosticReports?: DiagnosticReportUncheckedCreateNestedManyWithoutDeviceInput
    alerts?: SystemAlertUncheckedCreateNestedManyWithoutDeviceInput
  }

  export type DeviceCreateOrConnectWithoutDosingLogsInput = {
    where: DeviceWhereUniqueInput
    create: XOR<DeviceCreateWithoutDosingLogsInput, DeviceUncheckedCreateWithoutDosingLogsInput>
  }

  export type DiagnosticReportCreateWithoutDosingEventsInput = {
    id?: string
    timestamp?: Date | string
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity?: $Enums.SeverityLevel
    classProbabilities: JsonNullValueInput | InputJsonValue
    actionTaken?: string | null
    cooldownActiveTill?: Date | string | null
    device: DeviceCreateNestedOneWithoutDiagnosticReportsInput
  }

  export type DiagnosticReportUncheckedCreateWithoutDosingEventsInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity?: $Enums.SeverityLevel
    classProbabilities: JsonNullValueInput | InputJsonValue
    actionTaken?: string | null
    cooldownActiveTill?: Date | string | null
  }

  export type DiagnosticReportCreateOrConnectWithoutDosingEventsInput = {
    where: DiagnosticReportWhereUniqueInput
    create: XOR<DiagnosticReportCreateWithoutDosingEventsInput, DiagnosticReportUncheckedCreateWithoutDosingEventsInput>
  }

  export type DeviceUpsertWithoutDosingLogsInput = {
    update: XOR<DeviceUpdateWithoutDosingLogsInput, DeviceUncheckedUpdateWithoutDosingLogsInput>
    create: XOR<DeviceCreateWithoutDosingLogsInput, DeviceUncheckedCreateWithoutDosingLogsInput>
    where?: DeviceWhereInput
  }

  export type DeviceUpdateToOneWithWhereWithoutDosingLogsInput = {
    where?: DeviceWhereInput
    data: XOR<DeviceUpdateWithoutDosingLogsInput, DeviceUncheckedUpdateWithoutDosingLogsInput>
  }

  export type DeviceUpdateWithoutDosingLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipe?: CropRecipeUpdateOneWithoutAssignedDevicesNestedInput
    diagnosticReports?: DiagnosticReportUpdateManyWithoutDeviceNestedInput
    alerts?: SystemAlertUpdateManyWithoutDeviceNestedInput
  }

  export type DeviceUncheckedUpdateWithoutDosingLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipeId?: NullableStringFieldUpdateOperationsInput | string | null
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    diagnosticReports?: DiagnosticReportUncheckedUpdateManyWithoutDeviceNestedInput
    alerts?: SystemAlertUncheckedUpdateManyWithoutDeviceNestedInput
  }

  export type DiagnosticReportUpsertWithoutDosingEventsInput = {
    update: XOR<DiagnosticReportUpdateWithoutDosingEventsInput, DiagnosticReportUncheckedUpdateWithoutDosingEventsInput>
    create: XOR<DiagnosticReportCreateWithoutDosingEventsInput, DiagnosticReportUncheckedCreateWithoutDosingEventsInput>
    where?: DiagnosticReportWhereInput
  }

  export type DiagnosticReportUpdateToOneWithWhereWithoutDosingEventsInput = {
    where?: DiagnosticReportWhereInput
    data: XOR<DiagnosticReportUpdateWithoutDosingEventsInput, DiagnosticReportUncheckedUpdateWithoutDosingEventsInput>
  }

  export type DiagnosticReportUpdateWithoutDosingEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    device?: DeviceUpdateOneRequiredWithoutDiagnosticReportsNestedInput
  }

  export type DiagnosticReportUncheckedUpdateWithoutDosingEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DeviceCreateWithoutAlertsInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    activeRecipe?: CropRecipeCreateNestedOneWithoutAssignedDevicesInput
    diagnosticReports?: DiagnosticReportCreateNestedManyWithoutDeviceInput
    dosingLogs?: DosingLogCreateNestedManyWithoutDeviceInput
  }

  export type DeviceUncheckedCreateWithoutAlertsInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    activeRecipeId?: string | null
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
    diagnosticReports?: DiagnosticReportUncheckedCreateNestedManyWithoutDeviceInput
    dosingLogs?: DosingLogUncheckedCreateNestedManyWithoutDeviceInput
  }

  export type DeviceCreateOrConnectWithoutAlertsInput = {
    where: DeviceWhereUniqueInput
    create: XOR<DeviceCreateWithoutAlertsInput, DeviceUncheckedCreateWithoutAlertsInput>
  }

  export type DeviceUpsertWithoutAlertsInput = {
    update: XOR<DeviceUpdateWithoutAlertsInput, DeviceUncheckedUpdateWithoutAlertsInput>
    create: XOR<DeviceCreateWithoutAlertsInput, DeviceUncheckedCreateWithoutAlertsInput>
    where?: DeviceWhereInput
  }

  export type DeviceUpdateToOneWithWhereWithoutAlertsInput = {
    where?: DeviceWhereInput
    data: XOR<DeviceUpdateWithoutAlertsInput, DeviceUncheckedUpdateWithoutAlertsInput>
  }

  export type DeviceUpdateWithoutAlertsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipe?: CropRecipeUpdateOneWithoutAssignedDevicesNestedInput
    diagnosticReports?: DiagnosticReportUpdateManyWithoutDeviceNestedInput
    dosingLogs?: DosingLogUpdateManyWithoutDeviceNestedInput
  }

  export type DeviceUncheckedUpdateWithoutAlertsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeRecipeId?: NullableStringFieldUpdateOperationsInput | string | null
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    diagnosticReports?: DiagnosticReportUncheckedUpdateManyWithoutDeviceNestedInput
    dosingLogs?: DosingLogUncheckedUpdateManyWithoutDeviceNestedInput
  }

  export type DiagnosticReportCreateManyDeviceInput = {
    id?: string
    timestamp?: Date | string
    imageUrl: string
    primaryLabel: string
    confidence: number
    severity?: $Enums.SeverityLevel
    classProbabilities: JsonNullValueInput | InputJsonValue
    actionTaken?: string | null
    cooldownActiveTill?: Date | string | null
  }

  export type DosingLogCreateManyDeviceInput = {
    id?: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
    diagnosticReportId?: string | null
  }

  export type SystemAlertCreateManyDeviceInput = {
    id?: string
    timestamp?: Date | string
    alertType: $Enums.AlertType
    severity?: $Enums.SeverityLevel
    message: string
    isResolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
  }

  export type DiagnosticReportUpdateWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dosingEvents?: DosingLogUpdateManyWithoutDiagnosticReportNestedInput
  }

  export type DiagnosticReportUncheckedUpdateWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dosingEvents?: DosingLogUncheckedUpdateManyWithoutDiagnosticReportNestedInput
  }

  export type DiagnosticReportUncheckedUpdateManyWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    primaryLabel?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    classProbabilities?: JsonNullValueInput | InputJsonValue
    actionTaken?: NullableStringFieldUpdateOperationsInput | string | null
    cooldownActiveTill?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DosingLogUpdateWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
    diagnosticReport?: DiagnosticReportUpdateOneWithoutDosingEventsNestedInput
  }

  export type DosingLogUncheckedUpdateWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
    diagnosticReportId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DosingLogUncheckedUpdateManyWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
    diagnosticReportId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemAlertUpdateWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    message?: StringFieldUpdateOperationsInput | string
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemAlertUncheckedUpdateWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    message?: StringFieldUpdateOperationsInput | string
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemAlertUncheckedUpdateManyWithoutDeviceInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    message?: StringFieldUpdateOperationsInput | string
    isResolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeviceCreateManyActiveRecipeInput = {
    id: string
    name: string
    location?: string | null
    isOnline?: boolean
    createdAt?: Date | string
    circulationMode?: string
    circRunMin?: number
    circRestMin?: number
    circUpdatedAt?: Date | string
  }

  export type DeviceUpdateWithoutActiveRecipeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    diagnosticReports?: DiagnosticReportUpdateManyWithoutDeviceNestedInput
    dosingLogs?: DosingLogUpdateManyWithoutDeviceNestedInput
    alerts?: SystemAlertUpdateManyWithoutDeviceNestedInput
  }

  export type DeviceUncheckedUpdateWithoutActiveRecipeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    diagnosticReports?: DiagnosticReportUncheckedUpdateManyWithoutDeviceNestedInput
    dosingLogs?: DosingLogUncheckedUpdateManyWithoutDeviceNestedInput
    alerts?: SystemAlertUncheckedUpdateManyWithoutDeviceNestedInput
  }

  export type DeviceUncheckedUpdateManyWithoutActiveRecipeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    isOnline?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    circulationMode?: StringFieldUpdateOperationsInput | string
    circRunMin?: IntFieldUpdateOperationsInput | number
    circRestMin?: IntFieldUpdateOperationsInput | number
    circUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DosingLogCreateManyDiagnosticReportInput = {
    id?: string
    deviceId: string
    timestamp?: Date | string
    source: $Enums.DosingSource
    pumpType: $Enums.PumpType
    durationMs: number
    rationale: string
    mixingLockoutMin?: number
  }

  export type DosingLogUpdateWithoutDiagnosticReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
    device?: DeviceUpdateOneRequiredWithoutDosingLogsNestedInput
  }

  export type DosingLogUncheckedUpdateWithoutDiagnosticReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
  }

  export type DosingLogUncheckedUpdateManyWithoutDiagnosticReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: EnumDosingSourceFieldUpdateOperationsInput | $Enums.DosingSource
    pumpType?: EnumPumpTypeFieldUpdateOperationsInput | $Enums.PumpType
    durationMs?: IntFieldUpdateOperationsInput | number
    rationale?: StringFieldUpdateOperationsInput | string
    mixingLockoutMin?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}