# JIRA Connection Troubleshooting Guide

## 🔍 Quick Diagnostic

Run this command:
```powershell
cd d:\AITesterBlueprint\Project7_BugReporter\bug-reporter
node diagnose-jira.js
```

---

## ❌ Common Issues

### 1. "Project Not Found" or 404 Error

**Cause:** Wrong project key

**JIRA Project Key Rules:**
- Usually 2-10 characters
- All UPPERCASE
- NO spaces
- NO special characters (except underscore sometimes)
- Examples: `QA`, `PROJ`, `DEV`, `AI`, `ABP`, `BLUEPRINT`

**Your issue:** You wrote `AI_ Blueprint123` (with space)
**Likely correct format:** `AI`, `ABP`, `BLUEPRINT`, or `AI123`

**How to find correct key:**
1. Open JIRA in browser
2. Look at URL when viewing project: `https://xxx.atlassian.net/browse/ABC-123`
3. `ABC` is your project key

---

### 2. "No Permission" or 403 Error

**Cause:** Admin changed roles but not saved/applied

**Checklist:**
- [ ] Ask admin to confirm they clicked **"Save"** after changing permissions
- [ ] Verify you're added to the **"Developers"** or **"Administrators"** role
- [ ] Try logging out of JIRA and back in

---

### 3. "Invalid API Token" or 401 Error

**Cause:** Wrong or expired token

**Solution:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **"Create API token"**
3. Give it a name (e.g., "Bug Reporter")
4. Copy the token (starts with `ATATT...`)
5. Paste in the script/config

---

## 🛠️ Step-by-Step Fix

### Step 1: Find Your Actual Project Key

**In JIRA:**
1. Click **Projects** → **View All Projects**
2. Look at the **"Key"** column
3. Note the EXACT key (case-sensitive)

Or:
1. Open any issue in your project
2. Look at URL: `.../browse/XXX-123`
3. `XXX` is the project key

---

### Step 2: Run Diagnostic

```powershell
cd d:\AITesterBlueprint\Project7_BugReporter\bug-reporter
notepad diagnose-jira.js
```

Update these lines:
```javascript
const CONFIG = {
  domain: 'your-domain.atlassian.net',
  email: 'sraork@gmail.com',
  apiToken: 'PASTE_YOUR_TOKEN_HERE',
  projectKey: 'THE_CORRECT_KEY_HERE',  // <-- FIX THIS
};
```

Save and run:
```powershell
node diagnose-jira.js
```

---

### Step 3: Interpret Results

**If you see:**
```
✅ Connected as: Shobha.Rao
❌ Project NOT FOUND (404)
```
→ Your project key is wrong. Check the list of accessible projects shown above.

**If you see:**
```
✅ Project exists: AI Blueprint
❌ You DO NOT have "Create Issues" permission
```
→ Admin needs to fix permissions. Share this with them.

**If you see:**
```
✅ Project exists: AI Blueprint
✅ You HAVE "Create Issues" permission!
```
→ Everything should work! Try creating the issue again.

---

## 📧 What to Tell Your JIRA Admin

Copy-paste this message:

```
Hi Admin,

I need to create issues in project [PROJECT_KEY] using the API.

Please grant me:
1. "Create Issues" permission in project [PROJECT_KEY]
2. Add me to the "Developers" project role

My email: sraork@gmail.com

Thanks!
```

---

## 🎯 Most Likely Fix

Based on your error, the project key `AI_Blueprint123` is probably wrong.

**Try these instead:**
- `AI`
- `ABP`
- `BLUEPRINT`
- `AI123`
- `BP123`

Run the diagnostic tool to see which ones you have access to!

---

## 🆘 Still Not Working?

Send me the output of:
```powershell
node diagnose-jira.js
```

(Remove sensitive info like your full API token before sharing)
