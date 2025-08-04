 import mongoose from 'mongoose';
     import dotenv from 'dotenv';
     dotenv.config();

     const { MONGO_USER, MONGO_PASS, MONGO_CLUSTER, MONGO_DB } = process.env;
     const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_CLUSTER}/${MONGO_DB}?retryWrites=true&w=majority`;

     export const connectDB = async () => {
       try {
         await mongoose.connect(uri);
         console.log('DB CONNECTED');
       } catch (err) {
         console.error('DB CONNECTION ERROR:', err);
       }
     };


// mongodb+srv://rojamahendiran825:aifVfNaH9k4pUp07@cluster0.tfg1vfo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
