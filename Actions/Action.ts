import chalk from "chalk";
import { Bot } from "mineflayer";
import { Movements } from "mineflayer-pathfinder";
import { StateBehavior } from "mineflayer-statemachine";

export abstract class Action implements StateBehavior {
    bot: Bot;
    active: boolean = false;
    stateName: string = "";

    finished = false;
    error = false;
    errorChaught: boolean = false;

    constructor(bot: Bot, stateName: string) {
        this.bot = bot;
        this.stateName = stateName;

        this.active = false;

        this.reset = this.reset.bind(this);
        this.isFinished = this.isFinished.bind(this);
        this.setFinished = this.setFinished.bind(this);
        this.setError = this.setError.bind(this);
        this.isErrored = this.isErrored.bind(this);
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
        console.log(
            chalk.red("\nDetected: " + err.name + ": " + err.message + " in " + this.stateName)
        );
        this.error = true;
    }

    isErrored(): boolean {
        return this.error;
    }

    abstract onStateEntered(): void;
    abstract onStateExited(): void;

    abstract canThrowError(): boolean;
}
