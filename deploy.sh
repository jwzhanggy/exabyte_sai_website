#!/bin/bash

# Deployment script for Exabyte Spatial AI website
# This script helps you deploy the website to GitHub Pages

echo "🚀 Exabyte Spatial AI Website Deployment"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the website directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo ""
echo "📝 Adding all website files..."
git add .

# Show status
echo ""
echo "📊 Current status:"
git status

# Prompt for commit message
echo ""
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update website"
fi

# Commit
echo ""
echo "💾 Committing changes..."
git commit -m "$commit_msg"

# Check if remote exists
if git remote | grep -q "origin"; then
    echo ""
    echo "✅ Remote 'origin' already configured"
    echo "🔄 Pushing to GitHub..."
    git push -u origin main
else
    echo ""
    echo "⚠️  No remote repository configured yet."
    echo ""
    echo "Please run the following commands manually:"
    echo ""
    echo "1️⃣  Create a new repository on GitHub: https://github.com/new"
    echo "    Repository name: exabytesai-website (or your choice)"
    echo "    Visibility: Public"
    echo ""
    echo "2️⃣  Then run these commands:"
    echo "    git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
    echo "    git branch -M main"
    echo "    git push -u origin main"
fi

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub (if not done yet)"
echo "2. Go to GitHub repo → Settings → Pages"
echo "3. Set source to 'main' branch"
echo "4. Configure DNS at Squarespace (see instructions below)"
echo ""
