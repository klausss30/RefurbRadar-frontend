# Troubleshooting Guide

## Load Failure in China (中国访问失败)

### Problem
When accessing the website from China, you may see "load failure" errors. This is because the application relies on CORS proxy services to fetch RSS feeds, and these services may be blocked or inaccessible in China.

### Root Cause
- The application fetches RSS feeds from `refurb-tracker.com`
- Due to CORS restrictions, it uses public CORS proxy services
- These proxy services (`api.allorigins.win`, `corsproxy.io`, etc.) may be blocked by the Great Firewall (GFW)

### Solutions

#### Option 1: Use a VPN (Recommended for Users)
If you are a user accessing the site from China, the easiest solution is to use a VPN service to access the internet through a server outside China.

#### Option 2: Server-Side Proxy (Recommended for Developers)
For developers hosting the application, the best long-term solution is to implement a server-side proxy:

1. **Create a backend API endpoint** that fetches the RSS feeds server-side
2. **Update the frontend** to fetch from your API instead of using CORS proxies
3. **Deploy the backend** in a region accessible from China (e.g., Chinese cloud services)

Example implementation:

```javascript
// Backend API endpoint (Node.js/Express example)
app.get('/api/feeds/:countryCode', async (req, res) => {
  const { countryCode } = req.params;
  const feedUrl = `https://refurb-tracker.com/feeds/${countryCode}_in_all.xml`;
  
  try {
    const response = await fetch(feedUrl);
    const xmlData = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(xmlData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});
```

Then update `src/api/fetchFeed.ts` to use your API endpoint in production.

#### Option 3: Use Chinese CDN/DNS Services
If you are hosting in China, consider:
- Using Chinese DNS services
- Deploying to Chinese cloud platforms (Alibaba Cloud, Tencent Cloud)
- Using Chinese CDN services

#### Option 4: Cache Strategy
The application already implements caching:
- Product data is cached for 30 minutes
- Feed XML is cached for 5 minutes
- If you have cached data from a previous visit (when VPN was active), the app will use it even if the network is blocked

### Error Messages
The application now provides more detailed error messages that indicate:
- Which proxy services failed
- Whether network restrictions may be the cause
- Suggestions for resolving the issue

### Technical Details
The application tries multiple CORS proxies in sequence:
1. `api.allorigins.win`
2. `corsproxy.io`
3. `cors-anywhere.herokuapp.com`
4. `api.codetabs.com`

If all proxies fail, the application will:
1. Try to use stale cache data if available
2. Show a detailed error message with suggestions

### Reporting Issues
If you continue to experience issues, please:
1. Check if the error persists with a VPN enabled
2. Check browser console for detailed error messages
3. Report the specific error message and your location/network environment





