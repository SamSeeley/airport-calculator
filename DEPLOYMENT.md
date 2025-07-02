# Deployment Guide

## Option 1: Netlify (Recommended)

1. **Create a Netlify account** at [netlify.com](https://netlify.com)
2. **Drag and drop** the `build` folder to Netlify's deploy area
3. **Your app will be live** at a URL like `https://random-name.netlify.app`
4. **Custom domain** can be added later

## Option 2: Vercel

1. **Create a Vercel account** at [vercel.com](https://vercel.com)
2. **Connect your GitHub repository** or upload the `build` folder
3. **Automatic deployments** on every push

## Option 3: GitHub Pages

1. **Update the homepage URL** in `package.json` with your actual GitHub username
2. **Push your code to GitHub**
3. **Run**: `npm run deploy`
4. **Enable GitHub Pages** in your repository settings

## Option 4: Firebase Hosting

1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Login**: `firebase login`
3. **Initialize**: `firebase init hosting`
4. **Deploy**: `firebase deploy`

## Important Notes

- Your app uses Google Maps API - make sure to configure the API key for production
- Update the `GOOGLE_MAPS_API_KEY` environment variable in your hosting platform
- The app is already built and ready in the `build/` folder 