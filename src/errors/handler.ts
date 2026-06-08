import { CLIError, ExitCode } from './codes';

export function handleError(error: unknown): never {
  if (error instanceof CLIError) {
    if (error.details) {
      console.error(`Error: ${error.message}`);
      console.error(JSON.stringify(error.details, null, 2));
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exit(error.code);
  }
  
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    process.exit(ExitCode.GENERAL);
  }
  
  console.error(`Error: ${String(error)}`);
  process.exit(ExitCode.GENERAL);
}
