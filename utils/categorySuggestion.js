// This is a STATIC, rule-based keyword matcher.
// It is NOT a real AI system and does not call any external AI API.
// It simply checks the description text for known keywords and
// suggests the best matching category.

const categoryKeywords = {
  Teaching: ["teach", "teaching", "tutor", "tutoring", "mathematics", "math", "study", "education", "lesson", "homework"],
  Technology: ["website", "computer", "software", "coding", "application", "programming", "app", "bug", "code", "laptop"],
  Design: ["logo", "design", "graphic", "poster", "ui", "banner", "flyer", "branding", "illustration"],
  Repair: ["repair", "fix", "broken", "maintenance", "damaged", "leak", "electrician", "plumb"],
  Cleaning: ["clean", "cleaning", "house", "room", "sweep", "laundry", "dust"],
};

const suggestCategory = (description) => {
  if (!description || typeof description !== "string") {
    return null;
  }

  const text = description.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const category of Object.keys(categoryKeywords)) {
    const keywords = categoryKeywords[category];
    let score = 0;

    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        score += 1;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  return bestScore > 0 ? bestMatch : null;
};

module.exports = { suggestCategory, categoryKeywords };
