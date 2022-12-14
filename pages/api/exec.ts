import { executionAsyncId } from "async_hooks";
import { exec, ExecException } from "child_process";

type ExecOutput = {
  stdout: string;
  stderr: string;
  error?: ExecException;
};

const execWrapper = (command: string) =>
  new Promise<ExecOutput>((resolve, reject) => {
    // console.log("command", command);
    exec(command, (error, stdout, stderr) => {
      const output: ExecOutput = {
        stdout,
        stderr,
        error: !!error ? error : undefined,
      };
      resolve(output);
    });
  });

export type { ExecOutput };
export { execWrapper };
