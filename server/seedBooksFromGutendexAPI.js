const { Book } = require("./models");

// Using Gutendex API - A free public API for Project Gutenberg books
const BOOK_CATEGORIES = [
  "fiction",
  "fantasy",
  "romance",
  "mystery",
  "adventure",
  "history",
  "science",
  "philosophy",
  "children",
  "poetry",
  "drama",
  "biography",
];

// Popular search topics to get diverse classic literature
const POPULAR_TOPICS = [
  "Sherlock Holmes",
  "Alice in Wonderland",
  "Pride and Prejudice",
  "Frankenstein",
  "Dracula",
  "Jane Eyre",
  "Little Women",
  "Great Expectations",
  "A Christmas Carol",
  "The Time Machine",
  "The War of the Worlds",
  "The Picture of Dorian Gray",
];

async function fetchBooksFromGutendex(searchTerm, page = 1) {
  const url = `https://gutendex.com/books/?search=${encodeURIComponent(
    searchTerm
  )}&page=${page}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((book) => {
      const authors =
        book.authors && book.authors.length > 0
          ? book.authors.map((author) => author.name).join(", ")
          : "Unknown Author";

      const subjects =
        book.subjects && book.subjects.length > 0
          ? book.subjects.slice(0, 3).join(", ")
          : "Classic Literature";

      // Generate realistic price based on book type and age
      let price = 0.00; // Free books

      return {
        title: book.title || "Unknown Title",
        author: authors,
        description: `Classic ${subjects} literature from Project Gutenberg. ${book.subjects && book.subjects[0]
            ? `Category: ${book.subjects[0]}`
            : ""
          }`,
        price: 0.00,
        stock: Math.floor(Math.random() * 40) + 20, // Stock between 20-60
        isbn: book.ids?.isbn_13?.[0] || book.ids?.isbn_10?.[0] || null,
        category: subjects.split(",")[0] || "Literature",
        language: book.languages?.[0] || "en",
        imageUrl: book.formats?.["image/jpeg"]
          ? book.formats["image/jpeg"]
          : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        // Additional fields for enhanced data
        publisher: "Project Gutenberg (Public Domain)",
        publishedDate: book.publish_year ? book.publish_year.toString() : null,
        pageCount: book.page_count || null,
        averageRating: 4.0 + Math.random() * 0.8, // Classic books tend to have good ratings
        ratingsCount: Math.floor(Math.random() * 1000) + 100,
        isFree: true,
        isPublicDomain: true,
      };
    });
  } catch (error) {
    console.error(`Error fetching books for "${searchTerm}":`, error.message);
    return [];
  }
}

async function seedBooksFromGutendexAPI() {
  try {
    await Book.sync({ force: false });

    // Check if books already exist
    const existingBooks = await Book.count();
    if (existingBooks > 0) {
      console.log(`Database contains ${existingBooks} books. Appending new books...`);
    }

    console.log(
      "Fetching classic literature from Gutendex API (Project Gutenberg)...\n"
    );

    const allBooks = [];
    let bookCount = 0;
    const targetBooks = 100; // Target number of classic books

    // Fetch books by popular topics first
    for (const topic of POPULAR_TOPICS) {
      if (bookCount >= targetBooks) break;

      console.log(`Fetching classic books for: "${topic}"`);
      const books = await fetchBooksFromGutendex(topic);

      for (const book of books) {
        if (bookCount >= targetBooks) break;
        allBooks.push(book);
        bookCount++;
      }

      console.log(
        `  Found ${Math.min(
          books.length,
          targetBooks - bookCount
        )} ${topic} books`
      );

      // Small delay to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // If we need more books, fetch by categories
    for (const category of BOOK_CATEGORIES) {
      if (bookCount >= targetBooks) break;

      console.log(`Fetching ${category} classics...`);
      const books = await fetchBooksFromGutendex(category);

      for (const book of books) {
        if (bookCount >= targetBooks) break;
        // Check if this book is already in our collection
        const isDuplicate = allBooks.some(
          (existingBook) =>
            existingBook.title.toLowerCase() === book.title.toLowerCase()
        );

        if (!isDuplicate) {
          allBooks.push(book);
          bookCount++;
        }
      }

      console.log(
        `  Added ${Math.min(
          books.length,
          targetBooks - bookCount
        )} ${category} classics`
      );

      // Small delay to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (allBooks.length === 0) {
      console.log("No books fetched from API. Check your internet connection.");
      process.exit(1);
    }

    // Remove duplicates by title
    const uniqueBooks = allBooks.filter((book, index, self) => {
      const bookKey = book.title.toLowerCase();
      const firstIndex = self.findIndex(
        (b) => b.title.toLowerCase() === bookKey
      );
      return index === firstIndex;
    });

    console.log(`\nRemoving duplicates...`);
    console.log(`Total books before deduplication: ${allBooks.length}`);
    console.log(`Unique books after deduplication: ${uniqueBooks.length}`);

    // Batch insert in smaller chunks to avoid overwhelming the database
    const batchSize = 25;
    let totalInserted = 0;

    for (let i = 0; i < uniqueBooks.length; i += batchSize) {
      const batch = uniqueBooks.slice(i, i + batchSize);
      try {
        await Book.bulkCreate(batch);
        totalInserted += batch.length;
        console.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length
          } books (${totalInserted}/${uniqueBooks.length} total)`
        );
      } catch (e) {
        console.error(`Batch insert failed: ${e.message}`);
        if (e.errors) e.errors.forEach(err => console.error(err.message));
      }
    }

    console.log(
      `\n🎉 Successfully added ${totalInserted} classic books to the database!`
    );
    console.log(
      `📚 Classic literature sourced from Gutendex API (Project Gutenberg)`
    );
    console.log(
      `🌟 All books are public domain classics - perfect for a book store!`
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

    console.log("\n✨ Features of these classic books:");
    console.log("  • All public domain - no copyright issues");
    console.log("  • High-quality classic literature");
    console.log(
      "  • Includes famous titles like Sherlock Holmes, Alice in Wonderland"
    );
    console.log("  • Perfect for readers who love timeless stories");
    console.log("  • Great addition to any book store collection");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding classic books:", error);
    process.exit(1);
  }
}

// Allow running as standalone script
if (require.main === module) {
  seedBooksFromGutendexAPI();
}

module.exports = { seedBooksFromGutendexAPI, fetchBooksFromGutendex };
