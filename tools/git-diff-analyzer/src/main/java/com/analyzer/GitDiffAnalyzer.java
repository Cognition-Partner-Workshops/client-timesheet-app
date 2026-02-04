package com.analyzer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.github.cdimascio.dotenv.Dotenv;
import okhttp3.*;
import org.apache.commons.cli.*;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * Git Diff Analyzer - Uses OpenAI to analyze code changes from git diff.
 * 
 * This tool analyzes git diff output and generates:
 * - Code review comments
 * - Summary of changes
 * - Potential bugs/issues
 * - Security vulnerabilities
 */
public class GitDiffAnalyzer {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build();

    public static void main(String[] args) {
        Options options = createOptions();
        CommandLineParser parser = new DefaultParser();
        HelpFormatter formatter = new HelpFormatter();

        try {
            CommandLine cmd = parser.parse(options, args);

            if (cmd.hasOption("help")) {
                formatter.printHelp("git-diff-analyzer", options);
                return;
            }

            // Get API key
            String apiKey = getApiKey(cmd);
            if (apiKey == null || apiKey.isEmpty()) {
                System.err.println("Error: OpenAI API key is required.");
                System.err.println("Set it via --api-key argument or OPENAI_API_KEY environment variable.");
                System.exit(1);
            }

            // Get diff content
            String diffContent = getDiffContent(cmd);
            if (diffContent == null || diffContent.trim().isEmpty()) {
                System.out.println("No changes detected in the diff.");
                System.exit(0);
            }

            System.out.println("Analyzing diff with OpenAI...\n");

            // Analyze with OpenAI
            JsonNode analysis = analyzeDiffWithOpenAI(diffContent, apiKey);

            // Format and output
            String outputFormat = cmd.getOptionValue("output", "text");
            String formattedOutput = formatOutput(analysis, outputFormat);
            System.out.println(formattedOutput);

            // Save to file if requested
            if (cmd.hasOption("save")) {
                String saveFile = cmd.getOptionValue("save");
                Files.writeString(Path.of(saveFile), formattedOutput);
                System.out.println("\nOutput saved to: " + saveFile);
            }

        } catch (ParseException e) {
            System.err.println("Error parsing arguments: " + e.getMessage());
            formatter.printHelp("git-diff-analyzer", options);
            System.exit(1);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static Options createOptions() {
        Options options = new Options();

        options.addOption(Option.builder("r")
                .longOpt("repo")
                .hasArg()
                .desc("Path to the git repository (default: current directory)")
                .build());

        options.addOption(Option.builder("b")
                .longOpt("base")
                .hasArg()
                .desc("Base branch for comparison (e.g., main, master)")
                .build());

        options.addOption(Option.builder("t")
                .longOpt("target")
                .hasArg()
                .desc("Target branch for comparison (e.g., feature-branch)")
                .build());

        options.addOption(Option.builder("s")
                .longOpt("staged")
                .desc("Analyze staged changes only")
                .build());

        options.addOption(Option.builder("d")
                .longOpt("diff-file")
                .hasArg()
                .desc("Path to a file containing git diff output")
                .build());

        options.addOption(Option.builder("o")
                .longOpt("output")
                .hasArg()
                .desc("Output format: text or json (default: text)")
                .build());

        options.addOption(Option.builder("k")
                .longOpt("api-key")
                .hasArg()
                .desc("OpenAI API key")
                .build());

        options.addOption(Option.builder()
                .longOpt("save")
                .hasArg()
                .desc("Save output to a file")
                .build());

        options.addOption(Option.builder("h")
                .longOpt("help")
                .desc("Show help message")
                .build());

        return options;
    }

    private static String getApiKey(CommandLine cmd) {
        if (cmd.hasOption("api-key")) {
            return cmd.getOptionValue("api-key");
        }

        // Try environment variable
        String envKey = System.getenv("OPENAI_API_KEY");
        if (envKey != null && !envKey.isEmpty()) {
            return envKey;
        }

        // Try .env file
        try {
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            return dotenv.get("OPENAI_API_KEY");
        } catch (Exception e) {
            return null;
        }
    }

    private static String getDiffContent(CommandLine cmd) throws IOException, InterruptedException {
        if (cmd.hasOption("diff-file")) {
            return Files.readString(Path.of(cmd.getOptionValue("diff-file")));
        }

        String repoPath = cmd.getOptionValue("repo", ".");
        String baseBranch = cmd.getOptionValue("base");
        String targetBranch = cmd.getOptionValue("target");
        boolean staged = cmd.hasOption("staged");

        return getGitDiff(repoPath, baseBranch, targetBranch, staged);
    }

    private static String getGitDiff(String repoPath, String baseBranch, String targetBranch, boolean staged) 
            throws IOException, InterruptedException {
        ProcessBuilder pb;

        if (baseBranch != null && targetBranch != null) {
            pb = new ProcessBuilder("git", "diff", baseBranch + "..." + targetBranch);
        } else if (staged) {
            pb = new ProcessBuilder("git", "diff", "--staged");
        } else {
            pb = new ProcessBuilder("git", "diff", "HEAD");
        }

        pb.directory(new File(repoPath));
        pb.redirectErrorStream(true);

        Process process = pb.start();
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException("Git diff failed: " + output);
        }

        return output;
    }

    private static JsonNode analyzeDiffWithOpenAI(String diffContent, String apiKey) throws IOException {
        String systemPrompt = """
                You are an expert code reviewer and security analyst.
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
                If there are no issues in a category, return an empty array for that category.""";

        String userPrompt = "Please analyze the following git diff and provide your analysis:\n\n```diff\n" 
                + diffContent + "\n```\n\nProvide your analysis in the JSON format specified.";

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", "gpt-4o");
        requestBody.put("temperature", 0.3);

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "json_object");
        requestBody.set("response_format", responseFormat);

        ArrayNode messages = objectMapper.createArrayNode();

        ObjectNode systemMessage = objectMapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);
        messages.add(systemMessage);

        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", userPrompt);
        messages.add(userMessage);

