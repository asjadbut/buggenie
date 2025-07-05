# 🐛 BugGenie

**AI-Powered Bug Bounty Report Generator**

BugGenie is a modern web application that helps security researchers quickly generate high-quality bug bounty reports tailored to the requirements of major platforms using Google Gemini AI.

## ✨ Features

### 🤖 AI-Powered Report Generation
- **Google Gemini 2.0 Flash** integration for intelligent report creation
- **Platform-specific templates** for Bugcrowd, HackerOne, and Google VRP
- **Smart content generation** based on vulnerability details
- **Report enhancement** with AI to improve existing reports

### 🎯 Platform Support
- **Bugcrowd** - Comprehensive reports with business impact analysis
- **HackerOne** - Detailed technical reports with supporting materials
- **Google VRP** - Concise reports following Google's specific requirements

### 📝 Report Features
- **Rich text editor** with TipTap for easy editing
- **PDF export** with proper formatting and multi-page support
- **Vulnerability categories** based on VRT (Vulnerability Rating Taxonomy)
- **Optional vulnerability details** for customized reports

### 🔒 Security & Privacy
- **Client-side only** - No server required
- **Local API key storage** - Your keys stay in your browser
- **No data collection** - Complete privacy
- **Free tier support** - Uses Google Gemini's generous free limits

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/buggenie.git
   cd buggenie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. Enter it in BugGenie when prompted

## 📖 How to Use

### 1. Select Platform
Choose your target platform:
- **Bugcrowd** - For Bugcrowd submissions
- **HackerOne** - For HackerOne reports
- **Google** - For Google VRP submissions

### 2. Choose Vulnerability Category
Select from comprehensive VRT categories:
- Cross-Site Scripting (XSS)
- SQL Injection
- Authentication Bypass
- IDOR (Insecure Direct Object Reference)
- And many more...

### 3. Add Vulnerability Details (Optional)
Describe your findings:
- Affected endpoints
- Payloads used
- Expected vs actual behavior
- Impact assessment
- Leave empty for generic template

### 4. Generate Report
- Click "Generate AI Report" for a new report
- Use "Enhance with AI" to improve existing content
- Export to PDF when ready

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite
- **UI Framework**: Material-UI (MUI)
- **Rich Text Editor**: TipTap
- **AI Integration**: Google Gemini 2.0 Flash
- **PDF Generation**: jsPDF
- **Styling**: Tailwind CSS

## 🔒 Security & Privacy

### API Key Handling
- **Local storage only** - API keys stored in your browser's localStorage
- **No server transmission** - Keys never sent to our servers
- **Client-side processing** - All AI calls made directly from your browser
- **Automatic persistence** - Keys remembered across sessions

### Data Privacy
- **No user data collection** - We don't track or store any information
- **No analytics** - No tracking scripts or cookies
- **Complete privacy** - Your vulnerability details stay on your device
- **Open source** - Full transparency of code

### Free Tier Usage
- **15 requests per minute** - Google Gemini's free limit
- **1,500 requests per day** - Generous daily allowance
- **No credit card required** - Completely free to start
- **Cost-effective** - Perfect for bug bounty researchers

## 📁 Project Structure

```
buggenie/
├── src/
│   ├── services/
│   │   └── gemini.js          # Google Gemini AI service
│   ├── utils/
│   │   └── textToTipTap.js    # Text conversion utilities
│   ├── platforms.js           # Platform and VRT categories
│   └── App.jsx               # Main application component
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎯 Supported Platforms

### Bugcrowd
- **Format**: Comprehensive business-focused reports
- **Sections**: Summary, Business Impact, Steps to Reproduce, PoC, Impact Assessment, Recommendations
- **Style**: Professional with business context

### HackerOne
- **Format**: Technical detailed reports
- **Sections**: Description, Summary, Steps to Reproduce, Supporting Materials, Impact Assessment, Recommendations
- **Style**: Technical with supporting references

### Google VRP
- **Format**: Concise structured reports
- **Sections**: Summary (200 chars), Vulnerability Description, Attack Preconditions, Reproduction Steps, Attack Scenario, Screenshot/Evidence
- **Style**: Brief and technical

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for providing the AI capabilities
- **Material-UI** for the beautiful UI components
- **TipTap** for the rich text editing experience
- **Vite** for the fast development experience

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the existing issues for solutions
- Review the documentation above

---

**Happy Bug Hunting! 🐛✨**
