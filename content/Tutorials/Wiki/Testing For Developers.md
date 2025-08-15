---
tags: [tutorials/wiki]
---

There are other ways to work on the wiki, but I recommend the following if you know how to use the **command line**. This assumes **I have added you as a collaborator**:

1. Clone the repo

```bash
git clone https://github.com/Gassandrid/crdg.xyz
```

2. (requires npm) install dependencies/running/saving

```bash
cd crdg.xyz

# install libs
npm i

# to run on ur own machine
npx quartz build --serve

# to SAVE YOUR CHANGES
npx quartz sync
```

## To Edit the Actual Wiki

You will need the note-taking app obsidian(https://obsidian.md/).

When prompted to open a vault, open the files at crdg.xyz/Content/ in the repo you just cloned.

Obsidian is new but you can do all the fancy format stuff using right click menu

<img width="600" height="600" alt="image" src="https://github.com/user-attachments/assets/61614576-cfe7-493d-8fb1-ab7407f2282c" />

---

## Pull Requests

For those not familiar with git, you can also make a pull request. This is a way to suggest changes to the wiki without needing to clone the repo.

To do this, you can:

1. **Fork the repository** - Click the "Fork" button on the GitHub page to create your own copy
2. **Create a new branch** - It's a good practice to create a new branch for your changes
3. **Make your changes** - Edit files directly in GitHub's web interface or clone your fork locally
4. **Create a pull request** - Click "New pull request" to propose your changes to the main repository

### Using GitHub's Web Interface

1. Navigate to the file you want to edit on GitHub
2. Click the pencil icon (✏️) to edit the file
3. Make your changes using GitHub's markdown editor
4. Scroll down and add a commit message describing your changes
5. Click "Propose changes"
6. On the next page, click "Create pull request"
7. Add a title and description for your pull request
8. Click "Create pull request" to submit

### What Happens Next

- Repository maintainers will review your changes
- They may suggest modifications or ask questions
- Once approved, your changes will be merged into the main wiki
- You'll receive notifications about the status of your pull request

This method is perfect for small edits like fixing typos, adding content, or updating information without needing to set up the full development environment.
