# 🐛 BugGenie

**AI-Powered Bug Bounty Report Generator**

BugGenie is a modern web application that helps security researchers quickly generate high-quality bug bounty reports tailored to the requirements of major platforms using Google Gemini AI.

## ✨ Features

### 🤖 AI-Powered Report Generation
- **Google Gemini 2.0 Flash** integration for intelligent report creation
- **Platform-specific templates** for Bugcrowd, HackerOne, and Google VRP
- **Smart content generation** based on vulnerability details
- **Report enhancement** with AI to improve existing reports
- **Copy Report** button to quickly copy the generated report to clipboard

### 💰 Bounty Estimation & Acceptance Analysis
- **Real-time bounty estimation** based on vulnerability severity and platform
- **Acceptance probability calculation** using platform-specific policies
- **Dynamic analysis updates** as you generate or enhance reports
- **Platform policy insights** with detailed requirements and rejection reasons
- **Smart recommendations** to improve report acceptance chances

### 🧑‍🎓 Learning Mode (NEW)
- **AI-powered vulnerability learning cards** for every platform and category
- **Concise or detailed explanations** for each vulnerability type
- **Real-world examples, how-to-find, and remediation tips**
- **Interactive VRT navigation** for Bugcrowd, HackerOne, and Google VRP

### 📊 Gemini Usage Tracking (NEW)
- **Daily Gemini API usage tracking** with real-time quota display
- **Warnings as you approach free tier limits** (1,500 requests/day, 15/min)
- **Usage tracked locally in your browser for privacy**

### 🎯 Platform Support
- **Bugcrowd** - Official 3-level VRT selection (Category > Subcategory > Variant/Affected Function)
  - Handles edge cases where some subcategories have no variants (2-tier selection)
- **HackerOne** - Flat category selection (customizable)
- **Google VRP** - Flat category selection (customizable)

### 📝 Report Features
- **Rich text editor** with TipTap for easy editing
- **PDF export** with proper formatting and multi-page support
- **Vulnerability categories** based on VRT (Vulnerability Rating Taxonomy)
- **Optional vulnerability details** for customized reports
- **Persistent API key storage** (localStorage)

### 🔒 Security & Privacy
- **Client-side only** - No server required
- **Local API key storage** - Your keys stay in your browser
- **No data collection** - Complete privacy
- **Free tier support** - Uses Google Gemini's generous free limits
- **Gemini usage tracked locally only** (never sent to any server)

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
- **Bugcrowd** - For Bugcrowd submissions (with official VRT selection)
- **HackerOne** - For HackerOne reports
- **Google** - For Google VRP submissions

### 2. Choose Vulnerability Category
- **Bugcrowd:**
  - Select **Category** (top-level)
  - Select **Subcategory**
  - If available, select **Variant/Affected Function** (3rd level)
  - If a subcategory has no variants, you can proceed after 2 levels
- **HackerOne/Google:**
  - Select from a flat list of categories

### 3. View Bounty Analysis (Optional)
- **Toggle "Show Bounty Analysis"** to see estimated bounty ranges and acceptance probability
- **Toggle "Show Detailed Policies"** to view platform-specific requirements and rejection reasons
- **Real-time updates** as you generate or enhance reports
- **Smart recommendations** to improve your report's acceptance chances

### 4. Add Vulnerability Details (Optional)
- Field appears only after a valid category selection (all tiers for Bugcrowd, or category for others)
- Cleared automatically if you change category/subcategory/variant
- Describe your findings (affected endpoints, payloads, impact, etc.)
- Leave empty for a generic template

### 5. Generate, Enhance, Copy, or Export Report
- **Generate AI Report**: Creates a professional report
- **Enhance with AI**: Improves the current report
- **Copy Report**: Copies the plain text report to clipboard
- **Export to PDF**: Downloads the report as a PDF

### 6. Use Learning Mode (NEW)
- Click the **Learning** button in the top right of the app
- Select a platform and vulnerability type (full VRT navigation for Bugcrowd)
- Instantly view an **AI-generated learning card** for the selected vulnerability
- Toggle between **Concise** and **Detailed** learning cards for more or less depth
- Each card includes: summary, how it works, real-world example, how to find, and remediation tips

### 7. Monitor Gemini Usage (NEW)
- Your daily Gemini API usage is shown at the top of the app
- Warnings appear as you approach the free tier quota (1,500 requests/day, 15/min)
- Usage is tracked **locally in your browser** for privacy

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite
- **UI Framework**: Material-UI (MUI)
- **Rich Text Editor**: TipTap
- **AI Integration**: Google Gemini 2.0 Flash
- **PDF Generation**: jsPDF
- **Bounty Analysis**: Custom algorithm based on real platform data
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

### Gemini Usage Tracking
- **Your Gemini API usage is tracked locally in your browser only**
- **No usage data is ever sent to any server**
- **You are warned as you approach your daily quota**

## 📁 Project Structure

```
buggenie/
├── src/
│   ├── assets/
│   │   └── bugcrowd-vrt.json         # Official Bugcrowd VRT taxonomy
│   ├── components/
│   │   └── BountyAnalysis.jsx        # Bounty estimation and analysis component
│   │   └── LearningCard.jsx         # AI-powered learning card component (NEW)
│   ├── services/
│   │   ├── gemini.js                # Google Gemini AI service
│   │   └── bountyEstimator.js       # Bounty estimation and acceptance analysis
│   ├── utils/
│   │   └── textToTipTap.js          # Text conversion utilities
│   ├── platforms.js                 # Platform and VRT categories
│   ├── LearningPage.jsx             # Learning mode page (NEW)
│   └── App.jsx                      # Main application component
├── public/                          # Static assets
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

## 🎯 Supported Platforms

### Bugcrowd
- **Format**: Comprehensive business-focused reports
- **Sections**: Summary, Business Impact, Steps to Reproduce, PoC, Impact Assessment, Recommendations
- **Style**: Professional with business context
- **VRT Selection**: Official 3-level taxonomy, with edge case handling for 2-tier

### HackerOne
- **Format**: Technical detailed reports
- **Sections**: Description, Summary, Steps to Reproduce, Supporting Materials, Impact Assessment, Recommendations
- **Style**: Technical with supporting references
- **VRT Selection**: Flat, customizable list

### Google VRP
- **Format**: Concise structured reports
- **Sections**: Summary (200 chars), Vulnerability Description, Attack Preconditions, Reproduction Steps, Attack Scenario, Screenshot/Evidence
- **Style**: Brief and technical
- **VRT Selection**: Flat, customizable list

## 💰 Bounty Analysis Features

### Real-Time Estimation
- **Dynamic bounty ranges** based on vulnerability severity (Critical, High, Medium, Low, Info)
- **Platform-specific pricing** reflecting actual market rates
- **Historical data integration** from real bug bounty programs

### Acceptance Probability
- **AI-powered analysis** of report quality and completeness
- **Platform policy compliance** checking against specific requirements
- **Smart recommendations** to improve acceptance chances
- **Real-time updates** as you generate or enhance reports

### Platform Insights
- **Detailed policy breakdown** for each platform
- **Required vs preferred elements** clearly identified
- **Common rejection reasons** to avoid
- **Best practices guidance** for each platform

### Supported Bounty Ranges
- **Bugcrowd**: $50 - $15,000 (average: $1,000 - $3,000)
- **HackerOne**: $25 - $20,000 (average: $300 - $1,750)
- **Google VRP**: $50 - $50,000 (average: $550 - $5,500)

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
- **Bugcrowd** for the official VRT taxonomy

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the existing issues for solutions
- Review the documentation above

---

**Happy Bug Hunting! 🐛✨**
