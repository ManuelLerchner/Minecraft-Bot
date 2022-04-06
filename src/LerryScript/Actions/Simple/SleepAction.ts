import { Bot } from "mineflayer";
import { Action } from "../Action";

export class SleepAction extends Action {
    constructor(bot: Bot, private msSleep: number) {
        super(bot);
    }

    onStateEntered(): void {
        this.sleep(this.msSleep).then(() => {
            this.setFinished();
        });
    }

    sleep(time: any): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    canThrowError(): boolean {
        return false;
    }
}
