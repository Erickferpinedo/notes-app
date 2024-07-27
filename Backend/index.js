 require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.models");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");


app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({data: "hello World"});
});

//Backend Ready

//Create Account
app.post("/create-account", async (req, res) => {

  const { fullName, email, password } = req.body;

  if(!fullName) {
    return res
    .status(400)
    .json({error: true, message: "Full Name is required"});
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is Required"});
  }

  if (!password) {
    return res
    .status(400)
    .json({ error: true, message: "Password is required"});
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({
      error: true,
      message: "User already exist",
    });
  }

  const user = new User({
    fullName,
    email,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });
  
  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successful",
  });
});

//Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    console.log("Login attempt without email");
    return res.status(400).json({ message: "Email is required" });
  } 

  if (!password) {
    console.log("Login attempt without password");
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const userInfo = await User.findOne({ email: email });

    if (!userInfo) {
      console.log("No user found with email:", email);
      return res.status(400).json({ message: "User not found" });
    }

// console.log("userEmail: " + userInfo.email )
// console.log("userPassword: " + userInfo.password )

    if (userInfo.email === email && userInfo.password === password) {
      const user = { user: userInfo };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m",
      });
      console.log("Login successful for user:", email);
      return res.json({
        error: false,
        message: "Login Successful",
        email,
        accessToken,
      });
    } else {
      console.log("Invalid credentials for user:", email);
      return res.status(400).json({
        error: true,
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    console.error("Error during login process:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});


//get user
app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
      return res.sendStatus(401);
    }

    return res.json({
      user: {
fullName: isUser.fullName,
email: isUser.email,
_id: isUser._id,
createdOn: isUser.createdOn,
      },
      message: "",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

  
//add-note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res.status(400).json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Error adding note:", error); // Log the actual error
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
const noteId = req.params.noteId;
const { title, content, tags, isArchived } = req.body;
const { user } = req.user;

if (!title && !content && !tags) {
  return res
  .status(400)
  .json({ error: true, message: "no changes provided"});
}

try {
  const note = await Note.findOne({ _id: noteId, userId: user._id });
 if (!note) {
  return res.status(404).json({ error: true, message: " Note not found"});
 }

 if (title) note.title = title;
 if (content) note.content = title;
 if (tags) note.tags = title;
 if (isArchived) note.isArchived = title;

 await note.save();

 return res.json({
error: false,
note,
message: "Note updated successfully"
 });

} catch (error) {
  return res.status(500).json({error: true,
     message: "Internal Server error"
    });
  }
});

//get all notes
app.get("/get-all-notes/", authenticateToken, async (req, res) => {
const { user } = req.user;

try {
  const notes = await Note.find({ userId: user._id});

  return res.json({
    error: false,
    notes,
    message: "All notes retrieved succesfully"
  });
} catch (error) {
  return res.status(500).json({
    error: true,
    message: "internal server error"
    });
   }
});

// delete notes
app.delete("/delete-notes/:noteId", authenticateToken, async (req, res) => {
const noteId = req.params.noteId;
const { user } = req.user;

try {
  const note = await Note.findOne({ _id: noteId, userId: user._id});

  if (!note) {
    return res.status(404).json({ error: true, message: "Note not Found"});
  }

  await Note.deleteOne({ _id: noteId, userId: user._id});

  return res.json({
error: false,
message: "Note deleted succesfully"
  });
} catch(error) {
  return res.status(500).json ({
error: true, 
message: "Internal server error"
  });
}
});

//update notes value
app.put("/archive-notes/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isArchived } = req.body;
  const { user } = req.user;
  
  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

   if (!note) {
    return res.status(404).json({ error: true, message: " Note not found"});
   }
  
  note.isArchived = isArchived;
  
   await note.save();
  
   return res.json({
  error: false,
  note,
  message: "Note updated successfully"
   });
  
  } catch (error) {
    return res.status(500).json({error: true,
       message: "Internal Server error"
      });
    }


});

//Get archived notes

// Get archived notes
app.get("/get-archived-notes/", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    // Find notes that are archived
    const archivedNotes = await Note.find({ userId: user._id, isArchived: true });

    return res.json({
      error: false,
      notes: archivedNotes,
      message: "Archived notes retrieved successfully"
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      error: true,
      message: "Internal Server Error"
    });
  }
});


//archive-note
app.put("/archive-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;
  const { isArchived } = req.body;

  try {
    // Find the note based on noteId and userId
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    // Check if note exists
    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found or you don't have permission to modify it",
      });
    }

    // Update the note status
    note.isArchived = isArchived;

    // Save the updated note
    await note.save();

    // Respond with success
    return res.json({
      error: false,
      note,
      message: "Note archived successfully",
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Search Notes

app.get("/search-notes/", authenticateToken, async (req, res) => {
const { user } = req.user;
const { query } = req.query;

if(!query) {
  return res
  .status(400)
  .json({ error: true, message: "search query is required"});
}

try {
 const matchingNotes = await Note.find({
  userId: user._id,
  $or: [
    { title: {$regex: new RegExp(query, "i")}},
    { content: { $regex: new RegExp(query, "i")}},
  ],
 });

 return res.json({
  error: false,
  notes: matchingNotes,
  message: "Notes matching the search query retrieved successfully"
 });


} catch (error) {
  return res.status(500).json({
    error:true,
    message: "Internal Server error",
  });
  }
});




app.listen(3001);

module.exports = app;