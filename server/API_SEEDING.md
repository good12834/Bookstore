# Book API Seeding

This project now supports fetching books from external APIs using the free book APIs from [publicapis.dev/category/books](https://publicapis.dev/category/books).

## Using External Book APIs

### Available APIs

This project integrates with three powerful free book APIs:

1. **Gutendex API** (Project Gutenberg) - Classic Literature
2. **Open Library API** - Diverse Modern Books
3. **Google Books API** - Comprehensive Book Database

### Gutendex API (Recommended for Classic Literature)

**New Addition!** The Gutendex API provides access to over 70,000 public domain books from Project Gutenberg, including classic literature like Sherlock Holmes, Alice in Wonderland, Pride and Prejudice, and many more timeless works.

#### Features

- 100+ classic public domain books
- Famous titles: Sherlock Holmes, Alice in Wonderland, Pride and Prejudice
- High-quality classic literature
- No copyright issues (all public domain)
- Covers from Project Gutenberg when available

### Open Library API

The project uses the Open Library API, which provides free access to book data including titles, authors, descriptions, covers, and more.

### Available Commands

```bash
# Seed database with classic literature from Gutendex API (100 books)
npm run seed:gutendex
npm run seed:gutendex:force

# Seed database with books from Open Library API (33 books across 8 categories)
npm run seed:api
npm run seed:api:force

# Seed database with books from Google Books API (270+ books across 18 categories)
npm run seed:google
npm run seed:google:force

# Use original static seed data
npm run seed
```

#### API Categories Used

1. Classic Fiction
2. Fantasy & Adventure
3. Romance
4. Mystery & Detective
5. History
6. Science
7. Philosophy
8. Children's Literature
9. Poetry
10. Drama
11. Biography

Fetches books by popular topics (Sherlock Holmes, Alice in Wonderland, etc.) and categories.

### Open Library API Features

- Fetches 33 books across 8 categories: Fiction, Science, History, Romance, Mystery, Biography, Technology, Philosophy
- Automatically generates realistic prices and stock levels
- Fetches book covers from Open Library when available
- Removes duplicate books by title
- Includes error handling and respectful API usage with delays
- Shows progress during fetching

### Google Books API Features

- Fetches 270+ books across 18 categories
- Comprehensive book data with ratings, page counts, and publisher info
- High-quality cover images
- Advanced deduplication by title and author
- Batch processing for large datasets

#### Google Books Categories Used

Fiction, Science, History, Romance, Mystery, Biography, Technology, Philosophy, Fantasy, Children, Business, Health, Education, Art, Cooking, Travel, Self-help

Each API provides unique benefits and book selections.

## Integration Notes

### General Features

- All fetched books are automatically mapped to your existing Book model schema
- Includes comprehensive error handling and API rate limiting
- Shows progress during fetching with detailed logging
- Removes duplicates across API sources
- Batch processing to avoid overwhelming the database

### API-Specific Details

**Gutendex API (Classic Literature):**

- Focuses on public domain classics
- Prices: $7.99-$15.99 (affordable classic pricing)
- Stock: 20-60 units per book
- All books are copyright-free public domain works

**Open Library API:**

- Diverse modern and classic mix
- Prices: $10-$40
- Stock: 10-60 units per book

**Google Books API:**

- Comprehensive modern selection
- Prices: $8-$48
- Stock: 15-75 units per book
- Includes ratings, page counts, and publisher data

### Usage Recommendations

- **For Classic Literature Focus:** Use `npm run seed:gutendex`
- **For Diverse Modern Collection:** Use `npm run seed:google`
- **For Balanced Collection:** Use `npm run seed:api`
- **For Mixed Approach:** Run multiple seeds in sequence

### API Rate Limiting

All seeding scripts include respectful API usage:

- 200-500ms delays between requests
- Automatic error handling and retries
- Batch processing to minimize database load
