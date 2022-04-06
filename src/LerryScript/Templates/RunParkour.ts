import { Vec3 } from "vec3";
import { SequentialNode } from "../Nodes/ASTNodes/StructureNodes/SequentialNode";
import { GoToNode } from "../Nodes/ASTNodes/Tasks/Tasks";

export const RunParkour = new SequentialNode(
    new GoToNode("first pos", new Vec3(208, 64, 180)),
    new GoToNode("second pos", new Vec3(204, 64, 182)),
    new GoToNode("third pos", new Vec3(200, 64, 180)),
    new GoToNode("fourth pos", new Vec3(198, 64, 181)),
    new GoToNode("fifth pos", new Vec3(201, 64, 182)),
    new GoToNode("sixth pos", new Vec3(204, 64, 180)),
    new GoToNode("seventh pos", new Vec3(207, 64, 182)),
    new GoToNode("eighth pos", new Vec3(210, 64, 181))
);
