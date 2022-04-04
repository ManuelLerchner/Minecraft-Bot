import { SequentialNode } from "../Nodes/SequentialNode";
import { TaskNode } from "../Nodes/TaskNode";
import { WhileNode } from "../Nodes/WhileNode";
import { Node } from "./../Nodes/Node";
import { Vec3 } from "vec3";
import { IfNode } from "../Nodes/IfNode";
function repeat() {
    let repeatCounter = 6;
    return () => {
        repeatCounter--;
        console.log(repeatCounter);
        return repeatCounter > 0;
    };
}

let rootNode: Node = new SequentialNode(
    new WhileNode(
        repeat(),

        new SequentialNode(
            new TaskNode("sleep", "Sleep", 1000),

            new WhileNode(
                () => true,
                new SequentialNode(
                    new TaskNode("sleep", "Sleep", 5000),
                    new TaskNode(
                        "goto",
                        "cobble-farm-position-1",
                        new Vec3(216, 64, 179)
                    ),

                    new TaskNode(
                        "goto",
                        "cobble-farm-position-2",
                        new Vec3(214, 64, 181)
                    )
                )
            )
        )
    )
);

let rootNode1 = new WhileNode(
    repeat(),
    new SequentialNode(
        new TaskNode("sleep", "Sleep", 5000),
        new IfNode(
            () => true,
            new TaskNode(
                "goto",
                "cobble-farm-position-1",
                new Vec3(216, 64, 179)
            ),
            new TaskNode(
                "goto",
                "cobble-farm-position-2",
                new Vec3(214, 64, 181)
            )
        ),
        new TaskNode("call", "toggle", ()=>true)
    )
);
