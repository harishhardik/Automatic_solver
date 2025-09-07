/* global L, io */
'use strict';

(function main() {
  // Tab switching functionality
  const tabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      
      // Load data for the active tab
      loadTabData(targetTab);
    });
  });

  // Problem form submission
  const problemForm = document.getElementById('problem-form');
  problemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('problem-name').value,
      difficulty: document.getElementById('problem-difficulty').value,
      language: document.getElementById('problem-language').value,
      tags: document.getElementById('problem-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
      description: document.getElementById('problem-description').value,
      sampleInput: document.getElementById('sample-input').value,
      sampleOutput: document.getElementById('sample-output').value
    };

    try {
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showAlert('Problem created successfully!', 'success');
        problemForm.reset();
        loadProblems();
      } else {
        const error = await response.json();
        showAlert(`Error: ${error.error}`, 'error');
      }
    } catch (err) {
      showAlert(`Error: ${err.message}`, 'error');
    }
  });

  // Algorithm search functionality
  const algorithmSearch = document.getElementById('algorithm-search');
  const algorithmCategory = document.getElementById('algorithm-category');
  const algorithmDifficulty = document.getElementById('algorithm-difficulty');

  [algorithmSearch, algorithmCategory, algorithmDifficulty].forEach(element => {
    element.addEventListener('input', debounce(searchAlgorithms, 300));
  });

  // Load initial data
  loadTabData('problems');

  // Functions
  function loadTabData(tabName) {
    switch (tabName) {
      case 'problems':
        loadProblems();
        break;
      case 'algorithms':
        loadAlgorithmCategories();
        searchAlgorithms();
        break;
      case 'practice':
        // Practice tab doesn't need initial data loading
        break;
      case 'tracking':
        loadStatistics();
        loadProgressGoals();
        loadRecentSessions();
        break;
    }
  }

  async function loadProblems() {
    try {
      const response = await fetch('/api/problems');
      const data = await response.json();
      
      const problemsList = document.getElementById('problems-list');
      
      if (data.problems.length === 0) {
        problemsList.innerHTML = '<div class="alert alert-info">No problems created yet. Create your first problem above!</div>';
        return;
      }

      problemsList.innerHTML = data.problems.map(problem => `
        <div class="problem-item">
          <div class="problem-title">${problem.name}</div>
          <div class="problem-meta">
            <span>Difficulty: ${problem.difficulty}</span>
            <span>Status: ${problem.status}</span>
            <span>Created: ${new Date(problem.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="problem-tags">
            ${problem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div style="margin-top: 1rem;">
            <button class="btn btn-secondary" onclick="viewProblem('${problem.id}')">View</button>
            <button class="btn btn-success" onclick="markSolved('${problem.id}')">Mark Solved</button>
            <button class="btn btn-danger" onclick="deleteProblem('${problem.id}')">Delete</button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      document.getElementById('problems-list').innerHTML = 
        '<div class="alert alert-error">Error loading problems</div>';
    }
  }

  async function loadAlgorithmCategories() {
    try {
      const response = await fetch('/api/algorithms/categories');
      const data = await response.json();
      
      const categorySelect = document.getElementById('algorithm-category');
      categorySelect.innerHTML = '<option value="">All Categories</option>' +
        data.categories.map(category => 
          `<option value="${category}">${category}</option>`
        ).join('');
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async function searchAlgorithms() {
    const query = algorithmSearch.value;
    const category = algorithmCategory.value;
    const difficulty = algorithmDifficulty.value;

    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);

      const response = await fetch(`/api/algorithms?${params}`);
      const data = await response.json();
      
      const algorithmsList = document.getElementById('algorithms-list');
      
      if (data.algorithms.length === 0) {
        algorithmsList.innerHTML = '<div class="alert alert-info">No algorithms found matching your criteria.</div>';
        return;
      }

      algorithmsList.innerHTML = data.algorithms.map(algorithm => `
        <div class="algorithm-card">
          <div class="algorithm-title">${algorithm.name}</div>
          <div class="algorithm-meta">
            <span>Category: ${algorithm.category}</span> • 
            <span>Difficulty: ${algorithm.difficulty}</span> • 
            <span>Time: ${algorithm.timeComplexity}</span>
          </div>
          <p style="margin: 0.5rem 0; color: #666;">${algorithm.description}</p>
          <div class="problem-tags">
            ${algorithm.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <button class="btn" onclick="viewAlgorithm('${algorithm.id}')">View Details</button>
        </div>
      `).join('');
    } catch (err) {
      document.getElementById('algorithms-list').innerHTML = 
        '<div class="alert alert-error">Error loading algorithms</div>';
    }
  }

  async function loadStatistics() {
    try {
      const response = await fetch('/api/practice/statistics');
      const stats = await response.json();
      
      document.getElementById('total-problems').textContent = stats.totalProblems || 0;
      document.getElementById('solved-problems').textContent = stats.solvedProblems || 0;
      document.getElementById('current-streak').textContent = stats.streak || 0;
      document.getElementById('avg-time').textContent = Math.round(stats.averageTime || 0);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }

  async function loadProgressGoals() {
    try {
      const response = await fetch('/api/practice/progress');
      const progress = await response.json();
      
      const progressGoals = document.getElementById('progress-goals');
      
      progressGoals.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Daily Goal</span>
            <span>${progress.daily.completed}/${progress.daily.target}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.daily.progress}%"></div>
          </div>
        </div>
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Weekly Goal</span>
            <span>${progress.weekly.completed}/${progress.weekly.target}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.weekly.progress}%"></div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Monthly Goal</span>
            <span>${progress.monthly.completed}/${progress.monthly.target}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.monthly.progress}%"></div>
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  }

  async function loadRecentSessions() {
    try {
      const response = await fetch('/api/practice/sessions?limit=5');
      const data = await response.json();
      
      const recentSessions = document.getElementById('recent-sessions');
      
      if (data.sessions.length === 0) {
        recentSessions.innerHTML = '<div class="alert alert-info">No practice sessions yet.</div>';
        return;
      }

      recentSessions.innerHTML = data.sessions.map(session => `
        <div class="problem-item">
          <div class="problem-title">${session.problemName}</div>
          <div class="problem-meta">
            <span>Status: ${session.status}</span>
            <span>Difficulty: ${session.difficulty}</span>
            <span>Time: ${session.timeSpent || 0} min</span>
            <span>Date: ${new Date(session.timestamp).toLocaleDateString()}</span>
          </div>
          <div class="problem-tags">
            ${session.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      `).join('');
    } catch (err) {
      document.getElementById('recent-sessions').innerHTML = 
        '<div class="alert alert-error">Error loading recent sessions</div>';
    }
  }

  function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insert at the top of the active tab content
    const activeTab = document.querySelector('.tab-content.active');
    activeTab.insertBefore(alertDiv, activeTab.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Global functions for button clicks
  window.viewProblem = async function(problemId) {
    try {
      const response = await fetch(`/api/problems/${problemId}`);
      const problem = await response.json();
      
      // Create a modal or new page to show problem details
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 1000; display: flex;
        align-items: center; justify-content: center;
      `;
      
      modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
          <h2>${problem.metadata.name}</h2>
          <p><strong>Difficulty:</strong> ${problem.metadata.difficulty}</p>
          <p><strong>Description:</strong> ${problem.metadata.description}</p>
          <p><strong>Sample Input:</strong></p>
          <div class="code-block">${problem.metadata.sampleInput}</div>
          <p><strong>Sample Output:</strong></p>
          <div class="code-block">${problem.metadata.sampleOutput}</div>
          <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      `;
      
      modal.className = 'modal';
      document.body.appendChild(modal);
    } catch (err) {
      showAlert(`Error loading problem: ${err.message}`, 'error');
    }
  };

  window.markSolved = async function(problemId) {
    try {
      const response = await fetch(`/api/problems/${problemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'solved' })
      });

      if (response.ok) {
        showAlert('Problem marked as solved!', 'success');
        loadProblems();
      } else {
        showAlert('Error updating problem status', 'error');
      }
    } catch (err) {
      showAlert(`Error: ${err.message}`, 'error');
    }
  };

  window.deleteProblem = async function(problemId) {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      // Note: You'd need to implement a DELETE endpoint for this
      showAlert('Delete functionality not implemented yet', 'info');
    } catch (err) {
      showAlert(`Error: ${err.message}`, 'error');
    }
  };

  window.viewAlgorithm = async function(algorithmId) {
    try {
      const response = await fetch(`/api/algorithms/${algorithmId}`);
      const algorithm = await response.json();
      
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 1000; display: flex;
        align-items: center; justify-content: center;
      `;
      
      modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 800px; max-height: 80vh; overflow-y: auto;">
          <h2>${algorithm.name}</h2>
          <p><strong>Category:</strong> ${algorithm.category}</p>
          <p><strong>Difficulty:</strong> ${algorithm.difficulty}</p>
          <p><strong>Time Complexity:</strong> ${algorithm.timeComplexity}</p>
          <p><strong>Space Complexity:</strong> ${algorithm.spaceComplexity}</p>
          <p><strong>Description:</strong> ${algorithm.description}</p>
          <p><strong>Use Cases:</strong></p>
          <ul>
            ${algorithm.useCases.map(useCase => `<li>${useCase}</li>`).join('')}
          </ul>
          <p><strong>JavaScript Implementation:</strong></p>
          <div class="code-block">${algorithm.code.javascript}</div>
          <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      `;
      
      modal.className = 'modal';
      document.body.appendChild(modal);
    } catch (err) {
      showAlert(`Error loading algorithm: ${err.message}`, 'error');
    }
  };

  window.runTests = async function() {
    const problemId = document.getElementById('test-problem-id').value;
    const language = document.getElementById('test-language').value;
    
    if (!problemId) {
      showAlert('Please enter a problem ID', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/problems/${problemId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language })
      });

      const results = await response.json();
      displayTestResults(results);
    } catch (err) {
      showAlert(`Error running tests: ${err.message}`, 'error');
    }
  };

  window.addTestCase = async function() {
    const problemId = document.getElementById('test-problem-id').value;
    
    if (!problemId) {
      showAlert('Please enter a problem ID', 'error');
      return;
    }

    const input = prompt('Enter test input:');
    const expected = prompt('Enter expected output:');
    
    if (!input || !expected) return;

    try {
      const response = await fetch(`/api/problems/${problemId}/test-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, expected })
      });

      if (response.ok) {
        showAlert('Test case added successfully!', 'success');
      } else {
        showAlert('Error adding test case', 'error');
      }
    } catch (err) {
      showAlert(`Error: ${err.message}`, 'error');
    }
  };

  function displayTestResults(results) {
    const testResults = document.getElementById('test-results');
    
    testResults.innerHTML = `
      <div class="alert alert-${results.summary.failed === 0 ? 'success' : 'error'}">
        Tests: ${results.summary.passed}/${results.summary.total} passed
      </div>
      ${results.details.map(test => `
        <div class="test-case ${test.passed ? '' : 'failed'}">
          <h4>${test.testName} - ${test.passed ? 'PASSED' : 'FAILED'}</h4>
          <div class="test-input"><strong>Input:</strong> ${test.input}</div>
          <div class="test-input"><strong>Expected:</strong> ${test.expected}</div>
          <div class="test-input"><strong>Actual:</strong> ${test.actual}</div>
          ${test.diff ? `<div class="code-block"><strong>Diff:</strong><br>${test.diff}</div>` : ''}
          ${test.error ? `<div class="alert alert-error">Error: ${test.error}</div>` : ''}
        </div>
      `).join('')}
    `;
  }
})();
