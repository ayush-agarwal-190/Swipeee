// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const geminiRoutes = require('./routes/gemini');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/gemini', geminiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
