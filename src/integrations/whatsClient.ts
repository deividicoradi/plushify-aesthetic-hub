import axios, { AxiosInstance } from 'axios';

// Simple in-memory throttle queue: 1 request per second
class ThrottledClient {
  private queue: (() => void)[] = [];
  private running = false;
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL, timeout: 15000 });

    // Instance-scoped interceptor only (no globals)
    this.client.interceptors.response.use(
      (res) => res,
      async (err) => {
        const status = err?.response?.status;
        if (status === 429) {
          const retryAfter = Number(err.response.headers['retry-after'] || 1);
          await new Promise((r) => setTimeout(r, Math.min(1000 * retryAfter, 10000)));
          return this.client.request(err.config);
        }
        return Promise.reject(err);
      }
    );
  }

  private start() {
    if (this.running) return;
    this.running = true;
    const tick = () => {
      const job = this.queue.shift();
      if (job) job();
      if (this.queue.length > 0) setTimeout(tick, 1000);
      else this.running = false;
    };
    setTimeout(tick, 0);
  }

  request<T = any>(config: Parameters<AxiosInstance['request']>[0]) {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const res = await this.client.request<T>(config);
          resolve(res.data as T);
        } catch (e) {
          if ((e as any)?.response?.status === 429) {
            resolve(({
              __rateLimited: true,
              message: 'Rate limit atingido',
            } as unknown) as T);
            return;
          }
          reject(e);
        }
      });
      this.start();
    });
  }
}

export function createWhatsClient(baseURL: string) {
  return new ThrottledClient(baseURL);
}

export const WHATSAPP_CLIENT_META = {
  isolated: true,
  throttle: 'ON',
};
