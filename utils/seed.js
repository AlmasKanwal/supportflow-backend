// Run with: npm run seed
// Seeds the database with an admin account and demo workers.
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const workersData = require("../data/workers.json");

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Seed admin
    const adminExists = await User.findOne({ email: "admin@supportflow.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@supportflow.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin account created: admin@supportflow.com / admin123");
    } else {
      console.log("Admin account already exists, skipping.");
    }

    // Seed workers
    for (const worker of workersData) {
      const exists = await User.findOne({ email: worker.email });
      if (exists) {
        console.log(`Worker already exists, skipping: ${worker.email}`);
        continue;
      }
      const hashedPassword = await bcrypt.hash(worker.password, 10);
      await User.create({
        name: worker.name,
        email: worker.email,
        password: hashedPassword,
        role: "worker",
        categories: worker.categories,
        rating: worker.rating,
        totalReviews: worker.totalReviews,
        completedTasks: worker.completedTasks,
        isActive: worker.isActive,
      });
      console.log(`Worker created: ${worker.email} / worker123`);
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
