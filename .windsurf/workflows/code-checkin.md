---
description: Commit and push changes to remote repository
---

# Code Checkin Workflow

This workflow commits your local changes and pushes them to the remote repository.

## Steps

1. **Check git status**
   // turbo
   ```bash
   git status
   ```
   This shows what files have been modified or need to be committed.

2. **Add all changes**
   // turbo
   ```bash
   git add .
   ```
   Stages all modified and new files for commit.

3. **Create commit with descriptive message**
   ```bash
   git commit -m "feat: add home page, pricing page, and Clerk authentication integration"
   ```
   Creates a commit with a descriptive message. You may want to customize the commit message based on what changes you're making.

4. **Push to remote repository**
   // turbo
   ```bash
   git push origin master
   ```
   Pushes the committed changes to the remote repository.

## Usage

Run this workflow when you want to:
- Commit and push your latest changes
- Sync your local work with the remote repository
- Create a checkpoint in your development

## Notes

- Make sure you have committed any sensitive files (like .env files) appropriately
- The workflow assumes you're working on the master branch
- If you're working on a different branch, replace `master` with your branch name
- If there are merge conflicts, you'll need to resolve them manually