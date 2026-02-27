import cron from 'node-cron';

export interface ScheduledJob {
  name: string;
  task: cron.ScheduledTask;
  expression: string;
}

const scheduledJobs: Map<string, ScheduledJob> = new Map();

export function scheduleJob(
  name: string,
  cronExpression: string,
  callback: () => void | Promise<void>
): ScheduledJob {
  if (scheduledJobs.has(name)) {
    console.warn(`Job "${name}" already exists. Stopping existing job.`);
    stopJob(name);
  }

  const task = cron.schedule(cronExpression, async () => {
    console.log(`Running scheduled job: ${name}`);
    try {
      await callback();
      console.log(`Job "${name}" completed successfully`);
    } catch (error) {
      console.error(`Job "${name}" failed:`, error);
    }
  });

  const job: ScheduledJob = { name, task, expression: cronExpression };
  scheduledJobs.set(name, job);

  console.log(`Scheduled job "${name}" with expression: ${cronExpression}`);
  return job;
}

export function scheduleDailyJob(
  name: string,
  hour: number,
  minute: number,
  callback: () => void | Promise<void>
): ScheduledJob {
  const cronExpression = `${minute} ${hour} * * *`;
  return scheduleJob(name, cronExpression, callback);
}

export function stopJob(name: string): boolean {
  const job = scheduledJobs.get(name);
  if (job) {
    job.task.stop();
    scheduledJobs.delete(name);
    console.log(`Stopped job: ${name}`);
    return true;
  }
  return false;
}

export function stopAllJobs(): void {
  for (const [name, job] of scheduledJobs) {
    job.task.stop();
    console.log(`Stopped job: ${name}`);
  }
  scheduledJobs.clear();
}

export function getScheduledJobs(): ScheduledJob[] {
  return Array.from(scheduledJobs.values());
}

export function isValidCronExpression(expression: string): boolean {
  return cron.validate(expression);
}
