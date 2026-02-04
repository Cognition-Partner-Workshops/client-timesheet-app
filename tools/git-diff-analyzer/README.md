# Git Diff Analyzer (Java)

A Java tool that uses OpenAI to analyze git diff and generate:
- Code review comments
- Summary of changes
- Potential bugs/issues
- Security vulnerabilities

## Requirements

- Java 21 or higher
- Maven 3.6+
- OpenAI API key

## Building

```bash
cd tools/git-diff-analyzer
mvn clean package
```

This creates an executable JAR file at `target/git-diff-analyzer-1.0.0.jar`.

## Setup

Set up your OpenAI API key:

```bash
# Option 1: Create a .env file in the same directory
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Option 2: Export as environment variable
export OPENAI_API_KEY=your-api-key-here
```

## Usage

### Basic Usage

Analyze current uncommitted changes:
```bash
java -jar target/git-diff-analyzer-1.0.0.jar
```

### Compare Branches

Compare two branches:
```bash
java -jar target/git-diff-analyzer-1.0.0.jar --base main --target feature-branch
```

### Analyze Staged Changes

Analyze only staged changes:
```bash
java -jar target/git-diff-analyzer-1.0.0.jar --staged
```

### Analyze a Different Repository

```bash
java -jar target/git-diff-analyzer-1.0.0.jar --repo /path/to/repo
```

### Analyze from a Diff File

```bash
java -jar target/git-diff-analyzer-1.0.0.jar --diff-file changes.diff
```

### Output Formats

Text format (default):
```bash
java -jar target/git-diff-analyzer-1.0.0.jar --output text
```

JSON format:
```bash
java -jar target/git-diff-analyzer-1.0.0.jar --output json
```

### Save Output to File

```bash
java -jar target/git-diff-analyzer-1.0.0.jar --save report.txt
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
| `--help` | `-h` | Show help message |

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

1. [SUGGESTION] auth.java:45
   Consider using a constant for the token expiration time instead of hardcoding.

2. [IMPROVEMENT] auth.java:78
   The error handling could be more specific to provide better debugging info.

--------------------------------------------------------------------------------

## POTENTIAL BUGS/ISSUES

1. [MEDIUM] auth.java:52
   Description: The token validation doesn't check for token expiration.
   Recommendation: Add expiration check before validating the token signature.

--------------------------------------------------------------------------------

## SECURITY VULNERABILITIES

1. [HIGH] SQL Injection - database.java:34
   Description: User input is directly concatenated into SQL query.
   Recommendation: Use parameterized queries or an ORM.

================================================================================
END OF REPORT
================================================================================
```

## Dependencies

- OkHttp 4.12.0 - HTTP client for OpenAI API calls
- Jackson 2.16.1 - JSON parsing
- Apache Commons CLI 1.6.0 - Command line argument parsing
- dotenv-java 3.0.0 - Environment variable loading from .env files
