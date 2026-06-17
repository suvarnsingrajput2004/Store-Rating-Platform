# Contributing to Store Rating Platform

First off, thank you for considering contributing to the Store Rating Platform! It's people like you that make such tools better.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please create an issue on GitHub. Include:
- A clear descriptive title.
- Steps to reproduce the behavior.
- Expected vs Actual behavior.
- Any relevant logs or screenshots.

### Suggesting Enhancements
We are always open to new ideas. If you want to propose a feature:
- Describe the feature in detail.
- Explain why this enhancement would be useful.
- Provide examples of how it should work.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes (`npm run test` or similar scripts).
4. Make sure your code aligns with the existing style.
5. Issue that pull request!

## Setup Environment for Development
1. Clone the repository.
2. Setup MySQL and copy `.env.example` to `.env` in the `backend/` folder.
3. Run `node backend/scripts/setup-database.js`.
4. Run `npm install` in both `backend` and `frontend` directories.
5. Start development servers using `node server.js` and `npm run dev`.

## Code of Conduct
Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.
