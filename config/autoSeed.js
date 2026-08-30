const bcrypt = require("bcryptjs");
const User = require("../models/User");
const workersData = require("../data/workers.json");

// Runs automatically once, right after MongoDB connects successfully.
// It is fully idempotent (safe to run on every server restart) - it only
// creates the admin account and demo workers if they don't already exist,
// so it will never duplicate or overwrite real data.
//
// This exists so the app never again shows "No workers available for
// this category yet." just because someone forgot to run `npm run seed`
// manually after switching to a new/empty database.
const autoSeed = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@supportflow.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@supportflow.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Auto-seed: admin account created (admin@supportflow.com / admin123)");
    }

    // Remove any old demo worker accounts left over from a previous version
    // of data/workers.json (e.g. renamed demo workers) so the worker list
    // always matches exactly what's in workers.json today. Only ever
    // touches accounts on the @supportflow.com demo domain - never a real
    // customer's data.
    const currentEmails = workersData.map((w) => w.email);
    const staleWorkers = await User.find({
      role: "worker",
      email: { $regex: "@supportflow\\.com$", $nin: currentEmails },
    });
    if (staleWorkers.length > 0) {
      await User.deleteMany({ _id: { $in: staleWorkers.map((w) => w._id) } });
      console.log(
        `Auto-seed: removed ${staleWorkers.length} outdated demo worker(s): ${staleWorkers
          .map((w) => w.email)
          .join(", ")}`
      );
    }

    let createdCount = 0;
    for (const worker of workersData) {
      const exists = await User.findOne({ email: worker.email });
      if (exists) continue;

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
      createdCount += 1;
    }

    if (createdCount > 0) {
      console.log(`Auto-seed: ${createdCount} demo worker account(s) created (password for all: worker123)`);
    } else {
      console.log("Auto-seed: admin and worker accounts already present, nothing to do.");
    }
  } catch (error) {
    // Auto-seed failing should never crash the server - just log it.
    console.error(`Auto-seed error: ${error.message}`);
  }
};

module.exports = autoSeed;
