const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// 🔹 USER INFO
const USER_INFO = {
  ruIQfoPOtfMRkQi2qWSKq106itj1: {
    name: "Knguyen Deptrai😈",
    username: "knguyen_t***",
    avatar: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FruIQfoPOtfMRkQi2qWSKq106itj1%2Fpublic%2Fprofile_pic.webp?alt=media&token=cd18273f-fad1-4daf-a4d8-1d5caf0875ef",
  },
  cFmSehuJeKh6OVrEVwwcnsannn52: {
    name: 'Trần Trang',
    username: "charlott***",
    avatar: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FcFmSehuJeKh6OVrEVwwcnsannn52%2Fpublic%2Fprofile_pic.webp?alt=media&token=3b5d3a2c-a793-44bd-95fa-8371b5a8e25a",
  },
  vrvZBmMIPIMhIkFEPzj5SzQCGAs2: {
    name: 'tẹt ⋆. 𐙚 ̊"',
    username: "hbich_***",
    avatar: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FvrvZBmMIPIMhIkFEPzj5SzQCGAs2%2Fpublic%2Fprofile_pic.webp?alt=media&token=1539a874-742b-45c4-a728-0196397e4f51",
  },
  lejPFDaX7gSvUSkH3r3OFaQxh0g2: {
    name: "ăn rồi ngủ",
    username: "duy****",
    avatar: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FlejPFDaX7gSvUSkH3r3OFaQxh0g2%2Fpublic%2Fprofile_pic.webp?alt=media&token=31e6a9a0-0133-4514-a5bd-5af64624d511",
  },
  xIalU4J5SjN07oelI0iiIKBJdQ82: {
    name: "piii chuộtttt",
    username: "ngocphuo**",
    avatar: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FxIalU4J5SjN07oelI0iiIKBJdQ82%2Fpublic%2Fprofile_pic.webp?alt=media&token=921bcce1-142f-40ee-ac90-7c0c36b611ce",
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
  const logPath = path.join(process.cwd(), "logs", "0202-0703.txt");

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
