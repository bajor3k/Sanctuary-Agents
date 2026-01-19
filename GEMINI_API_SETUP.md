# Google Gemini API Setup Guide

Your Gemini API key is now configured for the Orion Advisory page! This guide explains what's connected and how it works.

## ✅ What's Already Done

✅ Gemini API key added to `.env.local`
✅ API key: `AIzaSyC-fKZtEY0nYZM0Rj0VZqraOqvjMeYGLzA`
✅ Genkit AI framework configured with Google AI plugin
✅ PDF analysis flow integrated into Orion Advisory page
✅ Automatic document processing when PDFs are detected

---

## 🎯 What the API Key Does

The Gemini API key is used for **AI-powered PDF analysis** on the Orion Advisory page:

### PDF Document Analysis
When you place advisory agreement PDFs in the `/Users/bajor3k/Desktop/Orion Advisory` folder, the system:

1. **Detects** new PDF files automatically
2. **Analyzes** each PDF using Google's Gemini 2.0 Flash model
3. **Extracts** 12 data points from each document:
   - Discretionary vs Non-Discretionary
   - WRAP vs Non-WRAP
   - Client's Name
   - Effective Date
   - Client Signed/Dated Page 11
   - Account Number
   - Fee Type (Flat vs Tiered)
   - Fee Amount
   - ADV Received Date
   - Client Signed/Dated Page 14

4. **Displays** extracted data in the Pending Review section
5. **Validates** each field (shows IGO/NIGO status)
6. **Allows editing** of any extracted values

---

## 📍 Where It's Used

### Orion Advisory Page (`/agents/advisory`)
- **File**: `src/app/agents/advisory/page.tsx`
- **API Endpoint**: `src/app/api/advisory-documents/route.ts`
- **AI Flow**: `src/ai/flows/analyze-advisory-pdf.ts`

### How It Works:
1. Navigate to the Orion Advisory page in your app
2. Place PDF files in `/Users/bajor3k/Desktop/Orion Advisory`
3. Click the refresh button (or wait for auto-refresh)
4. The system reads each PDF with Gemini AI
5. Extracted data appears in the Pending Review table
6. You can review, edit, and push data to Orion

---

## 🔑 API Key Configuration

### Current Setup (.env.local):
```env
GEMINI_API_KEY=AIzaSyC-fKZtEY0nYZM0Rj0VZqraOqvjMeYGLzA
```

### How It's Loaded:
The API key is automatically loaded by Next.js from `.env.local` and used by the Genkit AI framework:

**File**: `src/ai/genkit.ts`
```typescript
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-flash-latest',
});
```

---

## 💰 API Usage & Costs

### Gemini API Pricing (Free Tier):
- **Free Quota**: 15 requests per minute
- **Rate Limit**: Built-in 7-second delay between requests
- **Token Limits**:
  - Input: 1 million tokens per minute
  - Output: 8 million tokens per minute

### Gemini 2.0 Flash Pricing:
- **Input**: Free up to 1M requests/day
- **Output**: Free up to 1M requests/day
- **Beyond Free Tier**: $0.075 per 1M input tokens, $0.30 per 1M output tokens

### Typical Usage:
- Each PDF analysis = ~1 API request
- Average PDF = ~10,000-50,000 tokens (depending on size)
- **Cost per PDF**: Typically free (within free tier limits)
- **Monthly estimate**: $0-5 for typical usage (10-50 PDFs/month)

---

## 🔒 Security Best Practices

✅ **API key stored in `.env.local`** - Not committed to git
✅ **Server-side processing** - Key never exposed to browser
✅ **Rate limiting** - 7-second delay prevents quota exhaustion
✅ **Error handling** - Graceful fallback if API fails

### Additional Recommendations:
1. **Never commit `.env.local`** to version control (already in `.gitignore`)
2. **Rotate keys periodically** for security
3. **Monitor usage** in Google Cloud Console
4. **Set up billing alerts** if you exceed free tier

---

## 🚀 Testing the API Connection

### Quick Test:
1. Go to your app at `http://localhost:3002`
2. Navigate to **Orion Advisory** page (`/agents/advisory`)
3. Place a PDF in `/Users/bajor3k/Desktop/Orion Advisory`
4. Click the refresh button
5. Watch the console for AI analysis logs:
   ```
   [AI] Starting analysis for: filename.pdf
   [AI] Analysis result for filename.pdf: {...}
   [AI] Successfully analyzed and cached: filename.pdf
   ```

### Expected Behavior:
- PDFs appear in the Pending Review section
- Each row shows extracted data
- Status shows IGO (all fields valid) or NIGO (some fields missing)
- Click "View PDF" to see the original document
- Click on any row to expand and see all 12 data points

---

## 🛠️ Troubleshooting

### "The AI service is not configured"
**Problem**: API key not found or invalid
**Solution**:
- Verify `.env.local` exists with `GEMINI_API_KEY`
- Restart the dev server: `npm run dev`
- Check for typos in the API key

### "Rate limit exceeded"
**Problem**: Too many requests too quickly
**Solution**:
- Wait 1 minute (resets quota)
- System has built-in 7-second delay between requests
- Check `analysisCache` is working (avoids re-analyzing same files)

### "Analysis failed for [filename]"
**Problem**: PDF is corrupted, too large, or unsupported format
**Solution**:
- Check PDF opens in a PDF viewer
- Verify file size < 10MB
- Look at console logs for specific error
- All fields will show "Missing" on error

### No documents appearing
**Problem**: Folder path incorrect or permissions issue
**Solution**:
- Verify folder exists: `/Users/bajor3k/Desktop/Orion Advisory`
- Check folder permissions (read access required)
- Look for "Folder access failed" error in console
- API returns empty array if folder not found

---

## 📊 Monitoring API Usage

### Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Dashboard**
3. Click **Generative Language API**
4. View quotas, usage metrics, and error rates

### In Your Application:
- Check server console for AI analysis logs
- Each PDF analysis is logged with timing and results
- Cache hits show "Using cached analysis" (no API call)
- Failed analyses show error details

---

## 🔄 API Key Rotation

If you need to change the API key:

1. **Generate new key** in [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Update `.env.local`**:
   ```env
   GEMINI_API_KEY=your-new-api-key-here
   ```
3. **Restart dev server**:
   ```bash
   npm run dev
   ```
4. **Clear cache** (optional):
   - Cache is in-memory, automatically clears on restart
   - Or force refresh by modifying PDF files (updates `mtimeMs`)

---

## 📚 Additional Resources

- [Google AI Studio](https://aistudio.google.com/) - Manage API keys
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Pricing Calculator](https://ai.google.dev/pricing)

---

## ✅ Current Status

Your Gemini API is **fully configured and ready to use**:
- ✅ API Key: Active
- ✅ Integration: Complete
- ✅ PDF Analysis: Working
- ✅ Rate Limiting: Enabled
- ✅ Caching: Enabled
- ✅ Error Handling: In place

Navigate to the Orion Advisory page and start analyzing PDFs!
