# Wind Power Forecast Monitoring Application

A professional, production-grade monorepo designed for monitoring and analyzing wind power generation. This application integrates with the BMRS (Elexon) API to compare real-time actual generation against historical forecasts.

## Project Overview & Structure

This project is organized as a modern monorepo to ensure full-stack type safety and modularity:

- **`apps/web`**: Next.js 15 Frontend. Features interactive **Recharts** dashboards, persistent user state (localStorage), and responsive UI layouts for wind generation analysis.
- **`apps/api`**: NestJS (Node.js) Backend. Handles complex data merging, horizon-based filtering logic, and automated error calculations (MAE).
- **`packages/shared`**: Shared TypeScript package contains common interfaces (`WindDataPoint`) used by both the frontend and backend.
- **`apps/analysis`**: Dedicated directory for data science and research.

## How to Run 

1. **Install Dependencies** (Run from root):
   ```bash
   npm install
   ```

2. **Start the API Server**:
   ```bash
   npm run dev:api
   ```

3. **Start the Web Dashboard**:
   ```bash
   npm run dev:web
   ```

The application will be accessible at `http://localhost:3000`.

## Deployment Links

*   **Frontend**: [Vercel Deployment](https://wind-forecast-app-web.vercel.app/) 
*   **Backend**: [Render Deployment](https://wind-forecast-app.onrender.com/)

## Analysis Section

In-depth research and forecast accuracy models are documented in:
[`apps/analysis/wind_analysis.ipynb`](./apps/analysis/wind_analysis.ipynb)

**Key areas covered:**
- **Error Calculations**: Detailed Mean Absolute Error (MAE), Median, and P95 metrics.
- **Observations**: Qualitative analysis of BMRS forecast accuracy and variance.
- **Limitations**: In-depth review of historical BMRS dataset constraints.
- **Recommendations**: Guidelines on establishing reliable wind power baselines.

## 🤖 AI Usage

This project was developed with the assistance of the following AI tools for rapid prototyping and architecture design:

1. **Antigravity** (Primary Agentic AI Coding Assistant)
2. **ChatGPT**
