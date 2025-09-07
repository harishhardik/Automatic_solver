# 🚀 Coding Practice Toolkit

A comprehensive web application for coding practice with problem workspace, algorithm cribsheet, test harness, and practice tracker.

## ✨ Features

### 📝 Problem Workspace
- Create coding problems with templates for multiple languages
- Organize problems by difficulty, tags, and status
- Sample input/output management
- Support for JavaScript, Python, Java, and C++

### 🧠 Algorithm Cribsheet
- Pre-loaded algorithms with implementations
- Searchable by category, difficulty, and tags
- Code examples in multiple languages
- Complexity analysis and use cases

### 📊 Test Harness
- Run your solutions against test cases
- Add custom test cases
- Detailed diff reporting
- Support for multiple programming languages

### 📈 Practice Tracker
- Log problem attempts with time tracking
- Progress goals (daily/weekly/monthly)
- Statistics dashboard
- Streak tracking
- Export data to CSV

## 🛠️ Tech Stack

- **Backend:** Node.js + Express + Socket.IO
- **Frontend:** Vanilla JavaScript + Modern CSS
- **Deployment:** Vercel
- **Data Storage:** JSON files

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Choose your Vercel account
   - Deploy!

### Manual Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push

## 🏃‍♂️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open:** http://localhost:3000

## 📁 Project Structure

```
├── server/
│   ├── index.js              # Main server with API endpoints
│   ├── problem-workspace.js  # Problem management
│   ├── test-harness.js       # Code execution and testing
│   ├── algorithm-cribsheet.js # Algorithm patterns
│   └── practice-tracker.js   # Progress tracking
├── public/
│   ├── index.html            # Modern UI
│   └── app.js               # Frontend logic
├── vercel.json              # Vercel configuration
└── package.json             # Dependencies
```

## 🎯 Usage

1. **Create Problems:** Use the Problems tab to add coding challenges
2. **Study Algorithms:** Browse the Algorithms tab for patterns and implementations
3. **Test Solutions:** Use the Practice tab to run your code against test cases
4. **Track Progress:** Monitor your improvement in the Tracking tab

## 🔧 API Endpoints

### Problems
- `POST /api/problems` - Create new problem
- `GET /api/problems` - List all problems
- `GET /api/problems/:id` - Get specific problem
- `PATCH /api/problems/:id/status` - Update problem status

### Testing
- `POST /api/problems/:id/test` - Run tests
- `POST /api/problems/:id/test-cases` - Add test case

### Algorithms
- `GET /api/algorithms` - Search algorithms
- `GET /api/algorithms/:id` - Get specific algorithm
- `GET /api/algorithms/categories` - Get categories
- `GET /api/algorithms/tags` - Get tags

### Practice Tracking
- `POST /api/practice/log` - Log problem attempt
- `GET /api/practice/statistics` - Get statistics
- `GET /api/practice/sessions` - Get recent sessions
- `GET /api/practice/progress` - Get progress report
- `GET /api/practice/export` - Export data

## 📝 License

MIT License - feel free to use this for your coding practice!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.