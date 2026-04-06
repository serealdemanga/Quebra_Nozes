import type { ApiProfileContextGetEnvelope, ProfileContextPayload, ProfileContextPutData } from '../../core/data/contracts';
import type { ProfileDataSource } from '../../core/data/data_sources';

export type ProfilePatch = Partial<ProfileContextPayload>;

export interface ProfileController {
  load(): Promise<ApiProfileContextGetEnvelope>;
  save(patch: ProfilePatch): Promise<{ ok: true; data: ProfileContextPutData } | { ok: false; message: string }>;
}

/**
 * Edicao posterior do perfil (E2E-003).
 * Regra: enviar patch dentro de `context` e sem `step` para nao reabrir onboarding.
 */
export function createProfileController(input: { profile: ProfileDataSource }): ProfileController {
  const profile = input.profile;

  return {
    load() {
      return profile.getProfileContext();
    },
    async save(patch) {
      const result = await profile.putProfileContext({ context: sanitizePatch(patch) });
      if (!result.ok) return { ok: false, message: `${result.error.code}: ${result.error.message}` };
      return { ok: true, data: result.data };
    }
  };
}

function sanitizePatch(patch: ProfilePatch): ProfilePatch {
  // Evita escrever "undefined" no wire. `null` continua permitido (se a UI quiser limpar).
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean as ProfilePatch;
}

