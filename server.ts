import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to proxy market data to avoid CORS
  app.get("/api/market-data", async (req, res) => {
    let URL = process.env.VITE_APPS_SCRIPT_URL;
    
    if (!URL || URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      URL = "https://script.google.com/macros/s/AKfycbz8jPXlnCjWQGaq9eSCS8HaXxGceaq290986nmLsHmV9JeHz0gAKKekmI2MdDuXyVt5ag/exec";
    }

    try {
      const response = await fetch(URL);
      if (!response.ok) throw new Error("Failed to fetch market data");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
