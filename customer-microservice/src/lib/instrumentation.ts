import logger from "./logger";

interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
}

const globalForMetrics = globalThis as unknown as {
  requestMetrics: RequestMetrics[] | undefined;
};

const metrics: RequestMetrics[] = globalForMetrics.requestMetrics ?? [];

globalForMetrics.requestMetrics = metrics;

export function recordRequest(metric: RequestMetrics): void {
  metrics.push(metric);
  logger.info(
    {
      method: metric.method,
      path: metric.path,
      statusCode: metric.statusCode,
      durationMs: metric.durationMs,
    },
    `${metric.method} ${metric.path} completed in ${metric.durationMs}ms with status ${metric.statusCode}`
  );
}

export function getMetrics(): RequestMetrics[] {
  return [...metrics];
}

export function instrumentRoute(
  method: string,
  path: string,
  handler: () => Promise<{ response: Response; statusCode: number }>
): Promise<{ response: Response; statusCode: number }> {
  const start = performance.now();
  logger.info({ method, path }, `Incoming ${method} request to ${path}`);

  return handler()
    .then((result) => {
      const durationMs = Math.round(performance.now() - start);
      recordRequest({
        method,
        path,
        statusCode: result.statusCode,
        durationMs,
        timestamp: new Date().toISOString(),
      });
      return result;
    })
    .catch((error) => {
      const durationMs = Math.round(performance.now() - start);
      logger.error(
        { method, path, error: (error as Error).message, durationMs },
        `${method} ${path} failed after ${durationMs}ms`
      );
      recordRequest({
        method,
        path,
        statusCode: 500,
        durationMs,
        timestamp: new Date().toISOString(),
      });
      throw error;
    });
}
