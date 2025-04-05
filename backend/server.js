// Import required dependencies
import express from "express";
import axios from "axios";
const app = express();


const PORT = process.env.PORT || 3000;
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service';


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});