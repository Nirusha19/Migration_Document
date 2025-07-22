#!/bin/bash

echo "🚀 GitHub Migration Documentation Tool - Quick Start"
echo "===================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📋 This quick start will:"
echo "1. Install dependencies"
echo "2. Set up environment file"
echo "3. Guide you through GitHub token setup"
echo "4. Run your first migration analysis"
echo ""

read -p "Continue? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Exiting..."
    exit 0
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "⚠️ .env file already exists"
fi

echo ""
echo "🔑 GitHub Token Setup Required:"
echo "1. Go to: https://github.com/settings/personal-access-tokens/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Select scopes: repo, read:org, user:email"
echo "4. Copy the generated token"
echo ""

read -p "Press Enter when you have your GitHub token ready..."

echo ""
echo "📝 Please enter your GitHub information:"

read -p "GitHub Token: " github_token
read -p "Repository Owner (e.g., angular, microsoft): " repo_owner
read -p "Repository Name (e.g., angular, vscode): " repo_name

# Update .env file
sed -i.bak "s/your_github_personal_access_token_here/$github_token/" .env
sed -i.bak "s/repository_owner/$repo_owner/" .env
sed -i.bak "s/repository_name/$repo_name/" .env

echo ""
echo "✅ Configuration updated!"
echo ""

echo "🎯 Ready to run your first analysis!"
echo ""
echo "Choose an option:"
echo "1. Interactive mode (recommended for first time)"
echo "2. Quick Angular analysis (last 6 months)"
echo "3. Custom date range"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🔄 Starting interactive mode..."
        npm start -- --interactive
        ;;
    2)
        echo "🔄 Running quick Angular analysis..."
        six_months_ago=$(date -d "6 months ago" +%Y-%m-%d 2>/dev/null || date -v-6m +%Y-%m-%d)
        today=$(date +%Y-%m-%d)
        npm start -- --from "$six_months_ago" --to "$today" --format markdown,csv
        ;;
    3)
        read -p "From date (YYYY-MM-DD): " from_date
        read -p "To date (YYYY-MM-DD): " to_date
        echo "🔄 Running custom analysis..."
        npm start -- --from "$from_date" --to "$to_date" --format markdown,csv
        ;;
    *)
        echo "❌ Invalid choice. Run 'npm start -- --interactive' manually."
        ;;
esac

echo ""
echo "🎉 Quick start completed!"
echo ""
echo "📁 Check the 'migration-docs' folder for your reports"
echo "📚 See README.md for more usage examples"
echo "❓ Run 'npm start -- --help' for all options"
