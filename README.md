# Preact Starter

Simple project to get started using [Preact](https://preactjs.com) &
[vite](https://vitejs.dev).

## Pre-commit formatting

`pnpm install` installs a pre-commit hook that runs [nano-staged](https://github.com/usmanyunusov/nano-staged)
with Prettier. Nano-staged preserves unstaged edits in partially staged files and
stages the formatted content automatically. Run `pnpm exec nano-staged` to run it
manually, or `pnpm run prepare` to reinstall the hook.

The installer resolves the hook directory through Git, so it supports linked
worktrees and respects `core.hooksPath`. Default hooks are shared between
worktrees, but the hook runs nano-staged using the committing worktree's
configuration and dependencies. Run `pnpm install` in each worktree.

Generated hooks have an ownership marker. The installer can update these hooks
(and this project's older generated hooks), but refuses to overwrite custom hooks
or symlinks. Move an existing custom hook aside before installing this project's
hook; installing it does not merge the existing hook's commands.

## Notes

This template is set up to deploy to GitHub Pages. In order for the build output
to work on GitHub Pages, replace `/preact-starter` in `vite.config.json` with
the `/` + the name of your repo. This change ensures that your scripts are
served from the correct path when deployed to GitHub Pages.
