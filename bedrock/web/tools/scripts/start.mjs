// The back and the front in parallel, each line labeled with its project.
import { APPS, run } from "./shell.mjs";

process.exitCode = run(`vp run --parallel --log labeled ${APPS} start`) ? 0 : 1;
