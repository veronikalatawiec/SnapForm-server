import express from "express";
import fs from "fs";
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import db from '../knexfile.js'

const router = express.Router();

// POST /users
router.post('/', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // does email exist already
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({ message: 'An account already exists with this email.' });
      }
  
      // Hash pass
      const hashedPassword = await argon2.hash(password);
  
      // add new user in table
      await db('users').insert({
        email,
        password: hashedPassword,
        created: new Date(), 
        updated: new Date(),  
      });
      const newUser = await db('users').where({ email }).first();
      // Generate their JWT
      const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_KEY, { expiresIn: '1h' });
  
      // respond w token
      res.status(201).json({ message: 'Successfully created user', token: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error registering new user' });
    }
  });

// POST /users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // find email of user
      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(400).json({ message: 'Invalid email' });
      }
  
      // password verif
      const validPassword = await argon2.verify(user.password, password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid password' });
      }
  
      // generate jwt
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY, { expiresIn: '1h' });
  
      // return token
      res.status(201).json({ message: 'Successfully signed in', token: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during user login' });
    }
  });

export default router;