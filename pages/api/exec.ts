import { executionAsyncId } from "async_hooks";
import { exec, ExecException } from "child_process";

type ExecOutput = {
  stdout: string;
  stderr: string;
  error?: ExecException;
};

const execWrapper = (command: string) =>
  new Promise<ExecOutput>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      const output: ExecOutput = {
        stdout,
        stderr,
        error: !!error ? error : undefined,
      };
      resolve(output);
    });
  });

export { execWrapper };
