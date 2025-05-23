import * as fluture from "fluture";
import _ from "lodash";
import { Either } from "purify-ts";

export class Future<E, D> {
    private constructor(private instance: fluture.FutureInstance<E, D>) {}

    run(onSuccess: Fn<D>, onError: Fn<E>): Cancel {
        return fluture.fork(onError)(onSuccess)(this.instance);
    }

    map<D2>(mapper: (data: D) => D2): Future<E, D2> {
        const instance2 = fluture.map(mapper)(this.instance) as fluture.FutureInstance<E, D2>;
        return new Future(instance2);
    }

    mapError<E2>(mapper: (error: E) => E2): Future<E2, D> {
        const instance2 = fluture.mapRej(mapper)(this.instance) as fluture.FutureInstance<E2, D>;
        return new Future(instance2);
    }

    bimap<E2, D2>(dataMapper: (data: D) => D2, errorMapper: (error: E) => E2): Future<E2, D2> {
        const instance2 = fluture.bimap(errorMapper)(dataMapper)(this.instance);
        return new Future(instance2);
    }

    flatMap<D2>(mapper: (data: D) => Future<E, D2>): Future<E, D2> {
        const chainMapper = fluture.chain<E, D, D2>(data => mapper(data).instance);
        return new Future(chainMapper(this.instance));
    }

    flatMapError<E2>(mapper: (error: E) => Future<E2, D>): Future<E2, D> {
        const chainRejMapper = fluture.chainRej<E, E2, D>(error => mapper(error).instance);
        return new Future(chainRejMapper(this.instance));
    }

    toPromise(): Promise<D> {
        return new Promise((resolve, reject) => {
            this.run(resolve, reject);
        });
    }

    runAsync(): Promise<{ data?: D; error?: E }> {
        return new Promise(resolve => {
            this.run(
                data => resolve({ data }),
                error => resolve({ error })
            );
        });
    }

    toVoid(): Future<E, void> {
        return this.map(() => undefined);
    }

    /* Static methods */
    static noCancel: Cancel = () => {};

    static fromComputation<E, D>(computation: Computation<E, D>): Future<E, D> {
        return new Future(fluture.Future((reject, resolve) => computation(resolve, reject)));
    }

    static fromPromise<Data>(promise: Promise<Data>): FutureData<Data> {
        return Future.fromComputation((resolve, reject) => {
            promise.then(resolve).catch(err => reject(err ? err.message : "Unknown error"));
            return () => {};
        });
    }

    static fromPurifyEither<E, D>(input: Either<E, D>): Future<E, D> {
        return new Future(
            fluture.Future((reject, resolve) => {
                if (input.isRight()) resolve(input.extract());
                else if (input.isLeft()) reject(input.extract());
                return () => {};
            })
        );
    }

    static success<D, E = unknown>(data: D): Future<E, D> {
        return new Future<E, D>(fluture.resolve(data));
    }

    static error<E, D = unknown>(error: E): Future<E, D> {
        return new Future<E, D>(fluture.reject(error));
    }

    static join2<E, D1, D2>(future1: Future<E, D1>, future2: Future<E, D2>): Future<E, [D1, D2]> {
        const instance = fluture.both(future1.instance)(future2.instance);
        return new Future(instance);
    }

    static sequential<E, D>(futures: Array<Future<E, D>>): Future<E, Array<D>> {
        return Future.parallel(futures, { maxConcurrency: 1 });
    }

    static parallel<E, D>(
        futures: Array<Future<E, D>>,
        options: { maxConcurrency?: number } = {}
    ): Future<E, Array<D>> {
        const { maxConcurrency = 10 } = options;
        const parallel = fluture.parallel(maxConcurrency);
        const instance = parallel(futures.map(future => future.instance));
        return new Future(instance);
    }

    static joinObj<FuturesObj extends Record<string, Future<any, any>>>(
        futuresObj: FuturesObj,
        options: { maxConcurrency?: number } = {}
    ): JoinObj<FuturesObj> {
        const { maxConcurrency = 10 } = options;
        const parallel = fluture.parallel(maxConcurrency);
        const keys = _.keys(futuresObj);
        const futures = _.values(futuresObj);
        const flutures = parallel(futures.map(future => future.instance));
        const futureObj = new Future(flutures).map(values => _.zipObject(keys, values));
        return futureObj as JoinObj<FuturesObj>;
    }

    static futureMap<T, E, D>(inputValues: T[], mapper: (value: T, index: number) => Future<E, D>): Future<E, D[]> {
        return this.parallel(inputValues.map((value, index) => mapper(value, index)));
    }

    static sequentialWithAccumulation<E, D>(
        futures: Array<Future<E, D>>,
        options: { stopOnError?: boolean } = {}
    ): Future<E, SequentialAccumulatedData<E, D>> {
        const { stopOnError = false } = options;
        const processSequentially = (
            futures: Array<Future<E, D>>,
            accumulatedData: D[] = []
        ): Future<E, SequentialAccumulatedData<E, D>> => {
            if (futures.length === 0) {
                return Future.success({ type: "success", data: accumulatedData });
            }

            const [firstFuture, ...remainingFutures] = futures;

            if (!firstFuture) {
                return Future.success({ type: "success", data: accumulatedData });
            }

            return firstFuture
                .flatMap(resultData => {
                    return processSequentially(remainingFutures, [...accumulatedData, resultData]);
                })
                .flatMapError(error => {
                    if (stopOnError) {
                        return Future.success({ type: "error", error: error, data: accumulatedData });
                    } else {
                        return processSequentially(remainingFutures, accumulatedData);
                    }
                });
        };

        return processSequentially(futures);
    }
}

type SequentialAccumulatedData<E, D> = { type: "success"; data: D[] } | { type: "error"; error: E; data: D[] };

type JoinObj<Futures extends Record<string, Future<any, any>>> = Future<
    ExtractFutureError<Futures[keyof Futures]>,
    { [K in keyof Futures]: ExtractFutureData<Futures[K]> }
>;

export type ExtractFutureData<F> = F extends Future<any, infer D> ? D : never;
export type ExtractFutureError<F> = F extends Future<infer E, any> ? E : never;

type Fn<T> = (value: T) => void;

export type Cancel = () => void;

export type Computation<E, D> = (resolve: Fn<D>, reject: Fn<E>) => fluture.Cancel;
export type FutureData<Data> = Future<string, Data>;
