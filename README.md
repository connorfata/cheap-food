# Cheap Eats NYC 🍕🥪

Find real-time meals under $10 in NYC — delis, food trucks, pantries, and more.

## Stack
- React + Vite + Tailwind
- Yelp Fusion API
- NYC Open Data

## Run Locally
```bash
npm install
cp .env.local.example .env.local # add your Yelp API key
npm run dev
```

## Data Sources
- [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3)
- [NYC Food Pantries](https://data.cityofnewyork.us/resource/yjpx-8qdf.json)

## Deploy
- One-click deploy to Vercel or Netlify.

## Contribute
- PRs welcome! Keep it local, keep it cheap.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
