'use strict';

const fs = require('fs').promises;
const path = require('path');

class ProblemWorkspace {
  constructor() {
    this.workspaceDir = path.join(__dirname, '..', 'workspace');
    this.templatesDir = path.join(__dirname, '..', 'templates');
  }

  async init() {
    await this.ensureDir(this.workspaceDir);
    await this.ensureDir(this.templatesDir);
    await this.createTemplates();
  }

  async ensureDir(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }
  }

  async createTemplates() {
    const templates = {
      'javascript.js': `// Problem: {{PROBLEM_NAME}}
// Difficulty: {{DIFFICULTY}}
// Tags: {{TAGS}}

function solve(input) {
  // Your solution here
  return input;
}

// Test cases
console.log(solve("test input")); // Expected: expected output

// For competitive programming
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = [];
rl.on('line', (line) => {
  input.push(line);
}).on('close', () => {
  console.log(solve(input));
});`,

      'python.py': `# Problem: {{PROBLEM_NAME}}
# Difficulty: {{DIFFICULTY}}
# Tags: {{TAGS}}

def solve(input_data):
    # Your solution here
    return input_data

# Test cases
print(solve("test input"))  # Expected: expected output

# For competitive programming
import sys
input = sys.stdin.read().strip()
print(solve(input))`,

      'java.java': `// Problem: {{PROBLEM_NAME}}
// Difficulty: {{DIFFICULTY}}
// Tags: {{TAGS}}

import java.util.*;
import java.io.*;

public class Solution {
    public static String solve(String input) {
        // Your solution here
        return input;
    }
    
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();
        System.out.println(solve(input));
    }
}`,

      'cpp.cpp': `// Problem: {{PROBLEM_NAME}}
// Difficulty: {{DIFFICULTY}}
// Tags: {{TAGS}}

#include <iostream>
#include <string>
using namespace std;

string solve(string input) {
    // Your solution here
    return input;
}

int main() {
    string input;
    getline(cin, input);
    cout << solve(input) << endl;
    return 0;
}`
    };

    for (const [filename, content] of Object.entries(templates)) {
      const filepath = path.join(this.templatesDir, filename);
      try {
        await fs.writeFile(filepath, content);
      } catch (err) {
        // File might already exist
      }
    }
  }

  async createProblem(problemData) {
    const {
      name,
      difficulty = 'Medium',
      tags = [],
      description = '',
      sampleInput = '',
      sampleOutput = '',
      language = 'javascript'
    } = problemData;

    const problemId = name.toLowerCase().replace(/\s+/g, '-');
    const problemDir = path.join(this.workspaceDir, problemId);
    
    await this.ensureDir(problemDir);

    // Create problem metadata
    const metadata = {
      id: problemId,
      name,
      difficulty,
      tags,
      description,
      sampleInput,
      sampleOutput,
      createdAt: new Date().toISOString(),
      status: 'unsolved'
    };

    await fs.writeFile(
      path.join(problemDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Create solution file
    const templatePath = path.join(this.templatesDir, `${language}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}`);
    let template = '';
    
    try {
      template = await fs.readFile(templatePath, 'utf8');
    } catch (err) {
      // Use default template if specific language template not found
      template = await fs.readFile(path.join(this.templatesDir, 'javascript.js'), 'utf8');
    }

    const solution = template
      .replace(/{{PROBLEM_NAME}}/g, name)
      .replace(/{{DIFFICULTY}}/g, difficulty)
      .replace(/{{TAGS}}/g, tags.join(', '));

    const solutionFile = `solution.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}`;
    await fs.writeFile(path.join(problemDir, solutionFile), solution);

    // Create test cases file
    const testCases = {
      sample: {
        input: sampleInput,
        expected: sampleOutput
      },
      custom: []
    };
    
    await fs.writeFile(
      path.join(problemDir, 'test-cases.json'),
      JSON.stringify(testCases, null, 2)
    );

    return {
      problemId,
      problemDir,
      metadata,
      solutionFile
    };
  }

  async getProblems() {
    try {
      const dirs = await fs.readdir(this.workspaceDir);
      const problems = [];

      for (const dir of dirs) {
        const metadataPath = path.join(this.workspaceDir, dir, 'metadata.json');
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          problems.push(metadata);
        } catch (err) {
          // Skip invalid directories
        }
      }

      return problems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      return [];
    }
  }

  async getProblem(problemId) {
    const problemDir = path.join(this.workspaceDir, problemId);
    const metadataPath = path.join(problemDir, 'metadata.json');
    
    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      const testCasesPath = path.join(problemDir, 'test-cases.json');
      const testCases = JSON.parse(await fs.readFile(testCasesPath, 'utf8'));
      
      return { metadata, testCases };
    } catch (err) {
      throw new Error(`Problem ${problemId} not found`);
    }
  }

  async updateProblemStatus(problemId, status) {
    const problemDir = path.join(this.workspaceDir, problemId);
    const metadataPath = path.join(problemDir, 'metadata.json');
    
    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      metadata.status = status;
      metadata.updatedAt = new Date().toISOString();
      
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      return metadata;
    } catch (err) {
      throw new Error(`Failed to update problem ${problemId}`);
    }
  }
}

module.exports = ProblemWorkspace;
