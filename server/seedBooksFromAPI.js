const { Book } = require("./models");

// Using Open Library API - a free public API for books
const OPEN_LIBRARY_SUBJECTS = [
  "fiction",
  "science",
  "history",
  "romance",
  "mystery",
  "biography",
  "technology",
  "philosophy",
  "fantasy",
  "children",
  "business",
  "health",
  "education",
  "art",
];

async function fetchBooksFromOpenLibrary(subject, limit = 10) {
  const url = `https://openlibrary.org/subjects/${subject}.json?limit=${limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data.works.map((work) => ({
      title: work.title,
      author: work.authors?.[0]?.name || "Unknown Author",
      description: work.subject?.slice(0, 3)?.join(", ") || `A ${subject} book`,
      price: parseFloat((Math.random() * 30 + 10).toFixed(2)), // Random price between $10-$40
      stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
      isbn: work.availability?.isbn || null,
      category: subject.charAt(0).toUpperCase() + subject.slice(1),
      language: "English",
      imageUrl: work.cover_id
        ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
        : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    }));
  } catch (error) {
    console.error(`Error fetching ${subject} books:`, error.message);
    return [];
  }
}

async function seedBooksFromAPI() {
  try {
    await Book.sync({ force: false });

    // Check if books already exist
    const existingBooks = await Book.count();
    if (existingBooks > 0) {
      console.log(`Database already contains ${existingBooks} books.`);
      console.log(
        "Use --force flag to clear and reseed: node seedBooksFromAPI.js --force"
      );

      if (!process.argv.includes("--force")) {
        process.exit(0);
        return;
      }

      console.log("Force flag detected. Clearing existing books...");
      await Book.destroy({ where: {} });
    }

    console.log("Fetching books from Open Library API...\n");

    const allBooks = [];

    for (const subject of OPEN_LIBRARY_SUBJECTS) {
      console.log(`Fetching ${subject} books...`);
      const books = await fetchBooksFromOpenLibrary(subject, 10);
      allBooks.push(...books);
      console.log(`  Found ${books.length} ${subject} books`);

      // Small delay to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (allBooks.length === 0) {
      console.log("No books fetched from API. Check your internet connection.");
      process.exit(1);
    }

    // Remove duplicates by title
    const uniqueBooks = allBooks.filter(
      (book, index, self) =>
        index === self.findIndex((b) => b.title === book.title)
    );

    await Book.bulkCreate(uniqueBooks);
    console.log(
      `\nSuccessfully added ${uniqueBooks.length} books to the database!`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding books:", error);
    process.exit(1);
  }
}

seedBooksFromAPI();
