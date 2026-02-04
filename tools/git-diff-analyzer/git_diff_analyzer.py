#!/usr/bin/env python3
"""
Git Diff Analyzer - Uses OpenAI to analyze code changes from git diff.

This tool analyzes git diff output and generates:
- Code review comments
- Summary of changes
- Potential bugs/issues
- Security vulnerabilities
"""

import argparse
import json
import os
import subprocess
import sys
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def get_git_diff(repo_path: str = ".", base_branch: Optional[str] = None, 
                 target_branch: Optional[str] = None, staged: bool = False) -> str:
    """Get git diff output from a repository."""
    try:
        os.chdir(repo_path)
        
        if base_branch and target_branch:
            cmd = ["git", "diff", f"{base_branch}...{target_branch}"]
        elif staged:
            cmd = ["git", "diff", "--staged"]
        else:
            cmd = ["git", "diff", "HEAD"]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running git diff: {e.stderr}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"Repository path not found: {repo_path}")
        sys.exit(1)


def analyze_diff_with_openai(diff_content: str, api_key: str) -> dict:
    """Analyze git diff using OpenAI API."""
    
    if not diff_content.strip():
        return {
            "summary": "No changes detected in the diff.",
            "code_review_comments": [],
            "potential_bugs": [],
            "security_vulnerabilities": []
        }
    
    client = OpenAI(api_key=api_key)
    
    system_prompt = """You are an expert code reviewer and security analyst. 
Analyze the provided git diff and generate a comprehensive analysis in JSON format.

Your response MUST be valid JSON with the following structure:
{
    "summary": "A concise summary of all changes made (2-3 paragraphs)",
    "code_review_comments": [
        {
            "file": "filename",
            "line": "line number or range",
            "type": "suggestion|improvement|question|praise",
            "comment": "detailed comment about the code"
        }
    ],
    "potential_bugs": [
        {
            "file": "filename",
            "line": "line number or range",
            "severity": "low|medium|high|critical",
            "description": "description of the potential bug",
            "recommendation": "how to fix it"
        }
    ],
    "security_vulnerabilities": [
        {
            "file": "filename",
            "line": "line number or range",
            "severity": "low|medium|high|critical",
            "vulnerability_type": "type of vulnerability (e.g., SQL Injection, XSS, etc.)",
            "description": "description of the security issue",
            "recommendation": "how to fix it"
        }
    ]
}

Be thorough but avoid false positives. Only report genuine issues.
If there are no issues in a category, return an empty array for that category."""

    user_prompt = f"""Please analyze the following git diff and provide your analysis:

```diff
{diff_content}
```

Provide your analysis in the JSON format specified."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except json.JSONDecodeError as e:
        print(f"Error parsing OpenAI response: {e}")
        return {
            "error": "Failed to parse analysis results",
            "raw_response": response.choices[0].message.content if response else None
        }
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        sys.exit(1)


def format_output(analysis: dict, output_format: str = "text") -> str:
    """Format the analysis output."""
    
    if output_format == "json":
        return json.dumps(analysis, indent=2)
    
    # Text format
    output = []
    output.append("=" * 80)
    output.append("GIT DIFF ANALYSIS REPORT")
    output.append("=" * 80)
    
    # Summary
    output.append("\n## SUMMARY OF CHANGES\n")
    output.append(analysis.get("summary", "No summary available."))
    
    # Code Review Comments
    output.append("\n" + "-" * 80)
    output.append("\n## CODE REVIEW COMMENTS\n")
    comments = analysis.get("code_review_comments", [])
    if comments:
        for i, comment in enumerate(comments, 1):
            output.append(f"{i}. [{comment.get('type', 'comment').upper()}] {comment.get('file', 'unknown')}:{comment.get('line', '?')}")
            output.append(f"   {comment.get('comment', '')}\n")
    else:
        output.append("No code review comments.")
    
    # Potential Bugs
    output.append("\n" + "-" * 80)
    output.append("\n## POTENTIAL BUGS/ISSUES\n")
    bugs = analysis.get("potential_bugs", [])
    if bugs:
        for i, bug in enumerate(bugs, 1):
            severity = bug.get('severity', 'unknown').upper()
            output.append(f"{i}. [{severity}] {bug.get('file', 'unknown')}:{bug.get('line', '?')}")
            output.append(f"   Description: {bug.get('description', '')}")
            output.append(f"   Recommendation: {bug.get('recommendation', '')}\n")
    else:
        output.append("No potential bugs detected.")
    
    # Security Vulnerabilities
    output.append("\n" + "-" * 80)
    output.append("\n## SECURITY VULNERABILITIES\n")
    vulns = analysis.get("security_vulnerabilities", [])
    if vulns:
        for i, vuln in enumerate(vulns, 1):
            severity = vuln.get('severity', 'unknown').upper()
            vuln_type = vuln.get('vulnerability_type', 'unknown')
            output.append(f"{i}. [{severity}] {vuln_type} - {vuln.get('file', 'unknown')}:{vuln.get('line', '?')}")
            output.append(f"   Description: {vuln.get('description', '')}")
            output.append(f"   Recommendation: {vuln.get('recommendation', '')}\n")
    else:
        output.append("No security vulnerabilities detected.")
    
    output.append("\n" + "=" * 80)
    output.append("END OF REPORT")
    output.append("=" * 80)
    
    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(
        description="Analyze git diff using OpenAI to generate code review comments, "
                    "summary, potential bugs, and security vulnerabilities."
    )
    parser.add_argument(
        "--repo", "-r",
        default=".",
        help="Path to the git repository (default: current directory)"
    )
    parser.add_argument(
        "--base", "-b",
        help="Base branch for comparison (e.g., main, master)"
    )
    parser.add_argument(
        "--target", "-t",
        help="Target branch for comparison (e.g., feature-branch)"
    )
    parser.add_argument(
        "--staged", "-s",
        action="store_true",
        help="Analyze staged changes only"
    )
    parser.add_argument(
        "--diff-file", "-d",
        help="Path to a file containing git diff output (instead of running git diff)"
    )
    parser.add_argument(
        "--output", "-o",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    parser.add_argument(
        "--api-key", "-k",
        help="OpenAI API key (can also be set via OPENAI_API_KEY environment variable)"
    )
    parser.add_argument(
        "--save", 
        help="Save output to a file"
    )
    
    args = parser.parse_args()
    
    # Get API key
    api_key = args.api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OpenAI API key is required.")
        print("Set it via --api-key argument or OPENAI_API_KEY environment variable.")
        sys.exit(1)
    
    # Get diff content
    if args.diff_file:
        try:
            with open(args.diff_file, "r") as f:
                diff_content = f.read()
        except FileNotFoundError:
            print(f"Error: Diff file not found: {args.diff_file}")
            sys.exit(1)
    else:
        diff_content = get_git_diff(
            repo_path=args.repo,
            base_branch=args.base,
            target_branch=args.target,
            staged=args.staged
        )
    
    if not diff_content.strip():
        print("No changes detected in the diff.")
        sys.exit(0)
    
    print("Analyzing diff with OpenAI...\n")
    
    # Analyze with OpenAI
    analysis = analyze_diff_with_openai(diff_content, api_key)
    
    # Format and output
    formatted_output = format_output(analysis, args.output)
    print(formatted_output)
    
    # Save to file if requested
    if args.save:
        with open(args.save, "w") as f:
            f.write(formatted_output)
        print(f"\nOutput saved to: {args.save}")


if __name__ == "__main__":
    main()
