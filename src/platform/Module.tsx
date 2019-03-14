import {push, replace} from "connected-react-router";
import {Location} from "history";
import {SagaIterator} from "redux-saga";
import {app} from "../app";
import {EventLogger} from "../EventLogger";
import {LifecycleDecoratorFlag, TickIntervalDecoratorFlag} from "../module";
import {setStateAction, State} from "../reducer";

export interface ModuleLifecycleListener<RouteParam extends {} = {}, HistoryState extends {} = {}> {
    onRegister: (() => SagaIterator) & LifecycleDecoratorFlag;
    onRender: ((routeParameters: RouteParam, location: Location<HistoryState | undefined>) => SagaIterator) & LifecycleDecoratorFlag;
    onDestroy: (() => SagaIterator) & LifecycleDecoratorFlag;
    onTick: (() => SagaIterator) & LifecycleDecoratorFlag & TickIntervalDecoratorFlag;
}

// TODO: need to merge RouteParam & HistoryState?
export class Module<ModuleState extends {}, RouteParam extends {} = {}, HistoryState extends {} = {}, RootState extends State = State> implements ModuleLifecycleListener<RouteParam, HistoryState> {
    public constructor(public readonly name: string, private readonly initialState: ModuleState) {}

    *onRegister(): SagaIterator {
        /**
         * Called when the module is registered the first time
         * Usually used for fetching one-time configuration
         */
    }

    *onRender(routeParameters: RouteParam, location: Location<HistoryState | undefined>): SagaIterator {
        /**
         * Called when the attached component is in either case:
         * - Initially mounted
         * - Re-rendered due to location updates (only for route connected components)
         */
    }

    *onDestroy(): SagaIterator {
        /**
         * Called when the attached component is going to unmount
         */
    }

    *onTick(): SagaIterator {
        /**
         * Called periodically during the lifecycle of attached component
         * Usually used together with @Interval decorator, to specify the period (in second)
         * Attention: The next tick will not be triggered, until the current tick has finished
         */
    }

    protected get state(): Readonly<ModuleState> {
        return this.rootState.app[this.name];
    }

    protected get rootState(): Readonly<RootState> {
        return app.store.getState() as Readonly<RootState>;
    }

    protected get logger(): EventLogger {
        return app.eventLogger;
    }

    protected setState(newState: Partial<ModuleState>) {
        app.store.dispatch(setStateAction(this.name, newState, `@@${this.name}/setState[${Object.keys(newState).join(",")}]`));
    }

    protected setHistory(urlOrState: HistoryState | string, usePush: boolean = true) {
        if (typeof urlOrState === "string") {
            app.store.dispatch(usePush ? push(urlOrState) : replace(urlOrState));
        } else {
            const currentURL = location.pathname + location.search;
            app.store.dispatch(usePush ? push(currentURL, urlOrState) : replace(currentURL, urlOrState));
        }
    }
}
