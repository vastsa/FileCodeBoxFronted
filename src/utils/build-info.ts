const abbreviatedCommit = __GIT_COMMIT__.slice(0, 12)

export const buildInfo = Object.freeze({
  version: __APP_VERSION__,
  commit: abbreviatedCommit,
  displayVersion:
    abbreviatedCommit && abbreviatedCommit !== 'unknown'
      ? `${__APP_VERSION__} (${abbreviatedCommit})`
      : __APP_VERSION__
})
