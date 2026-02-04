# Git Diff Analyzer

A Python tool that uses OpenAI to analyze git diff and generate:
- Code review comments
- Summary of changes
- Potential bugs/issues
- Security vulnerabilities

## Installation

1. Create a virtual environment and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install openai python-dotenv
```

2. Set up your OpenAI API key:
```bash
# Option 1: Create a .env file
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Option 2: Export as environment variable
export OPENAI_API_KEY=your-api-key-here
```

## Usage

### Basic Usage

Analyze current uncommitted changes:
```bash
python git_diff_analyzer.py
```

### Compare Branches

Compare two branches:
```bash
python git_diff_analyzer.py --base main --target feature-branch
```

### Analyze Staged Changes

Analyze only staged changes:
```bash
python git_diff_analyzer.py --staged
```

### Analyze a Different Repository

```bash
python git_diff_analyzer.py --repo /path/to/repo
```

### Analyze from a Diff File

```bash
python git_diff_analyzer.py --diff-file changes.diff
```

### Output Formats

Text format (default):
```bash
python git_diff_analyzer.py --output text
```

JSON format:
```bash
python git_diff_analyzer.py --output json
```

### Save Output to File

```bash
python git_diff_analyzer.py --save report.txt
```

## Command Line Options

| Option | Short | Description |
|--------|-------|-------------|
| `--repo` | `-r` | Path to git repository (default: current directory) |
| `--base` | `-b` | Base branch for comparison |
| `--target` | `-t` | Target branch for comparison |
| `--staged` | `-s` | Analyze staged changes only |
| `--diff-file` | `-d` | Path to a file containing git diff output |
| `--output` | `-o` | Output format: text or json (default: text) |
| `--api-key` | `-k` | OpenAI API key |
| `--save` | | Save output to a file |

## Example Output

```
================================================================================
GIT DIFF ANALYSIS REPORT
================================================================================

## SUMMARY OF CHANGES

This change adds a new user authentication feature with login and logout 
functionality. The implementation includes JWT token generation and validation.

--------------------------------------------------------------------------------

## CODE REVIEW COMMENTS

1. [SUGGESTION] auth.py:45
   Consider using a constant for the token expiration time instead of hardcoding.

2. [IMPROVEMENT] auth.py:78
   The error handling could be more specific to provide better debugging info.

--------------------------------------------------------------------------------

## POTENTIAL BUGS/ISSUES

1. [MEDIUM] auth.py:52
   Description: The token validation doesn't check for token expiration.
   Recommendation: Add expiration check before validating the token signature.

--------------------------------------------------------------------------------

## SECURITY VULNERABILITIES

1. [HIGH] SQL Injection - database.py:34
   Description: User input is directly concatenated into SQL query.
   Recommendation: Use parameterized queries or an ORM.

================================================================================
END OF REPORT
================================================================================
```

## Requirements

- Python 3.8+
- OpenAI API key
- Git installed and accessible from command line
