'use strict';

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class TestHarness {
  constructor() {
    this.workspaceDir = path.join(__dirname, '..', 'workspace');
  }

  async runTests(problemId, language = 'javascript') {
    try {
      const problemDir = path.join(this.workspaceDir, problemId);
      const testCasesPath = path.join(problemDir, 'test-cases.json');
      const testCases = JSON.parse(await fs.readFile(testCasesPath, 'utf8'));
      
      const results = {
        problemId,
        language,
        timestamp: new Date().toISOString(),
        tests: [],
        summary: { passed: 0, failed: 0, total: 0 }
      };

      // Run sample test case
      if (testCases.sample.input) {
        const sampleResult = await this.runSingleTest(
          problemDir,
          language,
          testCases.sample.input,
          testCases.sample.expected,
          'sample'
        );
        results.tests.push(sampleResult);
        results.summary.total++;
        if (sampleResult.passed) results.summary.passed++;
        else results.summary.failed++;
      }

      // Run custom test cases
      for (let i = 0; i < testCases.custom.length; i++) {
        const testCase = testCases.custom[i];
        const customResult = await this.runSingleTest(
          problemDir,
          language,
          testCase.input,
          testCase.expected,
          `custom-${i}`
        );
        results.tests.push(customResult);
        results.summary.total++;
        if (customResult.passed) results.summary.passed++;
        else results.summary.failed++;
      }

      return results;
    } catch (err) {
      throw new Error(`Test execution failed: ${err.message}`);
    }
  }

  async runSingleTest(problemDir, language, input, expected, testName) {
    const solutionFile = this.getSolutionFile(problemDir, language);
    
    try {
      const output = await this.executeCode(solutionFile, language, input);
      const passed = this.compareOutput(output.trim(), expected.trim());
      
      return {
        testName,
        input,
        expected,
        actual: output.trim(),
        passed,
        executionTime: Date.now()
      };
    } catch (err) {
      return {
        testName,
        input,
        expected,
        actual: '',
        passed: false,
        error: err.message,
        executionTime: Date.now()
      };
    }
  }

  getSolutionFile(problemDir, language) {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp'
    };
    
    const ext = extensions[language] || 'js';
    return path.join(problemDir, `solution.${ext}`);
  }

  async executeCode(solutionFile, language, input) {
    return new Promise((resolve, reject) => {
      let command, args;
      
      switch (language) {
        case 'javascript':
          command = 'node';
          args = [solutionFile];
          break;
        case 'python':
          command = 'python';
          args = [solutionFile];
          break;
        case 'java':
          // Compile first, then run
          const className = path.basename(solutionFile, '.java');
          const classFile = path.join(path.dirname(solutionFile), `${className}.class`);
          command = 'java';
          args = [className];
          break;
        case 'cpp':
          // Compile first, then run
          const executable = path.join(path.dirname(solutionFile), 'solution');
          command = executable;
          args = [];
          break;
        default:
          reject(new Error(`Unsupported language: ${language}`));
          return;
      }

      const child = spawn(command, args, {
        cwd: path.dirname(solutionFile),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Execution failed with code ${code}: ${error}`));
        } else {
          resolve(output);
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to start process: ${err.message}`));
      });

      // Send input to stdin
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
    });
  }

  compareOutput(actual, expected) {
    // Simple string comparison - can be enhanced for more complex cases
    return actual === expected;
  }

  async addTestCase(problemId, input, expected) {
    const problemDir = path.join(this.workspaceDir, problemId);
    const testCasesPath = path.join(problemDir, 'test-cases.json');
    
    try {
      const testCases = JSON.parse(await fs.readFile(testCasesPath, 'utf8'));
      testCases.custom.push({ input, expected });
      
      await fs.writeFile(testCasesPath, JSON.stringify(testCases, null, 2));
      return testCases;
    } catch (err) {
      throw new Error(`Failed to add test case: ${err.message}`);
    }
  }

  generateDiffReport(testResults) {
    const report = {
      problemId: testResults.problemId,
      summary: testResults.summary,
      details: []
    };

    for (const test of testResults.tests) {
      const detail = {
        testName: test.testName,
        passed: test.passed,
        input: test.input,
        expected: test.expected,
        actual: test.actual
      };

      if (!test.passed) {
        detail.diff = this.generateDiff(test.expected, test.actual);
      }

      if (test.error) {
        detail.error = test.error;
      }

      report.details.push(detail);
    }

    return report;
  }

  generateDiff(expected, actual) {
    // Simple diff implementation - can be enhanced with a proper diff library
    const expectedLines = expected.split('\n');
    const actualLines = actual.split('\n');
    
    const diff = [];
    const maxLines = Math.max(expectedLines.length, actualLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const expectedLine = expectedLines[i] || '';
      const actualLine = actualLines[i] || '';
      
      if (expectedLine === actualLine) {
        diff.push(`  ${expectedLine}`);
      } else {
        diff.push(`- ${expectedLine}`);
        diff.push(`+ ${actualLine}`);
      }
    }
    
    return diff.join('\n');
  }
}

module.exports = TestHarness;
