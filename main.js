const app = require("./api/return");

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server local chạy ở http://localhost:" + PORT);
});
