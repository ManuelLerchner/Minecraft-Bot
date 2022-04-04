import { SequentialNode } from "../Nodes/ASTNodes/StructureNodes/SequentialNode";
import { TaskNode } from "../Nodes/ASTNodes/StructureNodes/TaskNode";
import { Vec3 } from "vec3";

export const RunParkour = new SequentialNode(
    new TaskNode("goto", "first pos", new Vec3(208, 64, 180)),
    new TaskNode("goto", "second pos", new Vec3(204, 64, 182)),
    new TaskNode("goto", "third pos", new Vec3(200, 64, 180)),
    new TaskNode("goto", "fourth pos", new Vec3(198, 64, 181)),
    new TaskNode("goto", "fifth pos", new Vec3(201, 64, 182)),
    new TaskNode("goto", "sixth pos", new Vec3(204, 64, 180)),
    new TaskNode("goto", "seventh pos", new Vec3(207, 63, 182)),
    new TaskNode("goto", "eighth pos", new Vec3(210, 64, 181))
);
