'use strict';

const fs = require('fs').promises;
const path = require('path');

class AlgorithmCribsheet {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.algorithmsFile = path.join(this.dataDir, 'algorithms.json');
  }

  async init() {
    await this.ensureDir(this.dataDir);
    await this.createDefaultAlgorithms();
  }

  async ensureDir(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }
  }

  async createDefaultAlgorithms() {
    const algorithms = [
      {
        id: 'binary-search',
        name: 'Binary Search',
        category: 'search',
        difficulty: 'Easy',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Efficiently find an element in a sorted array',
        useCases: ['Finding elements in sorted arrays', 'Finding insertion points', 'Range queries'],
        code: {
          javascript: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1; // Not found
}`,
          python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Not found`,
          java: `public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1; // Not found
}`
        },
        tags: ['search', 'binary', 'sorted', 'logarithmic']
      },
      {
        id: 'two-pointers',
        name: 'Two Pointers',
        category: 'technique',
        difficulty: 'Medium',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Use two pointers to traverse array/list from different positions',
        useCases: ['Finding pairs in sorted array', 'Removing duplicates', 'Palindrome checking', 'Container with most water'],
        code: {
          javascript: `function twoSum(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left < right) {
    const sum = arr[left] + arr[right];
    
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  
  return []; // No solution
}`,
          python: `def two_sum(arr, target):
    left, right = 0, len(arr) - 1
    
    while left < right:
        sum_val = arr[left] + arr[right]
        
        if sum_val == target:
            return [left, right]
        elif sum_val < target:
            left += 1
        else:
            right -= 1
    
    return []  # No solution`,
          java: `public static int[] twoSum(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left < right) {
        int sum = arr[left] + arr[right];
        
        if (sum == target) return new int[]{left, right};
        else if (sum < target) left++;
        else right--;
    }
    
    return new int[]{}; // No solution
}`
        },
        tags: ['pointers', 'array', 'technique', 'linear']
      },
      {
        id: 'sliding-window',
        name: 'Sliding Window',
        category: 'technique',
        difficulty: 'Medium',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Maintain a window of elements and slide it across the array',
        useCases: ['Maximum sum subarray', 'Longest substring without repeating characters', 'Minimum window substring'],
        code: {
          javascript: `function maxSumSubarray(arr, k) {
  let maxSum = 0, windowSum = 0;
  
  // Calculate sum of first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  
  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }
  
  return maxSum;
}`,
          python: `def max_sum_subarray(arr, k):
    max_sum = window_sum = sum(arr[:k])
    
    for i in range(k, len(arr)):
        window_sum = window_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, window_sum)
    
    return max_sum`,
          java: `public static int maxSumSubarray(int[] arr, int k) {
    int maxSum = 0, windowSum = 0;
    
    // Calculate sum of first window
    for (int i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    maxSum = windowSum;
    
    // Slide the window
    for (int i = k; i < arr.length; i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
}`
        },
        tags: ['window', 'subarray', 'technique', 'linear']
      },
      {
        id: 'dfs',
        name: 'Depth-First Search',
        category: 'graph',
        difficulty: 'Medium',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        description: 'Traverse graph by going as deep as possible before backtracking',
        useCases: ['Path finding', 'Cycle detection', 'Topological sorting', 'Connected components'],
        code: {
          javascript: `function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  
  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}

// Iterative version
function dfsIterative(graph, start) {
  const stack = [start];
  const visited = new Set();
  
  while (stack.length > 0) {
    const node = stack.pop();
    
    if (!visited.has(node)) {
      visited.add(node);
      console.log(node);
      
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }
}`,
          python: `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(start)
    print(start)
    
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)

# Iterative version
def dfs_iterative(graph, start):
    stack = [start]
    visited = set()
    
    while stack:
        node = stack.pop()
        
        if node not in visited:
            visited.add(node)
            print(node)
            
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)`,
          java: `public static void dfs(Map<Integer, List<Integer>> graph, int start, Set<Integer> visited) {
    visited.add(start);
    System.out.println(start);
    
    for (int neighbor : graph.getOrDefault(start, new ArrayList<>())) {
        if (!visited.contains(neighbor)) {
            dfs(graph, neighbor, visited);
        }
    }
}

// Iterative version
public static void dfsIterative(Map<Integer, List<Integer>> graph, int start) {
    Stack<Integer> stack = new Stack<>();
    Set<Integer> visited = new HashSet<>();
    
    stack.push(start);
    
    while (!stack.isEmpty()) {
        int node = stack.pop();
        
        if (!visited.contains(node)) {
            visited.add(node);
            System.out.println(node);
            
            for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {
                if (!visited.contains(neighbor)) {
                    stack.push(neighbor);
                }
            }
        }
    }
}`
        },
        tags: ['graph', 'traversal', 'recursion', 'stack']
      },
      {
        id: 'bfs',
        name: 'Breadth-First Search',
        category: 'graph',
        difficulty: 'Medium',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        description: 'Traverse graph level by level using a queue',
        useCases: ['Shortest path in unweighted graph', 'Level order traversal', 'Minimum steps to reach target'],
        code: {
          javascript: `function bfs(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const node = queue.shift();
    console.log(node);
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
          python: `from collections import deque

def bfs(graph, start):
    queue = deque([start])
    visited = {start}
    
    while queue:
        node = queue.popleft()
        print(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
          java: `public static void bfs(Map<Integer, List<Integer>> graph, int start) {
    Queue<Integer> queue = new LinkedList<>();
    Set<Integer> visited = new HashSet<>();
    
    queue.offer(start);
    visited.add(start);
    
    while (!queue.isEmpty()) {
        int node = queue.poll();
        System.out.println(node);
        
        for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.offer(neighbor);
            }
        }
    }
}`
        },
        tags: ['graph', 'traversal', 'queue', 'level-order']
      },
      {
        id: 'dynamic-programming',
        name: 'Dynamic Programming',
        category: 'technique',
        difficulty: 'Hard',
        timeComplexity: 'Varies',
        spaceComplexity: 'Varies',
        description: 'Solve complex problems by breaking them into simpler subproblems',
        useCases: ['Fibonacci sequence', 'Longest common subsequence', 'Knapsack problem', 'Edit distance'],
        code: {
          javascript: `// Fibonacci with memoization
function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 2) return 1;
  
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

// Bottom-up approach
function fibonacciDP(n) {
  if (n <= 2) return 1;
  
  const dp = [0, 1, 1];
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}`,
          python: `# Fibonacci with memoization
def fibonacci(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 2:
        return 1
    
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]

# Bottom-up approach
def fibonacci_dp(n):
    if n <= 2:
        return 1
    
    dp = [0, 1, 1]
    for i in range(3, n + 1):
        dp.append(dp[i - 1] + dp[i - 2])
    
    return dp[n]`,
          java: `// Fibonacci with memoization
public static int fibonacci(int n, Map<Integer, Integer> memo) {
    if (memo.containsKey(n)) return memo.get(n);
    if (n <= 2) return 1;
    
    int result = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
    memo.put(n, result);
    return result;
}

// Bottom-up approach
public static int fibonacciDP(int n) {
    if (n <= 2) return 1;
    
    int[] dp = new int[n + 1];
    dp[1] = dp[2] = 1;
    
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}`
        },
        tags: ['optimization', 'memoization', 'recursion', 'subproblems']
      }
    ];

    try {
      await fs.writeFile(this.algorithmsFile, JSON.stringify(algorithms, null, 2));
    } catch (err) {
      // File might already exist
    }
  }

  async searchAlgorithms(query, filters = {}) {
    try {
      const algorithms = JSON.parse(await fs.readFile(this.algorithmsFile, 'utf8'));
      
      let filtered = algorithms.filter(algorithm => {
        // Text search
        const searchText = query.toLowerCase();
        const matchesText = !query || 
          algorithm.name.toLowerCase().includes(searchText) ||
          algorithm.description.toLowerCase().includes(searchText) ||
          algorithm.tags.some(tag => tag.toLowerCase().includes(searchText)) ||
          algorithm.useCases.some(useCase => useCase.toLowerCase().includes(searchText));

        // Filter by category
        const matchesCategory = !filters.category || algorithm.category === filters.category;

        // Filter by difficulty
        const matchesDifficulty = !filters.difficulty || algorithm.difficulty === filters.difficulty;

        // Filter by tags
        const matchesTags = !filters.tags || filters.tags.every(tag => 
          algorithm.tags.includes(tag)
        );

        return matchesText && matchesCategory && matchesDifficulty && matchesTags;
      });

      return filtered;
    } catch (err) {
      return [];
    }
  }

  async getAlgorithm(id) {
    try {
      const algorithms = JSON.parse(await fs.readFile(this.algorithmsFile, 'utf8'));
      return algorithms.find(alg => alg.id === id);
    } catch (err) {
      return null;
    }
  }

  async getCategories() {
    try {
      const algorithms = JSON.parse(await fs.readFile(this.algorithmsFile, 'utf8'));
      const categories = [...new Set(algorithms.map(alg => alg.category))];
      return categories.sort();
    } catch (err) {
      return [];
    }
  }

  async getTags() {
    try {
      const algorithms = JSON.parse(await fs.readFile(this.algorithmsFile, 'utf8'));
      const allTags = algorithms.flatMap(alg => alg.tags);
      const uniqueTags = [...new Set(allTags)];
      return uniqueTags.sort();
    } catch (err) {
      return [];
    }
  }

  async addAlgorithm(algorithm) {
    try {
      const algorithms = JSON.parse(await fs.readFile(this.algorithmsFile, 'utf8'));
      algorithms.push(algorithm);
      await fs.writeFile(this.algorithmsFile, JSON.stringify(algorithms, null, 2));
      return algorithm;
    } catch (err) {
      throw new Error(`Failed to add algorithm: ${err.message}`);
    }
  }

  async updateAlgorithm(id, updates) {
    try {
      const algorithms = JSON.parse(await fs.readFile(this.algorithmsFile, 'utf8'));
      const index = algorithms.findIndex(alg => alg.id === id);
      
      if (index === -1) {
        throw new Error(`Algorithm ${id} not found`);
      }

      algorithms[index] = { ...algorithms[index], ...updates };
      await fs.writeFile(this.algorithmsFile, JSON.stringify(algorithms, null, 2));
      return algorithms[index];
    } catch (err) {
      throw new Error(`Failed to update algorithm: ${err.message}`);
    }
  }
}

module.exports = AlgorithmCribsheet;
