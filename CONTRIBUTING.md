# Contributing to GameDev Hub

Thanks for improving GameDev Hub. Small, focused changes are easiest to review and keep the games playable.

## Getting started

1. Create a branch from `master` using a descriptive name, such as `feature/snake-powerups` or `fix/score-validation`.
2. Set up the backend and start the app:

   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. Open `http://localhost:5000` and manually check the game or page you changed.

## Before opening a pull request

- Keep each pull request limited to one feature or fix.
- Run the backend tests:

  ```bash
  cd backend
  pytest tests/ -v --cov=.
  ```

- For frontend or game changes, test the affected controls in a browser.
- Describe the change, testing performed, and any follow-up work in the pull-request description.

## Style guidelines

- Use clear names and keep functions focused.
- Do not commit secrets, local virtual environments, coverage files, or generated build output.
- Preserve the existing vanilla JavaScript and Flask approach unless the change explicitly requires otherwise.

## Reporting issues

Include the game or route affected, steps to reproduce the issue, expected behavior, and actual behavior. Screenshots or console errors are helpful for visual or browser-specific problems.
