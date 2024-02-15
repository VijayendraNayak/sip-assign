const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const router = express.Router();

mongoose.connect(process.env.MONGODB_URI, {
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  username: { type: String ,required:true, unique:true },
  password: { type: String, required:true },
  authorId: { type: Number, required:true, unique:true } // Change to type Number
});

const User = mongoose.model('User', userSchema);

const blogSchema = new mongoose.Schema({
  id: String,
  blogTitle: String,
  blogContent: String,
  authorID: { type: Number, required:true }, // Change to type Number
  subscribedUserId: String,
  activeSubscriber: Boolean
});

const Blog = mongoose.model('Blog', blogSchema);


app.use(express.json());

app.use('/api', router);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.userId = decodedToken.userId; 
    req.authorId = decodedToken.authorId; // Assuming the decoded token contains userId
    next();
  });
};

router.post('/register', async (req, res) => {
  try {
    const { username, password,authorId } = req.body;

    if (!username || !password ||!authorId) {
      return res.status(400).json({ error: 'Username, password and authorId are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword ,authorId});
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { username, authorId, password } = req.body;

    if ((!username && !authorId) || !password) {
      return res.status(400).json({ error: 'Username or authorId and password are required' });
    }

    let user;
    if (username) {
      user = await User.findOne({ username });
    } else if (authorId) {
      user = await User.findOne({ authorId });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or authorId or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or authorId or password' });
    }

    const accessToken = jwt.sign({ userId: user._id, authorId: user.authorId }, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



router.post('/blogs', authenticateToken, async (req, res) => {
  try {
    const { id, blogTitle, blogContent, subscribedUserId, activeSubscriber } = req.body;
    const authorID = req.authorId;
    console.log(authorID) // Get authorId from the token
    const newBlog = new Blog({ id, blogTitle, blogContent, authorID, subscribedUserId, activeSubscriber });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/blogs/:authorID', authenticateToken, async (req, res) => {
  try {
    const authorID = req.params.authorID;
    const blogs = await Blog.find({ authorID });
    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ error: 'Blogs not found for this author' });
    }
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/blogs',authenticateToken, async (req, res) => {
  try {
    const blogs = await Blog.find();
    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ error: 'No blogs found' });
    }
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
