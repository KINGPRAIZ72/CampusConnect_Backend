// promoteUserToAdmin.js
import mongoose from "mongoose";

// Replace with your Atlas URI
const MONGO_URI = 'mongodb+srv://praiseoghuma72:vcPhOWQbr2PBLJGn@cccluster.ovdggkn.mongodb.net/?retryWrites=true&w=majority&appName=ccCluster';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Connection error:', err));

// Match your User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  registration_number: { type: String, unique: true, required: true },
  phone_number: String,
  gender: String,
  department: String,
  level: String,
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function promoteToAdmin(email) {
    try {
        const user = await User.findOne({ email });
        if (!user) return console.log(`User with email ${email} not found.`);
        user.role = 'admin';
        await user.save();
        console.log(`✅ User ${email} has been promoted to admin.`);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

// Replace with the user's email
promoteToAdmin('praiseoghuma312@gmail.com');