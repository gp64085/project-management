import dotenv from 'dotenv';
import app from './app.js';
import connectToDB from './db/index.js';

dotenv.config({
  path: './.env',
});

connectToDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on port ${process.env.PORT} 🚀`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
  });
