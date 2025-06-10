# 🚀 Vercel Deployment Guide for OpenLineage Proxy

## 🚨 **Current Issues with File Storage**

The current implementation **WILL NOT WORK** on Vercel because:

1. **Read-only file system** - Serverless functions can't write files
2. **Stateless execution** - Files would be lost after function execution
3. **No persistent storage** - Counter resets on every cold start
4. **No file locking** - Thread safety doesn't work across instances

## ✅ **Recommended Solutions**

### **Option 1: Database Storage (Best for Production)**

**Setup Steps:**

1. **Enable Vercel Postgres:**
   ```bash
   # In your Vercel dashboard or CLI
   vercel storage create postgres
   ```

2. **Replace the main handler:**
   ```bash
   # Backup current version
   cp pages/api/v1/lineage/index.js pages/api/v1/lineage/index.js.backup
   
   # Use database version
   cp pages/api/v1/lineage/database-version.js pages/api/v1/lineage/index.js
   ```

3. **Install dependencies:**
   ```json
   {
     "dependencies": {
       "@vercel/postgres": "^0.5.0"
     }
   }
   ```

4. **Environment Variables in Vercel:**
   ```env
   POSTGRES_URL=postgresql://...  # Auto-populated by Vercel
   ```

**Benefits:**
- ✅ Proper persistence across deployments
- ✅ Queryable data with SQL
- ✅ Atomic counter increments
- ✅ Built-in indexes for performance
- ✅ Can export data as needed

### **Option 2: Vercel Blob Storage**

**Setup Steps:**

1. **Enable Vercel Blob:**
   ```bash
   vercel storage create blob
   ```

2. **Use blob version:**
   ```bash
   cp pages/api/v1/lineage/blob-version.js pages/api/v1/lineage/index.js
   ```

3. **Install dependencies:**
   ```json
   {
     "dependencies": {
       "@vercel/blob": "^0.15.0",
       "@vercel/kv": "^0.2.0"
     }
   }
   ```

4. **Environment Variables:**
   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_...
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   ```

**Benefits:**
- ✅ File-like storage (similar to current approach)
- ✅ Direct file downloads via URLs
- ✅ Good for large payloads
- ✅ CDN-backed for fast access

### **Option 3: Logging Only (Simplest)**

**For development or simple debugging:**

```bash
cp pages/api/v1/lineage/hybrid-version.js pages/api/v1/lineage/index.js
```

**Benefits:**
- ✅ No additional services needed
- ✅ View events in Vercel function logs
- ✅ Optional webhook integration
- ✅ Works immediately

## 📁 **Current File Structure Issues**

### **Problem:**
```
pages/api/v1/lineage/
├── index.js          # API handler
├── counter.txt       # ❌ Won't persist on Vercel
└── *.json           # ❌ Won't persist on Vercel
```

### **Solution:**
```
pages/api/v1/lineage/
├── index.js          # Updated handler
└── [archived versions] # Keep for reference

# Data stored in:
├── Vercel Postgres   # ✅ Persistent database
├── Vercel Blob       # ✅ File storage
└── Vercel Logs       # ✅ Searchable logs
```

## 🛠 **Migration Steps**

### **Step 1: Choose Your Storage Method**
```bash
# For production with database
cp pages/api/v1/lineage/vercel-ready.js pages/api/v1/lineage/index.js

# For simple logging
cp pages/api/v1/lineage/hybrid-version.js pages/api/v1/lineage/index.js
```

### **Step 2: Update Package Dependencies**
```json
{
  "dependencies": {
    "next": "13.1.6",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@heroicons/react": "^2.0.18",
    
    // Choose based on storage option:
    "@vercel/postgres": "^0.5.0",     // For database
    "@vercel/blob": "^0.15.0",        // For blob storage
    "@vercel/kv": "^0.2.0"            // For counters
  }
}
```

### **Step 3: Remove File-Based Dependencies**
```bash
npm uninstall proper-lockfile  # Not needed for serverless
```

### **Step 4: Update Environment Variables**
```env
# Vercel automatically provides these:
POSTGRES_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# Optional webhook for external integrations:
OPENLINEAGE_WEBHOOK_URL=https://your-service.com/webhook
WEBHOOK_TOKEN=your_secret_token
```

### **Step 5: Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Enable storage (if using database/blob)
vercel storage create postgres
vercel storage create blob
```

## 📊 **Data Access After Deployment**

### **Database Version:**
```sql
-- Query events via Vercel dashboard or CLI
SELECT event_id, event_type, job_name, created_at 
FROM openlineage_events 
ORDER BY created_at DESC 
LIMIT 10;

-- Export as JSON
SELECT payload FROM openlineage_events WHERE event_id = 'your-event-id';
```

### **Blob Version:**
```javascript
// Access files via URLs
const fileUrl = 'https://blob.vercel-storage.com/your-file.json';
const response = await fetch(fileUrl);
const data = await response.json();
```

### **Logs Version:**
```bash
# View in Vercel dashboard under Functions > Logs
# Or via CLI
vercel logs
```

## 🎯 **Recommendation**

**For Production:** Use **Option 1 (Database)** with the `vercel-ready.js` handler
- Combines logging + optional database storage
- Works immediately, scales with usage
- Easy to query and analyze data
- Backward compatible API responses

**For Development:** Keep current file-based approach locally
- Add the production handler for Vercel deployment
- Best of both worlds
