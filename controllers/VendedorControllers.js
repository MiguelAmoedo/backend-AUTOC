const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Vendedor = require('../models/VendedorModels');
const Peca = require('../models/PecasModels');

// Função para validar o token do vendedor
const validarToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  jwt.verify(token, 'chave_secreta_do_token', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    
    req.vendedorId = decoded.id;
    next();
  });
};

// Controller para autenticação do vendedor
const autenticarVendedor = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const vendedor = await Vendedor.findOne({ email });

    if (!vendedor) {
      return res.status(400).json({ error: 'Vendedor não encontrado.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, vendedor.senha);

    if (!senhaCorreta) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: vendedor._id }, 'chave_secreta_do_token');

    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao autenticar vendedor.' });
  }
};

// Controller para adicionar uma nova peça
const adicionarPeca = async (req, res) => {
  const { nome, marca, modelo, ano, descricao, preco, qtdEstoque, partesVeiculo } = req.body;

  try {
    const novaPeca = new Peca({
      nome,
      marca,
      modelo,
      ano,
      descricao,
      preco,
      qtdEstoque,
      partesVeiculo,
      idVendedor: req.vendedorId,
      status: 'Disponivel'
    });

    await novaPeca.save();

    res.json({ message: 'Peça adicionada com sucesso.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao adicionar peça.' });
  }
};

const getVendedorPeca = (req, res) => {
  // Obtenha o ID do vendedor autenticado a partir do token ou qualquer outra fonte de autenticação
  const vendedorId = req.userId; // Supondo que o ID do vendedor esteja armazenado em req.userId
  
  // Use o ID do vendedor para consultar o banco de dados e recuperar as peças adicionadas por ele
  // Substitua essa parte com a lógica adequada para consultar o banco de dados

  const pecas = []; // Armazene as peças encontradas aqui

  // Retorne as peças adicionadas pelo vendedor atual como resposta
  return res.json(pecas);
};

// Controller para atualizar uma peça existente
const atualizarPeca = async (req, res) => {
  const { id } = req.params;
  const { nome, marca, modelo, ano, descricao, preco, qtdEstoque, partesVeiculo } = req.body;

  try {
    const peca = await Peca.findOneAndUpdate(
      { _id: id, idVendedor: req.vendedorId },
      { nome, marca, modelo, ano, descricao, preco, qtdEstoque, partesVeiculo },
      { new: true }
    );

    if (!peca) {
      return res.status(404).json({ error: 'Peça não encontrada.' });
    }

    res.json({ message: 'Peça atualizada com sucesso.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao atualizar peça.' });
  }
};

// Controller para excluir uma peça
const excluirPeca = async (req, res) => {
  const { id } = req.params;

  try {
    const peca = await Peca.findOneAndDelete({ _id: id, idVendedor: req.vendedorId });

    if (!peca) {
      return res.status(404).json({ error: 'Peça não encontrada.' });
    }

    res.json({ message: 'Peça excluída com sucesso.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao excluir peça.' });
  }
};

const controlarEstoque = async (req, res) => {
  try {
    const vendedorId = req.vendedorId;
    const pecaId = req.params.id;
    const { qtdEstoque } = req.body;

    const peca = await Peca.findById(pecaId);
    if (!peca) {
      return res.status(404).json({ message: 'Peça não encontrada' });
    }

    if (peca.idVendedor.toString() !== vendedorId) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    peca.qtdEstoque = qtdEstoque;
    const pecaAtualizada = await peca.save();
    res.status(200).json(pecaAtualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const visualizarRelatorios = async (req, res) => {
  try {
    const vendedorId = req.vendedorId;

    const pecas = await Peca.find({ idVendedor: vendedorId });

    // Lógica para gerar os relatórios e estatísticas
    // Adaptar de acordo com as necessidades específicas
    const relatorios = {
      totalVendas: 0,
      totalPedidos: 0,
      estoque: pecas.length
    };

    res.status(200).json(relatorios);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const visualizarInformacoesPessoais = async (req, res) => {
  try {
    const vendedorId = req.vendedorId;

    const vendedor = await Vendedor.findById(vendedorId);
    if (!vendedor) {
      return res.status(404).json({ message: 'Vendedor não encontrado' });
    }

    res.status(200).json(vendedor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const atualizarInformacoesPessoais = async (req, res) => {
  try {
    const vendedorId = req.vendedorId;
    const { nome, email } = req.body;

    const vendedor = await Vendedor.findById(vendedorId);
    if (!vendedor) {
      return res.status(404).json({ message: 'Vendedor não encontrado' });
    }

    if (nome) {
      vendedor.nome = nome;
    }
    if (email) {
      vendedor.email = email;
    }

    const vendedorAtualizado = await vendedor.save();
    res.status(200).json(vendedorAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const alterarSenha = async (req, res) => {
  try {
    const vendedorId = req.vendedorId;
    const { senhaAntiga, senhaNova } = req.body;

    const vendedor = await Vendedor.findById(vendedorId);
    if (!vendedor) {
      return res.status(404).json({ message: 'Vendedor não encontrado' });
    }

    if (senhaAntiga !== vendedor.senha) {
      return res.status(401).json({ message: 'Senha antiga inválida' });
    }

    vendedor.senha = senhaNova;
    const vendedorAtualizado = await vendedor.save();
    res.status(200).json(vendedorAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const visualizarPedidos = async (req, res) => {
  try {
    const vendedorId = req.vendedorId; // ID do vendedor logado

    const pedidos = await Pedido.find({ idVendedor: vendedorId });
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const atualizarStatusPedido = async (req, res) => {
  try {
    const vendedorId = req.vendedorId; // ID do vendedor logado
    const pedidoId = req.params.id; // ID do pedido a ser atualizado
    const { status } = req.body;

    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Verificar se o vendedor é o dono do pedido
    if (pedido.idVendedor.toString() !== vendedorId) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    pedido.status = status;
    const pedidoAtualizado = await pedido.save();
    res.status(200).json(pedidoAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Outros controllers relacionados às instruções fornecidas

module.exports = {
  validarToken,
  autenticarVendedor,
  adicionarPeca,
  atualizarPeca,
  excluirPeca,
  visualizarPedidos,
  atualizarStatusPedido,
  controlarEstoque,
  visualizarRelatorios,
  visualizarInformacoesPessoais,
  atualizarInformacoesPessoais,
  alterarSenha,
  getVendedorPeca,
  // Outros controllers relacionados às instruções fornecidas
};
