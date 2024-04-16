import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, latlng, rating, ratingCounts, numberOfRaters, comments } = req.body;

    if( !name || !latlng || !rating || !ratingCounts || !numberOfRaters || !comments ) {
      return res.status(400).send({ message: 'Send all required fields' });
    }

    const newMarker = { name, latlng, rating, ratingCounts, numberOfRaters, comments };
    const docRef = await addDoc(collection(db, 'markers'), newMarker);
    res.status(201).send({ id: docRef.id, ...newMarker });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

export default router;