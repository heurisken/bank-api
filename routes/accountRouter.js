import express from 'express';
import { accountModel } from '../models/accountModel.js';
import { deposito, saque, transferencia } from './accountHelpers.js';

const router = express.Router();

// RETRIEVE
router.get('/all', async (req, res, next) => {
  const accounts = await accountModel.find({});
  res.send({ accounts: accounts });
});

// Novo Cliente
router.post('/novocliente', async (req, res, next) => {
  const { agencia, conta } = req.body;
  try {
    // Impedir a inserção de contas duplicadas.
    const jaExiste = await accountModel.findOne({ $and: [{ agencia: agencia }, { conta: conta }] });
    if (!!jaExiste) {
      throw new Error('A cononta já existe.');
    }

    const account = new accountModel(req.body);
    await account.save(); // se já existir , ele atualiza apenas.

    res.send({ account: account });
  } catch (error) {
    next(error);
  }
});

// Depósito
router.patch('/deposito', async (req, res, next) => {
  try {
    const account = await deposito(req.body);
    res.send(account);
  } catch (error) {
    next(error);
  }
});

// Saque
router.patch('/saque', async (req, res, next) => {
  const tarifa = 1;
  try {
    const account = await saque(req.body, tarifa);
    res.send(account);
  } catch (error) {
    next(error);
  }
});

// Saldo
router.get('/saldo', async (req, res, next) => {
  const { agencia, conta } = req.body;
  try {
    const account = await accountModel.findOne({ $and: [{ agencia: agencia }, { conta: conta }] }, { _id: 0, __v: 0 });

    if (!account) {
      throw new Error('Conta não encontrada!');
    }

    res.send(account);
  } catch (error) {
    next(error);
  }
});

// Delete
router.delete('/delete', async (req, res, next) => {
  const { agencia, conta } = req.body;
  try {
    const account = await accountModel.findOneAndDelete({ $and: [{ agencia: agencia }, { conta: conta }] });
    const qtdDocsAfterDelete = await accountModel.countDocuments();

    const resposta = { account, qtdDocsAfterDelete };
    // Retorna o documento deletado
    if (!account) {
      throw new Error('Conta não encontrada!');
    }

    res.send(resposta);
  } catch (error) {
    next(error);
  }
});

// Transferência
router.patch('/transferencia', async (req, res, next) => {
  const tarifa = 8;
  try {
    const transf = await transferencia(req.body, tarifa);
    res.send(transf);
  } catch (error) {
    next(error);
  }
});

router.get('/saldomedio/:agencia', async (req, res, next) => {
  try {
    const agencia = parseInt(req.params.agencia);

    const agg = [
      {
        $match: {
          agencia: agencia,
        },
      },
      {
        $group: {
          _id: {
            agencia: '$agencia',
          },
          saldoMedio: {
            $avg: '$balance',
          },
        },
      },
    ];

    const saldoMedio = await accountModel.aggregate(agg);
    res.send(saldoMedio);
  } catch (error) {
    next(error);
  }
});

router.get('/ordenarporsaldo', async (req, res, next) => {
  try {
    const filter = {};
    const sort = {
      balance: req.body.ordem,
    };
    const limit = req.body.limite;
    const projections = { _id: 0, balance: 1, agencia: 1, conta: 1, name: 1 };

    const resposta = await accountModel.find(filter, projections).sort(sort).limit(limit);
    res.send(resposta);
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  //global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  console.log('Tratador de erros : \n' + err.message);
  res.status(400).send({ error: err.message });
});

export default router;
