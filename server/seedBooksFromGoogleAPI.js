const { Book } = require("./models");

// Using Google Books API - a free public API for books
const BOOK_CATEGORIES = [
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
  "cooking",
  "travel",
  "self-help",
];

async function fetchBooksFromGoogleBooks(category, maxResults = 15) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(
    category
  )}&maxResults=${maxResults}&orderBy=relevance`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.items) {
      console.log(`  No books found for category: ${category}`);
      return [];
    }

    return data.items.map((item) => {
      const volumeInfo = item.volumeInfo || {};
      const saleInfo = item.saleInfo || {};
      const imageLinks = volumeInfo.imageLinks || {};

      return {
        title: volumeInfo.title || "Unknown Title",
        author: volumeInfo.authors ? volumeInfo.authors[0] : "Unknown Author",
        description: volumeInfo.description || `A ${category} book`,
        price: parseFloat((Math.random() * 40 + 8).toFixed(2)), // Random price between $8-$48
        stock: Math.floor(Math.random() * 60) + 15, // Random stock between 15-75
        isbn: volumeInfo.industryIdentifiers
          ? volumeInfo.industryIdentifiers.find((id) => id.type === "ISBN_13")
              ?.identifier ||
            volumeInfo.industryIdentifiers.find((id) => id.type === "ISBN_10")
              ?.identifier ||
            null
          : null,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        language: volumeInfo.language || "English",
        imageUrl:
          imageLinks.thumbnail ||
          imageLinks.smallThumbnail ||
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        // Additional fields for enhanced data
        publisher: volumeInfo.publisher || "Unknown Publisher",
        publishedDate: volumeInfo.publishedDate || null,
        pageCount: volumeInfo.pageCount || null,
        averageRating: volumeInfo.averageRating || null,
        ratingsCount: volumeInfo.ratingsCount || null,
      };
    });
  } catch (error) {
    console.error(`Error fetching ${category} books:`, error.message);
    return [];
  }
}

async function seedBooksFromGoogleAPI() {
  try {
    await Book.sync({ force: false });

    // Check if books already exist
    const existingBooks = await Book.count();
    if (existingBooks > 0) {
      console.log(`Database already contains ${existingBooks} books.`);
      console.log(
        "Use --force flag to clear and reseed: node seedBooksFromGoogleAPI.js --force"
      );

      if (!process.argv.includes("--force")) {
        process.exit(0);
        return;
      }

      console.log("Force flag detected. Clearing existing books...");
      await Book.destroy({ where: {} });
    }

    console.log("Fetching books from Google Books API...\n");

    const allBooks = [];

    for (const category of BOOK_CATEGORIES) {
      console.log(`Fetching ${category} books...`);
      const books = await fetchBooksFromGoogleBooks(category, 15);
      allBooks.push(...books);
      console.log(`  Found ${books.length} ${category} books`);

      // Small delay to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (allBooks.length === 0) {
      console.log("No books fetched from API. Check your internet connection.");
      process.exit(1);
    }

    // Remove duplicates by title and author combination
    const uniqueBooks = allBooks.filter((book, index, self) => {
      const bookKey = `${book.title}-${book.author}`.toLowerCase();
      const firstIndex = self.findIndex(
        (b) => `${b.title}-${b.author}`.toLowerCase() === bookKey
      );
      return index === firstIndex;
    });

    console.log(`\nRemoving duplicates...`);
    console.log(`Total books before deduplication: ${allBooks.length}`);
    console.log(`Unique books after deduplication: ${uniqueBooks.length}`);

    // Batch insert in smaller chunks to avoid overwhelming the database
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < uniqueBooks.length; i += batchSize) {
      const batch = uniqueBooks.slice(i, i + batchSize);
      await Book.bulkCreate(batch);
      totalInserted += batch.length;
      console.log(
        `Inserted batch ${Math.floor(i / batchSize) + 1}: ${
          batch.length
        } books (${totalInserted}/${uniqueBooks.length} total)`
      );
    }

    console.log(
      `\n🎉 Successfully added ${totalInserted} books to the database!`
    );
    console.log(
      `📚 Books sourced from Google Books API across ${BOOK_CATEGORIES.length} categories`
    );

    // Display category breakdown
    const categoryCount = {};
    uniqueBooks.forEach((book) => {
      categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
    });

    console.log("\n📊 Books by category:");
    Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} books`);
      });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding books:", error);
    process.exit(1);
  }
}

seedBooksFromGoogleAPI();
