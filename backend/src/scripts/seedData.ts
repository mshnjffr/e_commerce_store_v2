import mongoose from 'mongoose';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { connectDB } from '../services/database';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  {
    name: 'Electronics',
    description: 'Latest technology and electronic devices',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop'
  },
  {
    name: 'Clothing',
    description: 'Fashion and apparel for all occasions',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop'
  },
  {
    name: 'Books',
    description: 'Books, novels, and educational materials',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop'
  },
  {
    name: 'Home & Garden',
    description: 'Home decor, furniture, and gardening supplies',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop'
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'
  },
  {
    name: 'Beauty & Health',
    description: 'Beauty products and health supplements',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop'
  }
];

const subcategories = [
  // Electronics subcategories
  { name: 'Smartphones', parentName: 'Electronics', description: 'Latest smartphones and mobile devices' },
  { name: 'Laptops', parentName: 'Electronics', description: 'Laptops and computers' },
  { name: 'Audio', parentName: 'Electronics', description: 'Headphones, speakers, and audio equipment' },
  
  // Clothing subcategories
  { name: "Men's Clothing", parentName: 'Clothing', description: 'Fashion for men' },
  { name: "Women's Clothing", parentName: 'Clothing', description: 'Fashion for women' },
  { name: 'Shoes', parentName: 'Clothing', description: 'Footwear for all occasions' },
  
  // Books subcategories
  { name: 'Fiction', parentName: 'Books', description: 'Novels and fiction books' },
  { name: 'Non-Fiction', parentName: 'Books', description: 'Educational and informational books' },
  { name: 'Children', parentName: 'Books', description: 'Books for children and young adults' }
];

