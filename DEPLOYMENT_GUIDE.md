# Deployment Guide: exabytesai.com on GitHub Pages

Complete step-by-step guide to deploy the Exabyte Spatial AI website to GitHub Pages with custom domain from Squarespace.

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Domain purchased at Squarespace: `exabytesai.com`
- [x] Website files ready in this directory

---

## 🚀 Part 1: Deploy to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in the details:
   - **Repository name**: `exabytesai-website`
   - **Description**: "Exabyte Spatial AI company website"
   - **Visibility**: ✅ **Public** (required for free GitHub Pages)
   - **Initialize**: ❌ DO NOT check any boxes (no README, no .gitignore, no license)
3. Click **"Create repository"**
4. **Keep this page open** - you'll need the repository URL

### Step 2: Push Website to GitHub

Open Terminal and navigate to the website directory:

```bash
cd /Users/jiaweizhang/PycharmProjects/Exabyte_Studio/exabyte_sai_website
```

Run the deployment script:

```bash
./deploy.sh
```

Or manually run these commands:

```bash
# Initialize git repository (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial website deployment"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/exabytesai-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username!

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main` and `/root`
   - Click **Save**
5. Wait 1-2 minutes for deployment
6. You'll see a message: "Your site is live at https://YOUR_USERNAME.github.io/exabytesai-website/"

**✅ Checkpoint**: Visit the GitHub Pages URL to verify your site is working.

---

## 🌐 Part 2: Connect Custom Domain (Squarespace)

### Step 4: Configure DNS at Squarespace

1. Log in to your Squarespace account
2. Go to **Settings** → **Domains** → **exabytesai.com**
3. Click **DNS Settings** or **Advanced Settings**
4. Add the following DNS records:

#### A Records (for apex domain)

Add **four** A records pointing to GitHub Pages servers:

| Type | Host | Value            | TTL  |
|------|------|------------------|------|
| A    | @    | 185.199.108.153  | 3600 |
| A    | @    | 185.199.109.153  | 3600 |
| A    | @    | 185.199.110.153  | 3600 |
| A    | @    | 185.199.111.153  | 3600 |

#### CNAME Record (for www subdomain)

| Type  | Host | Value                                    | TTL  |
|-------|------|------------------------------------------|------|
| CNAME | www  | YOUR_USERNAME.github.io                  | 3600 |

**Replace** `YOUR_USERNAME` with your GitHub username!

#### Delete Conflicting Records

- **Remove** any existing A records pointing to Squarespace IPs
- **Remove** any CNAME records for @ (apex domain)
- **Keep** other records (MX, TXT, etc.) if you plan to use email

5. Click **Save** or **Apply Changes**

**⏱️ Note**: DNS propagation can take 24-48 hours, but usually works within 1-2 hours.

### Step 5: Configure Custom Domain in GitHub

1. Go back to your GitHub repository
2. **Settings** → **Pages**
3. Under "Custom domain":
   - Enter: `exabytesai.com`
   - Click **Save**
4. Wait for DNS check (may take a few minutes)
5. Once verified, check **"Enforce HTTPS"** (important for security!)

**✅ Checkpoint**: You should see "DNS check successful" message.

---

## 🧪 Part 3: Testing & Verification

### Step 6: Test Your Website

After DNS propagation (1-2 hours), test these URLs:

✅ **Main domain**: https://exabytesai.com
✅ **WWW subdomain**: https://www.exabytesai.com (should redirect to main)
✅ **Studio redirect**: https://exabytesai.com/studio (should redirect to exabyte.studio)

### Step 7: Verify All Pages

Check all pages are working:

- ✅ Home: https://exabytesai.com/
- ✅ Platform: https://exabytesai.com/platform.html
- ✅ Products: https://exabytesai.com/products.html
- ✅ Developers: https://exabytesai.com/developers.html
- ✅ Company: https://exabytesai.com/company.html
- ✅ Careers: https://exabytesai.com/careers.html

### Step 8: Check DNS Propagation

Use these tools to verify DNS propagation:

- https://dnschecker.org (enter: exabytesai.com)
- https://www.whatsmydns.net (enter: exabytesai.com)

Look for the GitHub Pages IP addresses (185.199.108-111.153).

---

## 🔄 Future Updates

To update your website in the future:

```bash
# Navigate to website directory
cd /Users/jiaweizhang/PycharmProjects/Exabyte_Studio/exabyte_sai_website

# Make your changes to HTML/CSS/JS files

# Run deployment script
./deploy.sh

# Or manually:
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically rebuild your site within 1-2 minutes.

---

## 🐛 Troubleshooting

### DNS Not Working After 24 Hours

1. Verify A records point to correct GitHub IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

2. Check for conflicting records:
   - Remove old Squarespace A records
   - Ensure no duplicate records

3. Clear your DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Windows
   ipconfig /flushdns
   ```

### HTTPS Certificate Not Working

1. Wait 24 hours after DNS propagation
2. Uncheck and re-check "Enforce HTTPS" in GitHub Pages settings
3. Ensure CNAME file contains: `exabytesai.com` (no www, no https://)

### 404 Errors

1. Ensure `index.html` exists in repository root
2. Check file names are correct (case-sensitive)
3. Verify all links use relative paths (not absolute)

### Studio Redirect Not Working

1. Verify `/studio/index.html` file exists in repository
2. Test directly: https://exabytesai.com/studio/
3. Check browser console for errors

---

## 📞 Support

- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **Squarespace DNS Help**: https://support.squarespace.com/hc/en-us/articles/205812378
- **DNS Check Tool**: https://dnschecker.org

---

## ✅ Checklist

Use this checklist to track your progress:

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] DNS A records added at Squarespace
- [ ] DNS CNAME record added for www
- [ ] Custom domain configured in GitHub
- [ ] HTTPS enforced
- [ ] DNS propagation complete (1-24 hours)
- [ ] Main site working: exabytesai.com
- [ ] WWW redirect working: www.exabytesai.com
- [ ] Studio redirect working: exabytesai.com/studio
- [ ] All pages tested and working

---

**Good luck with your deployment! 🚀**

Once live, your YC application link `https://exabytesai.com/studio` will be fully functional!