        requestBody.set("messages", messages);

        RequestBody body = RequestBody.create(
                objectMapper.writeValueAsString(requestBody),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(OPENAI_API_URL)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                throw new RuntimeException("OpenAI API error: " + response.code() + " - " + errorBody);
            }

            String responseBody = response.body().string();
            JsonNode responseJson = objectMapper.readTree(responseBody);
            String content = responseJson.path("choices").get(0).path("message").path("content").asText();
            return objectMapper.readTree(content);
        }
    }

    private static String formatOutput(JsonNode analysis, String outputFormat) {
        if ("json".equalsIgnoreCase(outputFormat)) {
            try {
                return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(analysis);
            } catch (Exception e) {
                return analysis.toString();
            }
        }

        StringBuilder output = new StringBuilder();
        String separator = "=".repeat(80);
        String subSeparator = "-".repeat(80);

        output.append(separator).append("\n");
        output.append("GIT DIFF ANALYSIS REPORT\n");
        output.append(separator).append("\n\n");

        // Summary
        output.append("## SUMMARY OF CHANGES\n\n");
        output.append(analysis.path("summary").asText("No summary available.")).append("\n");

        // Code Review Comments
        output.append("\n").append(subSeparator).append("\n\n");
        output.append("## CODE REVIEW COMMENTS\n\n");
        JsonNode comments = analysis.path("code_review_comments");
        if (comments.isArray() && comments.size() > 0) {
            int i = 1;
            for (JsonNode comment : comments) {
                output.append(String.format("%d. [%s] %s:%s\n",
                        i++,
                        comment.path("type").asText("comment").toUpperCase(),
                        comment.path("file").asText("unknown"),
                        comment.path("line").asText("?")));
                output.append("   ").append(comment.path("comment").asText("")).append("\n\n");
            }
        } else {
            output.append("No code review comments.\n");
        }

        // Potential Bugs
        output.append("\n").append(subSeparator).append("\n\n");
        output.append("## POTENTIAL BUGS/ISSUES\n\n");
        JsonNode bugs = analysis.path("potential_bugs");
        if (bugs.isArray() && bugs.size() > 0) {
            int i = 1;
            for (JsonNode bug : bugs) {
                output.append(String.format("%d. [%s] %s:%s\n",
                        i++,
                        bug.path("severity").asText("unknown").toUpperCase(),
                        bug.path("file").asText("unknown"),
                        bug.path("line").asText("?")));
                output.append("   Description: ").append(bug.path("description").asText("")).append("\n");
                output.append("   Recommendation: ").append(bug.path("recommendation").asText("")).append("\n\n");
            }
        } else {
            output.append("No potential bugs detected.\n");
        }

        // Security Vulnerabilities
        output.append("\n").append(subSeparator).append("\n\n");
        output.append("## SECURITY VULNERABILITIES\n\n");
        JsonNode vulns = analysis.path("security_vulnerabilities");
        if (vulns.isArray() && vulns.size() > 0) {
            int i = 1;
            for (JsonNode vuln : vulns) {
                output.append(String.format("%d. [%s] %s - %s:%s\n",
                        i++,
                        vuln.path("severity").asText("unknown").toUpperCase(),
                        vuln.path("vulnerability_type").asText("unknown"),
                        vuln.path("file").asText("unknown"),
                        vuln.path("line").asText("?")));
                output.append("   Description: ").append(vuln.path("description").asText("")).append("\n");
                output.append("   Recommendation: ").append(vuln.path("recommendation").asText("")).append("\n\n");
            }
        } else {
            output.append("No security vulnerabilities detected.\n");
        }

        output.append("\n").append(separator).append("\n");
        output.append("END OF REPORT\n");
        output.append(separator).append("\n");

        return output.toString();
    }
}
