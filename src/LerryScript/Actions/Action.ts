import { Bot } from "mineflayer";
import { StateBehavior } from "mineflayer-statemachine";
import chalk from "chalk";
import { PRINT_ERROR, PRINT_STATES } from "../Settings";

export abstract class Action implements StateBehavior {
    active: boolean = false;
    stateName: string = "No-State";

    finished = false;
    error = false;
    errorChaught: boolean = false;

    constructor(protected bot: Bot) {
        this.reset = this.reset.bind(this);
        this.isFinished = this.isFinished.bind(this);
        this.setFinished = this.setFinished.bind(this);
        this.setError = this.setError.bind(this);
        this.isErrored = this.isErrored.bind(this);
        this.onStateExited = this.onStateExited.bind(this);
    }

    setStateName(stateName: string) {
        this.stateName = stateName;
    }

    reset() {
        this.finished = false;
        this.error = false;
    }

    setFinished() {
        this.finished = true;
    }

    isFinished(): boolean {
        return this.finished;
    }

    setError(err: Error) {
        if (PRINT_ERROR) {
            console.log(
                chalk.red("\n" + err.name + ": " + err.message + " in: '" + this.stateName + "'")
            );
        }
        this.error = true;
    }

    isErrored(): boolean {
        return this.error;
    }

    onStateExited() {
        if (PRINT_STATES) {
            console.log(chalk.green("\n" + this.stateName + " finished"));
        }
        this.reset();
    }

    abstract onStateEntered(): void;

    abstract canThrowError(): boolean;
}
