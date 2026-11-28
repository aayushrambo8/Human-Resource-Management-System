import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const hasWrapper = existsSync(join(process.cwd(), 'backend', isWindows ? 'mvnw.cmd' : 'mvnw'));
const mvnCmd = hasWrapper ? (isWindows ? 'mvnw.cmd' : './mvnw') : (isWindows ? 'mvn.cmd' : 'mvn');
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '▶ Starting HRMS Backend (Spring Boot :8080) & Frontend (Next.js :3000)...');

const backend = spawn(mvnCmd, ['spring-boot:run'], {
  cwd: './backend',
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev', '--prefix', 'frontend'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  try {
    backend.kill();
    frontend.kill();
  } catch {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
