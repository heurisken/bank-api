import { accountModel } from '../models/accountModel.js';

async function saque(req, tarifa) {
  const { agencia, conta, valor } = req;

  if (valor < 0) {
    throw new Error('Valor negativo não permitido!');
  }
  // const account = await accountModel.findOne({ $and: [{ agencia: agencia }, { conta: conta }] });
  const account = await contaExiste({ agencia, conta });
  if (!account) {
    throw new Error(`Conta ${agencia} - ${conta} não econtrada!`);
  }
  if (account.balance < valor + tarifa) {
    throw new Error('Saldo insuficiente!');
  }

  account.balance -= valor + tarifa;
  await account.save();
  return account;
}

async function deposito(req) {
  const { agencia, conta, valor } = req;
  if (valor < 0) {
    throw new Error('Valor não pode ser negativo!');
  }

  // https://mongoosejs.com/docs/tutorials/findoneandupdate.html
  const account = await accountModel.findOneAndUpdate(
    { $and: [{ agencia: agencia }, { conta: conta }] },
    { $inc: { balance: valor } },
    { new: true }
  );

  // É vazio?
  if (!account) {
    throw new Error(`A conta ${agencia} - ${conta} não foi encontrada!`);
  }
  return account;
}

async function transferencia(req, tarifa) {
  const { valor, from, to } = req;
  console.log(valor);
  console.log(from);
  console.log(to);

  let accountFrom = await contaExiste(from);
  if (!accountFrom) {
    throw new Error(`A conta ${from.agencia} - ${from.conta} não existe!`);
  }

  let accountTo = await contaExiste(to);
  if (!accountTo) {
    throw new Error(`A conta ${to.agencia} - ${to.conta} não existe!`);
  }
  accountFrom = await saque({ ...from, valor }, tarifa);
  accountTo = await deposito({ ...to, valor });
  return { accountFrom, accountTo };
}

async function contaExiste(filter = { $and: [{ agencia: agencia }, { conta: conta }] }) {
  return await accountModel.findOne(filter);
}

export { saque, deposito, transferencia };
