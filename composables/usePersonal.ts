import { personal as staticPersonal } from '~/data/index'

export function usePersonal() {
  return usePreviewableFetch<any>('personal', '/api/personal', {
    key: 'personal',
    default: () => ({
      ...staticPersonal,
      bio_1: staticPersonal.bio[0],
      bio_2: staticPersonal.bio[1],
      short_name: staticPersonal.shortName,
      available_for: staticPersonal.availableFor,
    } as any),
  })
}
