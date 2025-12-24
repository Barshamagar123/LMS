import "dotenv/config";
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import routes
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import enrollmentRoutes from "./src/routes/enrollmentRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import moduleRoutes from "./src/routes/moduleRoutes.js";
import lessonRoutes from "./src/routes/lessonRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import instructorRoutes from "./src/routes/instructorRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js"
import lessonProgressRoutes from "./src/routes/lessonProgressRoutes.js"
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ============ STATIC FILE SERVING ============
// Serve all uploads from the root uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Also serve each subdirectory separately for direct access
app.use("/uploads/profile-pictures", express.static(path.join(process.cwd(), "uploads/profile-pictures")));
app.use("/uploads/course-thumbnails", express.static(path.join(process.cwd(), "uploads/course-thumbnails")));
app.use("/uploads/course-videos", express.static(path.join(process.cwd(), "uploads/course-videos")));

// ============ ROUTES ============
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api", lessonRoutes);
app.use('/api/progress', lessonProgressRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/instructor", instructorRoutes);

// ============ HEALTH CHECK ============
app.get("/", (req, res) => res.send("API Running..."));

// ============ DEBUG ENDPOINT (Optional) ============
app.get("/debug-paths", (req, res) => {
  res.json({
    processCwd: process.cwd(),
    __dirname: __dirname,
    paths: {
      uploads: path.join(process.cwd(), "uploads"),
      profilePictures: path.join(process.cwd(), "uploads/profile-pictures"),
      courseThumbnails: path.join(process.cwd(), "uploads/course-thumbnails"),
      courseVideos: path.join(process.cwd(), "uploads/course-videos")
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads served from: ${path.join(process.cwd(), "uploads")}`);
  console.log(`👤 Profile pictures: http://localhost:${PORT}/uploads/profile-pictures/`);
  console.log(`📚 Course thumbnails: http://localhost:${PORT}/uploads/course-thumbnails/`);
  console.log(`🎥 Course videos: http://localhost:${PORT}/uploads/course-videos/`);
});