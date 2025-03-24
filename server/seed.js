import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Post from "./models/Post.js";

dotenv.config();

const connectDB = async () => {
  console.log("🔗 Connecting to:", process.env.MONGO_URL);

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Post.deleteMany();

    const users = await User.create([
      {
        firstName: "James",
        lastName: "Smith",
        username: "james_smith",
        email: "james.smith@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/james.jpg",
        origin: "New York, USA",
        currentLocation: "Los Angeles, USA",
        birthDate: new Date("1990-05-15"),
        gender: "Male",
        maritalStatus: "Single",
        education: "Bachelor's in Computer Science",
        work: "Software Engineer",
      },
      {
        firstName: "Mary",
        lastName: "Johnson",
        username: "mary_johnson",
        email: "mary.johnson@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/mary.jpg",
        origin: "Chicago, USA",
        currentLocation: "San Francisco, USA",
        birthDate: new Date("1988-08-22"),
        gender: "Female",
        maritalStatus: "Married",
        education: "Master's in Business Administration",
        work: "Marketing Manager",
      },
      {
        firstName: "Robert",
        lastName: "Williams",
        username: "robert_williams",
        email: "robert.williams@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/robert.jpg",
        origin: "Houston, USA",
        currentLocation: "Dallas, USA",
        birthDate: new Date("1995-03-10"),
        gender: "Male",
        maritalStatus: "Single",
        education: "Bachelor's in Mechanical Engineering",
        work: "Mechanical Engineer",
      },
      {
        firstName: "Linda",
        lastName: "Brown",
        username: "linda_brown",
        email: "linda.brown@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/linda.jpg",
        origin: "Miami, USA",
        currentLocation: "New York, USA",
        birthDate: new Date("1987-12-05"),
        gender: "Female",
        maritalStatus: "In a relationship",
        education: "PhD in Psychology",
        work: "Clinical Psychologist",
      },
      {
        firstName: "Michael",
        lastName: "Jones",
        username: "michael_jones",
        email: "michael.jones@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/michael.jpg",
        origin: "Seattle, USA",
        currentLocation: "Chicago, USA",
        birthDate: new Date("1992-07-18"),
        gender: "Male",
        maritalStatus: "Single",
        education: "Bachelor's in Graphic Design",
        work: "UI/UX Designer",
      },
      {
        firstName: "Patricia",
        lastName: "Garcia",
        username: "patricia_garcia",
        email: "patricia.garcia@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/patricia.jpg",
        origin: "San Diego, USA",
        currentLocation: "Austin, USA",
        birthDate: new Date("1985-09-30"),
        gender: "Female",
        maritalStatus: "Married",
        education: "Master's in Education",
        work: "High School Teacher",
      },
      {
        firstName: "David",
        lastName: "Martinez",
        username: "david_martinez",
        email: "david.martinez@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/david.jpg",
        origin: "Boston, USA",
        currentLocation: "Washington, USA",
        birthDate: new Date("1998-02-14"),
        gender: "Male",
        maritalStatus: "Single",
        education: "Bachelor's in Finance",
        work: "Financial Analyst",
      },
      {
        firstName: "Jennifer",
        lastName: "Hernandez",
        username: "jennifer_hernandez",
        email: "jennifer.hernandez@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/jennifer.jpg",
        origin: "Denver, USA",
        currentLocation: "San Jose, USA",
        birthDate: new Date("1993-11-25"),
        gender: "Female",
        maritalStatus: "Divorced",
        education: "Bachelor's in Journalism",
        work: "News Reporter",
      },
      {
        firstName: "William",
        lastName: "Lopez",
        username: "william_lopez",
        email: "william.lopez@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/william.jpg",
        origin: "Las Vegas, USA",
        currentLocation: "Phoenix, USA",
        birthDate: new Date("1990-04-02"),
        gender: "Male",
        maritalStatus: "Married",
        education: "Master's in Computer Science",
        work: "Cybersecurity Expert",
      },
      {
        firstName: "Elizabeth",
        lastName: "Wilson",
        username: "elizabeth_wilson",
        email: "elizabeth.wilson@example.com",
        password: "hashedpassword",
        profilePicture: "/images/users/elizabeth.jpg",
        origin: "Philadelphia, USA",
        currentLocation: "Orlando, USA",
        birthDate: new Date("1989-06-28"),
        gender: "Female",
        maritalStatus: "Widowed",
        education: "Bachelor's in Nursing",
        work: "Registered Nurse",
      },
    ]);

    users[0].following.push(users[1]._id, users[2]._id);
    users[1].following.push(users[3]._id, users[4]._id);
    users[2].following.push(users[5]._id, users[6]._id);
    users[3].following.push(users[7]._id, users[8]._id);
    users[4].following.push(users[9]._id, users[0]._id);
    users[5].following.push(users[2]._id, users[3]._id);
    users[6].following.push(users[4]._id, users[5]._id);
    users[7].following.push(users[6]._id, users[7]._id);
    users[8].following.push(users[8]._id, users[9]._id);
    users[9].following.push(users[0]._id, users[1]._id);

    await Promise.all(users.map((user) => user.save()));

    const posts = await Post.create([
      {
        content: "This is my first post!",
        author: users[0]._id,
        likes: [users[1]._id, users[2]._id, users[3]._id],
        comments: [
          { content: "Great start!", commentUserId: users[1]._id },
          {
            content: "Looking forward to more posts!",
            commentUserId: users[2]._id,
          },
        ],
      },
      {
        content: "Loving the sunny weather today!",
        author: users[1]._id,
        likes: [users[3]._id, users[4]._id, users[5]._id],
        comments: [
          { content: "Enjoy the sun!", commentUserId: users[4]._id },
          { content: "I wish I was there!", commentUserId: users[5]._id },
        ],
      },
      {
        content: "Just finished a great book!",
        author: users[2]._id,
        likes: [users[6]._id, users[7]._id],
        comments: [
          { content: "What book was it?", commentUserId: users[6]._id },
          { content: "I love reading too!", commentUserId: users[7]._id },
        ],
      },
      {
        content: "Excited for the weekend!",
        author: users[3]._id,
        likes: [users[8]._id, users[9]._id],
        comments: [
          { content: "Me too! Any plans?", commentUserId: users[8]._id },
        ],
      },
      {
        content: "Had a fantastic dinner last night!",
        author: users[4]._id,
        likes: [users[0]._id, users[2]._id],
        comments: [
          { content: "What did you eat?", commentUserId: users[0]._id },
        ],
      },
      {
        content: "Can't wait for the concert next week!",
        author: users[5]._id,
        likes: [users[3]._id, users[5]._id, users[6]._id],
        comments: [
          { content: "Who's performing?", commentUserId: users[6]._id },
          { content: "Enjoy the show!", commentUserId: users[3]._id },
        ],
      },
      {
        content: "Feeling grateful for my friends!",
        author: users[6]._id,
        likes: [users[7]._id, users[8]._id],
        comments: [
          { content: "Friends are the best!", commentUserId: users[7]._id },
        ],
      },
      {
        content: "Started a new workout routine!",
        author: users[7]._id,
        likes: [users[1]._id, users[9]._id],
        comments: [
          { content: "Good luck! Stay strong!", commentUserId: users[9]._id },
        ],
      },
      {
        content: "Trying out a new recipe!",
        author: users[8]._id,
        likes: [users[0]._id, users[4]._id],
        comments: [
          { content: "Share the recipe!", commentUserId: users[4]._id },
        ],
      },
      {
        content: "Just got back from a trip to the beach!",
        author: users[9]._id,
        likes: [users[2]._id, users[5]._id],
        comments: [
          { content: "That sounds amazing!", commentUserId: users[2]._id },
        ],
      },
    ]);

    console.log("Data Seeded Successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error Seeding Data:", error);
    mongoose.connection.close();
  }
};

seedData();
