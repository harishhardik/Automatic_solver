'use strict';

const fs = require('fs').promises;
const path = require('path');

class PracticeTracker {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.trackerFile = path.join(this.dataDir, 'practice-tracker.json');
  }

  async init() {
    await this.ensureDir(this.dataDir);
    await this.createDefaultTracker();
  }

  async ensureDir(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }
  }

  async createDefaultTracker() {
    const defaultData = {
      sessions: [],
      statistics: {
        totalProblems: 0,
        solvedProblems: 0,
        attemptedProblems: 0,
        averageTime: 0,
        difficultyBreakdown: {
          Easy: 0,
          Medium: 0,
          Hard: 0
        },
        categoryBreakdown: {},
        tagBreakdown: {},
        streak: 0,
        lastActivity: null
      },
      goals: {
        dailyTarget: 3,
        weeklyTarget: 15,
        monthlyTarget: 60
      }
    };

    try {
      await fs.writeFile(this.trackerFile, JSON.stringify(defaultData, null, 2));
    } catch (err) {
      // File might already exist
    }
  }

  async logProblemAttempt(problemData) {
    const {
      problemId,
      problemName,
      difficulty,
      tags = [],
      category = 'general',
      status, // 'solved', 'attempted', 'failed'
      timeSpent, // in minutes
      language,
      notes = ''
    } = problemData;

    const attempt = {
      id: this.generateId(),
      problemId,
      problemName,
      difficulty,
      tags,
      category,
      status,
      timeSpent,
      language,
      notes,
      timestamp: new Date().toISOString()
    };

    try {
      const data = JSON.parse(await fs.readFile(this.trackerFile, 'utf8'));
      
      // Add to sessions
      data.sessions.push(attempt);
      
      // Update statistics
      await this.updateStatistics(data, attempt);
      
      // Save updated data
      await fs.writeFile(this.trackerFile, JSON.stringify(data, null, 2));
      
      return attempt;
    } catch (err) {
      throw new Error(`Failed to log problem attempt: ${err.message}`);
    }
  }

  async updateStatistics(data, attempt) {
    const stats = data.statistics;
    
    // Update basic counts
    stats.totalProblems++;
    if (attempt.status === 'solved') {
      stats.solvedProblems++;
    } else {
      stats.attemptedProblems++;
    }

    // Update difficulty breakdown
    if (stats.difficultyBreakdown[attempt.difficulty] !== undefined) {
      stats.difficultyBreakdown[attempt.difficulty]++;
    }

    // Update category breakdown
    if (!stats.categoryBreakdown[attempt.category]) {
      stats.categoryBreakdown[attempt.category] = 0;
    }
    stats.categoryBreakdown[attempt.category]++;

    // Update tag breakdown
    attempt.tags.forEach(tag => {
      if (!stats.tagBreakdown[tag]) {
        stats.tagBreakdown[tag] = 0;
      }
      stats.tagBreakdown[tag]++;
    });

    // Update average time
    if (attempt.timeSpent) {
      const totalTime = stats.averageTime * (stats.totalProblems - 1) + attempt.timeSpent;
      stats.averageTime = totalTime / stats.totalProblems;
    }

    // Update streak
    await this.updateStreak(data);

    // Update last activity
    stats.lastActivity = attempt.timestamp;
  }

  async updateStreak(data) {
    const sessions = data.sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    let streak = 0;
    let currentDate = new Date();
    
    for (const session of sessions) {
      const sessionDate = new Date(session.timestamp);
      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = sessionDate;
      } else if (daysDiff > streak + 1) {
        break; // Streak broken
      }
    }
    
    data.statistics.streak = streak;
  }

  async getStatistics() {
    try {
      const data = JSON.parse(await fs.readFile(this.trackerFile, 'utf8'));
      return data.statistics;
    } catch (err) {
      return null;
    }
  }

  async getRecentSessions(limit = 10) {
    try {
      const data = JSON.parse(await fs.readFile(this.trackerFile, 'utf8'));
      return data.sessions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (err) {
      return [];
    }
  }

  async getSessionsByDateRange(startDate, endDate) {
    try {
      const data = JSON.parse(await fs.readFile(this.trackerFile, 'utf8'));
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return data.sessions.filter(session => {
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= start && sessionDate <= end;
      });
    } catch (err) {
      return [];
    }
  }

  async getProgressReport() {
    try {
      const data = JSON.parse(await fs.readFile(this.trackerFile, 'utf8'));
      const stats = data.statistics;
      const goals = data.goals;
      
      // Calculate daily progress
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = data.sessions.filter(session => 
        session.timestamp.startsWith(today)
      );
      
      // Calculate weekly progress
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekSessions = data.sessions.filter(session => 
        new Date(session.timestamp) >= weekAgo
      );
      
      // Calculate monthly progress
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthSessions = data.sessions.filter(session => 
        new Date(session.timestamp) >= monthAgo
      );

      return {
        daily: {
          target: goals.dailyTarget,
          completed: todaySessions.length,
          progress: Math.min((todaySessions.length / goals.dailyTarget) * 100, 100)
        },
        weekly: {
          target: goals.weeklyTarget,
          completed: weekSessions.length,
          progress: Math.min((weekSessions.length / goals.weeklyTarget) * 100, 100)
        },
        monthly: {
          target: goals.monthlyTarget,
          completed: monthSessions.length,
          progress: Math.min((monthSessions.length / goals.monthlyTarget) * 100, 100)
        },
        overall: stats
      };
    } catch (err) {
      return null;
    }
  }

  async updateGoals(goals) {
    try {
      const data = JSON.parse(await fs.readFile(this.trackerFile, 'utf8'));
      data.goals = { ...data.goals, ...goals };
      await fs.writeFile(this.trackerFile, JSON.stringify(data, null, 2));
      return data.goals;
    } catch (err) {
      throw new Error(`Failed to update goals: ${err.message}`);
    }
  }

  async exportData(format = 'json') {
    try {
      const data = JSON.parse(await fs.readFile(this.trackerFile, 'utf8'));
      
      if (format === 'csv') {
        return this.convertToCSV(data.sessions);
      }
      
      return data;
    } catch (err) {
      throw new Error(`Failed to export data: ${err.message}`);
    }
  }

  convertToCSV(sessions) {
    const headers = [
      'ID', 'Problem ID', 'Problem Name', 'Difficulty', 'Category', 
      'Tags', 'Status', 'Time Spent', 'Language', 'Notes', 'Timestamp'
    ];
    
    const rows = sessions.map(session => [
      session.id,
      session.problemId,
      session.problemName,
      session.difficulty,
      session.category,
      session.tags.join(';'),
      session.status,
      session.timeSpent,
      session.language,
      session.notes,
      session.timestamp
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  async getLeaderboard() {
    try {
      const data = JSON.parse(await fs.readFile(this.trackerFile, 'utf8'));
      
      // Group by difficulty and calculate stats
      const difficultyStats = {};
      
      data.sessions.forEach(session => {
        if (!difficultyStats[session.difficulty]) {
          difficultyStats[session.difficulty] = {
            total: 0,
            solved: 0,
            averageTime: 0,
            totalTime: 0
          };
        }
        
        const stats = difficultyStats[session.difficulty];
        stats.total++;
        if (session.status === 'solved') {
          stats.solved++;
        }
        if (session.timeSpent) {
          stats.totalTime += session.timeSpent;
        }
      });
      
      // Calculate averages
      Object.keys(difficultyStats).forEach(difficulty => {
        const stats = difficultyStats[difficulty];
        stats.averageTime = stats.total > 0 ? stats.totalTime / stats.total : 0;
        stats.successRate = stats.total > 0 ? (stats.solved / stats.total) * 100 : 0;
      });
      
      return difficultyStats;
    } catch (err) {
      return {};
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = PracticeTracker;
