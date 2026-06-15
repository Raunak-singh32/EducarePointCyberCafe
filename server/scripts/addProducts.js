require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    name: "Exam Board",
    category: "stationery",
    price: 100,
    quantity: 20,
    description: "Strong wooden exam board for school and college students.",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db",
    stockStatus: "In Stock",
    isPopular: true
  },
  {
    name: "Drawing Board",
    category: "art-supplies",
    price: 300,
    quantity: 10,
    description: "Premium drawing board suitable for art and engineering drawings.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
    stockStatus: "In Stock"
  },
  {
    name: "DOMS Oil Pastels",
    category: "art-supplies",
    price: 100,
    quantity: 25,
    description: "Bright and smooth oil pastel colours for students.",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
    stockStatus: "In Stock",
    isPopular: true
  },
  {
    name: "DOMS Clay Pack",
    category: "art-supplies",
    price: 50,
    quantity: 30,
    description: "Soft modelling clay for school projects and crafts.",
    image: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2",
    stockStatus: "In Stock"
  },
  {
    name: "Kores Clay Pack",
    category: "art-supplies",
    price: 50,
    quantity: 20,
    description: "Colourful clay for creative art projects.",
    image: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2",
    stockStatus: "In Stock"
  },
  {
    name: "Reflection Paper",
    category: "craft",
    price: 230,
    quantity: 15,
    description: "Reflective paper for decorative and school projects.",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338",
    stockStatus: "In Stock"
  },
  {
    name: "Geometry Box",
    category: "stationery",
    price: 90,
    quantity: 40,
    description: "Complete geometry instrument box.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    stockStatus: "In Stock",
    isPopular: true
  },
  {
    name: "Camel Glue",
    category: "stationery",
    price: 20,
    quantity: 50,
    description: "Strong adhesive glue for projects and crafts.",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338",
    stockStatus: "In Stock"
  },
  {
    name: "100 Page Notebook",
    category: "copies",
    price: 35,
    quantity: 100,
    description: "100-page ruled notebook for students.",
    image: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c",
    stockStatus: "In Stock",
    isPopular: true
  },
  {
    name: "180 Page Notebook",
    category: "copies",
    price: 45,
    quantity: 80,
    description: "180-page premium notebook.",
    image: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c",
    stockStatus: "In Stock"
  },
  {
    name: "Study Table",
    category: "furniture",
    price: 300,
    quantity: 5,
    description: "Compact study table for home use.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    stockStatus: "In Stock"
  },
  {
    name: "Carrom Board",
    category: "sports",
    price: 850,
    quantity: 4,
    description: "Standard size carrom board for family entertainment.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
    stockStatus: "In Stock"
  },
  {
    name: "Water Bottle Set (6 pcs)",
    category: "utility",
    price: 170,
    quantity: 15,
    description: "Durable water bottle set.",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504",
    stockStatus: "In Stock"
  },
  {
    name: "Art Paper Pack",
    category: "art-supplies",
    price: 30,
    quantity: 60,
    description: "Art paper available in white, pink, blue and green.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    stockStatus: "In Stock"
  },
  {
    name: "A4 Colour Paper",
    category: "craft",
    price: 50,
    quantity: 50,
    description: "A4 size colour paper for school projects.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    stockStatus: "In Stock"
  },
  {
    name: "Project File",
    category: "stationery",
    price: 20,
    quantity: 40,
    description: "Good quality project file.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    stockStatus: "In Stock"
  },
  {
    name: "Project Paper",
    category: "stationery",
    price: 25,
    quantity: 60,
    description: "Project paper for assignments and presentations.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    stockStatus: "In Stock"
  },
  {
    name: "DOMS Brush Pen Set",
    category: "art-supplies",
    price: 220,
    quantity: 15,
    description: "Brush pen set for calligraphy and drawing.",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
    stockStatus: "In Stock",
    isNew: true
  },
  {
    name: "Acrylic Colour Set",
    category: "art-supplies",
    price: 180,
    quantity: 15,
    description: "Acrylic colours for painting projects.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b",
    stockStatus: "In Stock",
    isNew: true
  }
];

async function seedProducts() {
  try {
    await Product.insertMany(products);
    console.log("Products Added Successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedProducts();