import type { AppEnv, JsonLoader } from './types';
import type { AppDataSources } from './data_sources';
import { createHttpDataSources } from './providers/http_provider';
import { createLocalMockDataSources } from './providers/mock_provider';

export type DataSourceMode = 'mock' | 'http';

export interface DataSourceFactoryInput {
  appEnv: AppEnv;
  mode: DataSourceMode;
  httpBaseUrl?: string;
  mockLoader?: JsonLoader;
}

export function createDataSources(input: DataSourceFactoryInput): AppDataSources {
  if (input.mode === 'mock') {
    if (!input.mockLoader) {
      throw new Error('mockLoader is required when mode=mock');
    }
    return createLocalMockDataSources({
      loader: input.mockLoader
    });
  }

  if (!input.httpBaseUrl) {
    throw new Error('httpBaseUrl is required when mode=http');
  }

  return createHttpDataSources({
    baseUrl: input.httpBaseUrl
  });
}