const products = [
  // Electronics
  {
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features 6.1-inch Super Retina XDR display with ProMotion technology.',
    price: 999.99,
    category: 'Smartphones',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop'
    ],
    stock: 50,
    sku: 'IPHONE15PRO',
    ratings: [
      { rating: 5, comment: 'Amazing phone! Love the new titanium design.' },
      { rating: 4, comment: 'Great camera quality, battery life could be better.' }
    ]
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen, 200MP camera, and AI features. 6.8-inch Dynamic AMOLED 2X display.',
    price: 1199.99,
    category: 'Smartphones',
    images: [
      'https://images.unsplash.com/photo-1610792516286-524726503fb2?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1565849904461-04a58b4d2c9c?w=500&h=500&fit=crop'
    ],
    stock: 35,
    sku: 'GALAXYS24ULTRA',
    ratings: [
      { rating: 5, comment: 'Best Android phone I\'ve ever used!' },
      { rating: 5, comment: 'S Pen is incredibly useful for productivity.' }
    ]
  },
  {
    name: 'MacBook Pro 16"',
    description: 'Powerful laptop with M3 Max chip, 16-inch Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for professionals.',
    price: 2499.99,
    category: 'Laptops',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop'
    ],
    stock: 20,
    sku: 'MACBOOKPRO16',
    ratings: [
      { rating: 5, comment: 'Incredible performance for video editing!' },
      { rating: 4, comment: 'Expensive but worth it for professional work.' }
    ]
  },
  {
    name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with Intel Core i7, 13.4-inch InfinityEdge display, and premium build quality.',
    price: 1299.99,
    category: 'Laptops',
    images: [
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop'
    ],
    stock: 30,
    sku: 'DELLXPS13',
    ratings: [
      { rating: 4, comment: 'Great build quality and portability.' },
      { rating: 4, comment: 'Perfect for business and travel.' }
    ]
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery life, and premium comfort.',
    price: 399.99,
    category: 'Audio',
    images: [
      'https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop'
    ],
    stock: 75,
    sku: 'SONYWH1000XM5',
    ratings: [
      { rating: 5, comment: 'Best noise canceling headphones ever!' },
      { rating: 5, comment: 'Sound quality is phenomenal.' }
    ]
  },
  {
    name: 'AirPods Pro (2nd Generation)',
    description: 'Advanced wireless earbuds with adaptive transparency, personalized spatial audio, and up to 6 hours of listening time.',
    price: 249.99,
    category: 'Audio',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop'
    ],
    stock: 100,
    sku: 'AIRPODSPRO2',
    ratings: [
      { rating: 4, comment: 'Great for iPhone users.' },
      { rating: 5, comment: 'Excellent noise cancellation and fit.' }
    ]
  },

  // Clothing
  {
    name: "Men's Classic Denim Jacket",
    description: 'Timeless denim jacket made from 100% cotton. Features classic button closure, chest pockets, and a comfortable regular fit.',
    price: 89.99,
    category: "Men's Clothing",
    images: [
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500&h=500&fit=crop'
    ],
    stock: 60,
    sku: 'MENDENIMJACKET',
    ratings: [
      { rating: 4, comment: 'Great quality denim, fits perfectly.' },
      { rating: 5, comment: 'Classic style that never goes out of fashion.' }
    ]
  },
  {
    name: "Women's Elegant Evening Dress",
    description: 'Sophisticated evening dress perfect for special occasions. Made from premium fabric with elegant draping and comfortable fit.',
    price: 159.99,
    category: "Women's Clothing",
    images: [
      'https://images.unsplash.com/photo-1566479179817-c0ad50da8a1d?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop'
    ],
    stock: 25,
    sku: 'WOMENEVENINGDRESS',
    ratings: [
      { rating: 5, comment: 'Beautiful dress, received many compliments!' },
      { rating: 4, comment: 'Great quality fabric and fit.' }
    ]
  },
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Max Air unit in the heel for exceptional cushioning. Features breathable mesh upper and durable rubber outsole.',
    price: 149.99,
    category: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&h=500&fit=crop'
    ],
    stock: 80,
    sku: 'NIKEAIRMAX270',
    ratings: [
      { rating: 5, comment: 'Most comfortable shoes I\'ve ever worn!' },
      { rating: 4, comment: 'Great for running and daily wear.' }
    ]
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Premium running shoes with Boost midsole technology for energy return. Features Primeknit upper and Continental rubber outsole.',
    price: 179.99,
    category: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop'
    ],
    stock: 45,
    sku: 'ADIDASULTRABOOST22',
    ratings: [
      { rating: 5, comment: 'Amazing comfort and style!' },
      { rating: 4, comment: 'Perfect for long runs.' }
    ]
  },

  // Books
  {
    name: 'The Psychology of Programming',
    description: 'Classic book on software development psychology by Gerald Weinberg. Essential reading for programmers and software engineers.',
    price: 29.99,
    category: 'Non-Fiction',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop'
    ],
    stock: 40,
    sku: 'PSYCHOLOGYPROGRAM',
    ratings: [
      { rating: 5, comment: 'Must-read for any programmer!' },
      { rating: 4, comment: 'Insightful and still relevant today.' }
    ]
  },
  {
    name: 'The Midnight Library',
    description: 'Bestselling novel by Matt Haig about life, regret, and infinite possibilities. A thought-provoking exploration of the choices we make.',
    price: 16.99,
    category: 'Fiction',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&h=500&fit=crop'
    ],
    stock: 55,
    sku: 'MIDNIGHTLIBRARY',
    ratings: [
      { rating: 5, comment: 'Beautiful and moving story!' },
      { rating: 4, comment: 'Makes you think about life choices.' }
    ]
  },
  {
    name: "Harry Potter Complete Series",
    description: 'Complete set of all 7 Harry Potter books by J.K. Rowling. Perfect collection for young readers and fans of the wizarding world.',
    price: 89.99,
    category: 'Children',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'
    ],
    stock: 30,
    sku: 'HARRYPOTTERSET',
    ratings: [
      { rating: 5, comment: 'Magical series that never gets old!' },
      { rating: 5, comment: 'Perfect gift for young readers.' }
    ]
  },

  // Home & Garden
  {
    name: 'Modern Coffee Table',
    description: 'Sleek modern coffee table with tempered glass top and solid wood legs. Perfect centerpiece for contemporary living rooms.',
    price: 299.99,
    category: 'Home & Garden',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop'
    ],
    stock: 15,
    sku: 'MODERNCOFFEETABLE',
    ratings: [
      { rating: 4, comment: 'Beautiful design, easy to assemble.' },
      { rating: 5, comment: 'Perfect for my living room!' }
    ]
  },
  {
    name: 'Organic Herb Garden Kit',
    description: 'Complete herb garden kit with seeds for basil, parsley, cilantro, and thyme. Includes biodegradable pots and organic soil.',
    price: 24.99,
    category: 'Home & Garden',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&h=500&fit=crop'
    ],
    stock: 70,
    sku: 'HERBGARDENKIT',
    ratings: [
      { rating: 5, comment: 'Easy to grow, fresh herbs in weeks!' },
      { rating: 4, comment: 'Great for beginners.' }
    ]
  },

  // Sports & Outdoors
  {
    name: 'Professional Yoga Mat',
    description: 'Premium yoga mat made from eco-friendly TPE material. Non-slip surface, extra cushioning, and includes carrying strap.',
    price: 49.99,
    category: 'Sports & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1506629905959-b21e9b043a33?w=500&h=500&fit=crop'
    ],
    stock: 60,
    sku: 'PROYOGAMAT',
    ratings: [
      { rating: 5, comment: 'Perfect grip and cushioning!' },
      { rating: 4, comment: 'Great quality for the price.' }
    ]
  },
  {
    name: 'Camping Tent 4-Person',
    description: 'Waterproof camping tent for 4 people with easy setup, UV protection, and spacious interior. Includes carrying bag and stakes.',
    price: 129.99,
    category: 'Sports & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&h=500&fit=crop'
    ],
    stock: 25,
    sku: 'CAMPINGTENT4P',
    ratings: [
      { rating: 4, comment: 'Easy setup, weatherproof.' },
      { rating: 5, comment: 'Perfect for family camping trips!' }
    ]
  },

  // Beauty & Health
  {
    name: 'Vitamin C Serum',
    description: 'Premium vitamin C serum with hyaluronic acid and vitamin E. Anti-aging formula for brighter, more youthful-looking skin.',
    price: 34.99,
    category: 'Beauty & Health',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&h=500&fit=crop'
    ],
    stock: 85,
    sku: 'VITAMINCSERUM',
    ratings: [
      { rating: 5, comment: 'Amazing results after just 2 weeks!' },
      { rating: 4, comment: 'Gentle on sensitive skin.' }
    ]
  },
  {
    name: 'Multivitamin Supplement',
    description: 'Complete daily multivitamin with essential vitamins and minerals. 30-day supply in easy-to-swallow capsules.',
    price: 19.99,
    category: 'Beauty & Health',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&h=500&fit=crop'
    ],
    stock: 120,
    sku: 'MULTIVITAMIN30',
    ratings: [
      { rating: 4, comment: 'Good quality vitamins.' },
      { rating: 4, comment: 'Feel more energetic since taking these.' }
    ]
  }
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    // Create categories
    console.log('📂 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);
    
    // Create subcategories
    console.log('📁 Creating subcategories...');
    const subcategoryPromises = subcategories.map(async (subcat) => {
      const parentCategory = createdCategories.find(cat => cat.name === subcat.parentName);
      if (parentCategory) {
        return Category.create({
          name: subcat.name,
          description: subcat.description,
          parentCategory: parentCategory._id
        });
      }
    });
    
    const createdSubcategories = await Promise.all(subcategoryPromises.filter(Boolean));
    console.log(`✅ Created ${createdSubcategories.length} subcategories`);
    
    // Create products
    console.log('📦 Creating products...');
    const allCategories = [...createdCategories, ...createdSubcategories];
    
    const productPromises = products.map(async (product) => {
      const category = allCategories.find(cat => cat.name === product.category);
      if (category) {
        // Create fake user ratings with proper user IDs
        const ratingsWithUserIds = product.ratings.map(rating => ({
          ...rating,
          userId: new mongoose.Types.ObjectId(),
          createdAt: new Date()
        }));
        
        return Product.create({
          ...product,
          categoryId: category._id,
          ratings: ratingsWithUserIds
        });
      }
    });
    
    const createdProducts = await Promise.all(productPromises.filter(Boolean));
    console.log(`✅ Created ${createdProducts.length} products`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Subcategories: ${createdSubcategories.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
