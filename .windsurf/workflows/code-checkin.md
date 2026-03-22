---
description: Commit and push changes to remote repository
---

# Code Checkin Workflow

This workflow creates a new Cascade instance with the SWE-1.5 model to intelligently commit and push changes to the remote repository.

## Steps

1. **Create new Cascade instance with SWE-1.5 model**
   The workflow will spawn a new Cascade instance using the SWE-1.5 model to handle the intelligent execution of the remaining steps.

2. **Check git status**
   ```bash
   git status
   ```
   The SWE-1.5 model will analyze the git status to understand what files have been modified or need to be committed.

3. **Add all changes**
   ```bash
   git add .
   ```
   The SWE-1.5 model will stage all modified and new files for commit.

4. **Create commit with intelligent message**
   The SWE-1.5 model will analyze the staged changes and generate an appropriate commit message based on the modifications detected, following conventional commit standards.

5. **Push to remote repository**
   ```bash
   git push origin master
   ```
   The SWE-1.5 model will push the committed changes to the remote repository and handle any conflicts or errors intelligently.

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