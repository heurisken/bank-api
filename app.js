import express from 'express';
import mongoose from 'mongoose';
import accountRouter from './routes/accountRouter.js';

const uri = 'mongodb+srv://root:EayXjmX23yMBnjtW@cluster0.izkbi.mongodb.net/tp?retryWrites=true&w=majority';
async function connect() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    console.log('Conectado ao Mongo DB Atlas');
  } catch (error) {
    console.error({ error: error.message });
  }
}

const app = express();
app.use(express.json());
app.use('/accounts', accountRouter);

app.listen(3000, async () => {
  await connect();
  console.log('Servidor iniciado com sucesso');
});
