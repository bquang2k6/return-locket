const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// 🔹 USER INFO
const USER_INFO = {
  pmcyI9EI1rPgvImfkwWT1Z1ZsHA2: {
    name: "Quang Phạm",
    username: "pwa***",
    avatar: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/icon/icon_locket_default.webp",
  },
  vrvZBmMIPIMhIkFEPzj5SzQCGAs2: {
    name: '⋆. 𐙚 ̊" tẹt ',
    username: "h***_cute",
    avatar: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FvrvZBmMIPIMhIkFEPzj5SzQCGAs2%2Fpublic%2Fprofile_pic.webp?alt=media&token=fa0203b5-67f8-4737-a8b8-a6f37aaf9ba2",
  },
  cFmSehuJeKh6OVrEVwwcnsannn52: {
    name: "Trần Tr**",
    username: "charlotte1***",
    avatar: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FcFmSehuJeKh6OVrEVwwcnsannn52%2Fpublic%2Fprofile_pic.webp?alt=media&token=bc9cc1f4-77a4-4c5b-98db-dc46658fb289",
  },
  S2HiUe90Lkg3kOkXMyMThPCqomF2: {
    name: "hi**",
    username: "hi***",
    avatar: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/icon/icon_locket_default.webp",
  },
  "5iGRlbUao5MCXB92g4mcXzFQ08T2": {
    name: "tao la *** ne",
    username: "camupr**",
    avatar: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2F5iGRlbUao5MCXB92g4mcXzFQ08T2%2Fpublic%2Fprofile_pic.webp?alt=media&token=f2613f02-f8c3-41bc-a4da-1c76c835860d",
  },
};

// Regex xóa ANSI color
const ANSI_ESCAPE = /\x1B\[[0-?]*[ -/]*[@-~]/g;
const cleanAnsi = (text) => text.replace(ANSI_ESCAPE, "");

function analyzeLog(logText) {
  logText = cleanAnsi(logText);

  const stats = { login: 0, post_image: 0, post_video: 0 };
  const userPostCounter = {};
  const dayPostCounter = {};

  for (const line of logText.split("\n")) {
    const dateMatch = line.match(/^(\d{2}-\d{2}-\d{4})/);
    const date = dateMatch ? dateMatch[1] : null;

    if (line.includes("[login Locket]") && line.includes("End")) {
      stats.login++;
    }

    if (line.includes("[postImage]") && line.includes("End")) {
      stats.post_image++;
      if (date) dayPostCounter[date] = (dayPostCounter[date] || 0) + 1;
    }

    if (line.includes("[postVideo]") && line.includes("End")) {
      stats.post_video++;
      if (date) dayPostCounter[date] = (dayPostCounter[date] || 0) + 1;
    }

    if (line.includes("[uploadMedia]") && line.includes("userId:")) {
      const match = line.match(/userId:\s*([A-Za-z0-9]+)/);
      if (match) {
        const userId = match[1];
        userPostCounter[userId] = (userPostCounter[userId] || 0) + 1;
      }
    }
  }

  return { stats, users: userPostCounter, days: dayPostCounter };
}

// API
app.get("/api/return", (req, res) => {
  const logPath = path.join(process.cwd(), "logs", "2312-0202.txt");

  if (!fs.existsSync(logPath)) {
    return res.status(404).json({ error: "Không tìm thấy file log" });
  }

  const logData = fs.readFileSync(logPath, "utf8");
  const result = analyzeLog(logData);

  const topUsers = Object.entries(result.users)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, count]) => ({
      userId,
      count,
      name: USER_INFO[userId]?.name || "Unknown",
      username: USER_INFO[userId]?.username || null,
      avatar: USER_INFO[userId]?.avatar || null,
    }));

  let topDay = null;
  if (Object.keys(result.days).length) {
    const [day, count] = Object.entries(result.days).sort((a, b) => b[1] - a[1])[0];
    topDay = { day, count };
  }

  res.json({
    stats: result.stats,
    top_users: topUsers,
    top_day: topDay,
  });
});

module.exports = app;
