import bcrypt from "bcryptjs";
import { Country, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { name: "Nick Fury", role: Role.ADMIN, country: null, email: "nick@slooze.com", password: "password123" },
  {
    name: "Captain Marvel",
    role: Role.MANAGER,
    country: Country.INDIA,
    email: "marvel@slooze.com",
    password: "password123",
  },
  {
    name: "Captain America",
    role: Role.MANAGER,
    country: Country.AMERICA,
    email: "america@slooze.com",
    password: "password123",
  },
  { name: "Thanos", role: Role.MEMBER, country: Country.INDIA, email: "thanos@slooze.com", password: "password123" },
  { name: "Thor", role: Role.MEMBER, country: Country.INDIA, email: "thor@slooze.com", password: "password123" },
  { name: "Travis", role: Role.MEMBER, country: Country.AMERICA, email: "travis@slooze.com", password: "password123" },
];

const restaurants = [
  {
    name: "Spice Harbor",
    cuisine: "North Indian",
    country: Country.INDIA,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    items: [
      { name: "Paneer Tikka", description: "Char-grilled cottage cheese cubes with smoky spices.", price: 8.5, category: "veg" },
      { name: "Butter Chicken", description: "Creamy tomato gravy with tandoori chicken.", price: 11.2, category: "non-veg" },
      { name: "Dal Makhani", description: "Slow-cooked black lentils with butter.", price: 7.1, category: "veg" },
      { name: "Masala Chaas", description: "Spiced buttermilk with mint and cumin.", price: 3.2, category: "beverage" },
      { name: "Jeera Rice", description: "Fragrant basmati rice tossed with cumin.", price: 4.8, category: "veg" },
    ],
  },
  {
    name: "Coastal Curry House",
    cuisine: "South Indian",
    country: Country.INDIA,
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de",
    items: [
      { name: "Ghee Roast Dosa", description: "Crispy dosa layered with aromatic ghee.", price: 6.2, category: "veg" },
      { name: "Mangalorean Prawn Curry", description: "Tangy coconut curry with prawns.", price: 12.4, category: "non-veg" },
      { name: "Lemon Rasam", description: "Peppery lentil broth with citrus notes.", price: 4.1, category: "veg" },
      { name: "Filter Coffee", description: "Strong South Indian brewed coffee.", price: 2.7, category: "beverage" },
      { name: "Curd Rice", description: "Comforting rice mixed with yogurt and tempering.", price: 4.9, category: "veg" },
    ],
  },
  {
    name: "Biryani Boulevard",
    cuisine: "Hyderabadi",
    country: Country.INDIA,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    items: [
      { name: "Hyderabadi Chicken Biryani", description: "Dum-cooked rice with saffron and chicken.", price: 13.5, category: "non-veg" },
      { name: "Veg Dum Biryani", description: "Layered biryani with vegetables and fried onions.", price: 10.1, category: "veg" },
      { name: "Mirchi Ka Salan", description: "Spicy peanut and sesame curry.", price: 5.4, category: "veg" },
      { name: "Double Ka Meetha", description: "Bread pudding with nuts and saffron.", price: 4.6, category: "veg" },
      { name: "Rose Lassi", description: "Chilled yogurt drink flavored with rose.", price: 3.4, category: "beverage" },
    ],
  },
  {
    name: "Maple Grill",
    cuisine: "American",
    country: Country.AMERICA,
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    items: [
      { name: "Classic Cheeseburger", description: "Beef patty with cheddar and house sauce.", price: 12.9, category: "non-veg" },
      { name: "BBQ Chicken Wings", description: "Sticky smoked wings with BBQ glaze.", price: 10.6, category: "non-veg" },
      { name: "Loaded Fries", description: "Fries with cheese sauce, jalapenos, and herbs.", price: 7.2, category: "veg" },
      { name: "Coleslaw Bowl", description: "Crunchy slaw with citrus dressing.", price: 4.5, category: "veg" },
      { name: "Iced Tea", description: "Brewed black tea with lemon.", price: 3.1, category: "beverage" },
    ],
  },
  {
    name: "Pacific Bowl Co.",
    cuisine: "Californian",
    country: Country.AMERICA,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    items: [
      { name: "Grilled Salmon Bowl", description: "Salmon with quinoa, kale, and citrus dressing.", price: 14.3, category: "non-veg" },
      { name: "Avocado Toast Plate", description: "Sourdough toast topped with smashed avocado.", price: 9.4, category: "veg" },
      { name: "Turkey Club Wrap", description: "Roasted turkey wrap with greens and aioli.", price: 11.1, category: "non-veg" },
      { name: "Kombucha Citrus", description: "Sparkling fermented tea with citrus.", price: 4.9, category: "beverage" },
      { name: "Chickpea Crunch Salad", description: "Herbed chickpeas with roasted veggies.", price: 8.8, category: "veg" },
    ],
  },
  {
    name: "Liberty Pizza Works",
    cuisine: "Italian-American",
    country: Country.AMERICA,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    items: [
      { name: "Pepperoni Slice", description: "Stone-baked slice with pepperoni and mozzarella.", price: 5.1, category: "non-veg" },
      { name: "Margherita Pizza", description: "San Marzano tomato, basil, and mozzarella.", price: 13.2, category: "veg" },
      { name: "Garlic Knots", description: "Soft knots brushed with garlic butter.", price: 6.0, category: "veg" },
      { name: "Chicken Alfredo Pasta", description: "Creamy alfredo tossed with grilled chicken.", price: 12.7, category: "non-veg" },
      { name: "Sparkling Lemonade", description: "Fresh lemonade topped with soda.", price: 3.8, category: "beverage" },
    ],
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  for (const user of users) {
    const password = await bcrypt.hash(user.password, 10);
    await prisma.user.create({ data: { ...user, password } });
  }

  for (const restaurant of restaurants) {
    const { items, ...restaurantData } = restaurant;
    await prisma.restaurant.create({
      data: {
        ...restaurantData,
        items: {
          create: items,
        },
      },
    });
  }

  console.log("Seeded users, restaurants, and menu items.");
}

main()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
