# Claude Workflow Guide

This repository includes GitHub Actions workflows for Claude Code integration with the following features:

## Features

### 1. Claude Mentions (@claude)
Respond to Claude in issues, PRs, and comments by mentioning `@claude`.

### 2. Clone Repository
Clone an external repository by commenting:
```
@claude clone https://github.com/user/repo.git
```
This will:
- Clone the repository into `external-repos/` directory
- Create a new branch
- Open a PR with the cloned content

### 3. Create Pull Request
Create a new PR by commenting:
```
@claude pr "Feature: Add new authentication system"
```

### 4. Automatic Code Review
Automatically reviews all PRs when they are:
- Opened
- Synchronized (new commits)
- Reopened

The review includes:
- 🐛 Bug detection
- 📝 Code quality analysis
- ⚡ Performance optimization suggestions
- 🔒 Security vulnerability checks
- ✅ Best practices recommendations

## Setup Requirements

1. **Required Secrets:**
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `GITHUB_TOKEN`: Automatically provided by GitHub Actions

2. **Permissions:**
   The workflow requires:
   - Write access to contents
   - Write access to pull requests
   - Write access to issues

## Usage Examples

### Clone a repository:
```
@claude clone https://github.com/example/awesome-project.git
```

### Create a PR with specific title:
```
@claude pr "Feature: Implement dark mode"
```

### Ask Claude to review code:
```
@claude please review this PR for security issues
```

### General Claude assistance:
```
@claude help me fix the TypeError in line 42
```

## Workflow Location
The workflow file is located at: `.github/workflows/claude.yml`