const { Book } = require("./models");

const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A classic American novel set in the Jazz Age",
    price: 12.99,
    stock: 50,
    isbn: "978-0-7432-7356-5",
    category: "Fiction",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    featured: true,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A powerful story about racial injustice in the Deep South",
    price: 14.99,
    stock: 30,
    isbn: "978-0-06-112008-4",
    category: "Fiction",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    featured: true,
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian social science fiction novel and cautionary tale",
    price: 13.99,
    stock: 40,
    isbn: "978-0-452-28423-4",
    category: "Fiction",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    featured: true,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description:
      "A landmark volume in science writing by one of the great minds of our time",
    price: 18.99,
    stock: 25,
    isbn: "978-0-553-38016-8",
    category: "Science",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    featured: false,
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    description:
      "A book on evolution which popularized the gene-centered view of evolution",
    price: 16.99,
    stock: 35,
    isbn: "978-0-19-929114-4",
    category: "Science",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
    featured: false,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description:
      "A narrative of humanity's creation and evolution from the Stone Age",
    price: 19.99,
    stock: 45,
    isbn: "978-0-06-231609-7",
    category: "History",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    featured: true,
  },
  {
    title: "The Diary of a Young Girl",
    author: "Anne Frank",
    description:
      "The personal diary of a Jewish girl hiding during the Nazi occupation",
    price: 11.99,
    stock: 30,
    isbn: "978-0-553-29698-1",
    category: "History",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    featured: false,
  },
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    description: "A handbook of agile software craftsmanship",
    price: 42.99,
    stock: 20,
    isbn: "978-0-132-35088-4",
    category: "Technology",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
    featured: false,
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    description: "Journey to mastery for modern software developers",
    price: 39.99,
    stock: 25,
    isbn: "978-0-135-95705-9",
    category: "Technology",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=600&fit=crop",
    featured: false,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description:
      "A classic romantic novel about Elizabeth Bennet and Mr. Darcy",
    price: 10.99,
    stock: 50,
    isbn: "978-0-14-143951-8",
    category: "Romance",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    featured: false,
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    description:
      "A psychological thriller about a marriage gone terribly wrong",
    price: 15.99,
    stock: 35,
    isbn: "978-0-307-58836-5",
    category: "Mystery",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    featured: false,
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    description:
      "The exclusive biography of Steve Jobs based on more than forty interviews",
    price: 22.99,
    stock: 30,
    isbn: "978-1-4516-4853-9",
    category: "Biography",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
    featured: false,
  },
];

async function seedBooks() {
  try {
    await Book.sync({ force: false }); // Don't force, just sync

    // Check if books already exist
    const existingBooks = await Book.count();
    if (existingBooks > 0) {
      console.log(`Database already contains ${existingBooks} books.`);
      return;
    }

    await Book.bulkCreate(sampleBooks);
    console.log("Sample books added successfully!");
    console.log(`Added ${sampleBooks.length} books to the database.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding books:", error);
    process.exit(1);
  }
}

seedBooks();
