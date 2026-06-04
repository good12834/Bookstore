const { Review } = require("./models");

const sampleReviews = [
  // Reviews for The Great Gatsby (Book ID: 1)
  {
    bookId: 1,
    userId: null,
    rating: 5,
    comment: "Absolutely brilliant! A timeless classic.",
  },
  {
    bookId: 1,
    userId: null,
    rating: 4,
    comment: "Beautiful prose and deep themes.",
  },
  { bookId: 1, userId: null, rating: 5, comment: "Fitzgerald at his finest." },

  // Reviews for To Kill a Mockingbird (Book ID: 2)
  { bookId: 2, userId: null, rating: 5, comment: "Powerful and moving story." },
  {
    bookId: 2,
    userId: null,
    rating: 5,
    comment: "Essential reading for everyone.",
  },
  {
    bookId: 2,
    userId: null,
    rating: 4,
    comment: "Great characters and social commentary.",
  },

  // Reviews for 1984 (Book ID: 3)
  { bookId: 3, userId: null, rating: 5, comment: "Chilling and prophetic." },
  { bookId: 3, userId: null, rating: 4, comment: "Dark but important read." },
  { bookId: 3, userId: null, rating: 5, comment: "Orwell's masterpiece." },

  // Reviews for A Brief History of Time (Book ID: 4)
  { bookId: 4, userId: null, rating: 4, comment: "Complex but fascinating." },
  {
    bookId: 4,
    userId: null,
    rating: 5,
    comment: "Hawking makes physics accessible.",
  },
  { bookId: 4, userId: null, rating: 4, comment: "Challenging but rewarding." },

  // Reviews for The Selfish Gene (Book ID: 5)
  {
    bookId: 5,
    userId: null,
    rating: 5,
    comment: "Revolutionary perspective on evolution.",
  },
  {
    bookId: 5,
    userId: null,
    rating: 4,
    comment: "Thought-provoking and well-written.",
  },

  // Reviews for Sapiens (Book ID: 6)
  {
    bookId: 6,
    userId: null,
    rating: 5,
    comment: "Fascinating overview of human history.",
  },
  { bookId: 6, userId: null, rating: 5, comment: "Eye-opening and engaging." },
  {
    bookId: 6,
    userId: null,
    rating: 4,
    comment: "Great insights into human civilization.",
  },

  // Reviews for The Diary of a Young Girl (Book ID: 7)
  {
    bookId: 7,
    userId: null,
    rating: 5,
    comment: "Heartbreaking and inspiring.",
  },
  {
    bookId: 7,
    userId: null,
    rating: 5,
    comment: "A powerful testament to the human spirit.",
  },
  {
    bookId: 7,
    userId: null,
    rating: 4,
    comment: "Important historical document.",
  },

  // Reviews for Clean Code (Book ID: 8)
  {
    bookId: 8,
    userId: null,
    rating: 5,
    comment: "Essential for any developer.",
  },
  {
    bookId: 8,
    userId: null,
    rating: 5,
    comment: "Life-changing book on programming.",
  },
  {
    bookId: 8,
    userId: null,
    rating: 4,
    comment: "Great principles and practices.",
  },

  // Reviews for The Pragmatic Programmer (Book ID: 9)
  {
    bookId: 9,
    userId: null,
    rating: 5,
    comment: "Timeless advice for programmers.",
  },
  {
    bookId: 9,
    userId: null,
    rating: 4,
    comment: "Solid guidance for software development.",
  },

  // Reviews for Pride and Prejudice (Book ID: 10)
  {
    bookId: 10,
    userId: null,
    rating: 5,
    comment: "Charming and witty romance.",
  },
  {
    bookId: 10,
    userId: null,
    rating: 4,
    comment: "Austen's wit is unparalleled.",
  },
  { bookId: 10, userId: null, rating: 5, comment: "Perfect romantic comedy." },

  // Reviews for Gone Girl (Book ID: 11)
  {
    bookId: 11,
    userId: null,
    rating: 4,
    comment: "Twisty psychological thriller.",
  },
  { bookId: 11, userId: null, rating: 4, comment: "Couldn't put it down!" },
  {
    bookId: 11,
    userId: null,
    rating: 5,
    comment: "Brilliantly written mystery.",
  },

  // Reviews for Steve Jobs (Book ID: 12)
  {
    bookId: 12,
    userId: null,
    rating: 4,
    comment: "Detailed and insightful biography.",
  },
  {
    bookId: 12,
    userId: null,
    rating: 5,
    comment: "Fascinating look at an icon.",
  },
  {
    bookId: 12,
    userId: null,
    rating: 4,
    comment: "Well-researched and engaging.",
  },
];

async function seedReviews() {
  try {
    // Check if reviews already exist
    const existingReviews = await Review.count();
    if (existingReviews > 0) {
      console.log(`Database already contains ${existingReviews} reviews.`);
      return;
    }

    await Review.bulkCreate(sampleReviews);
    console.log("Sample reviews added successfully!");
    console.log(`Added ${sampleReviews.length} reviews to the database.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
}

seedReviews();
