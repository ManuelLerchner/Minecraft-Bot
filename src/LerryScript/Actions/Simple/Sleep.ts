import { Bot } from "mineflayer";
import { Action } from "../Action";

export class Sleep extends Action {
    constructor(bot: Bot, name: string, private msSleep: number) {
        super(bot, name);
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
