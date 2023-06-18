const express = require('express');
const router = express.Router();
const {
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
  getVendedorPecas,
  getVendedorById,
  relatorioVendasVendedor

  // Outros controladores relacionados às instruções fornecidas
} = require('../controllers/VendedorControllers');
const pecasController = require('../controllers/PecasControllers');

// Rota para autenticação do vendedor
router.post('/login', autenticarVendedor);
router.get('/:id', getVendedorById);
router.get('/relatoriovendas/:id', relatorioVendasVendedor);


// Middleware para validar o token do vendedor
router.use(validarToken);

// Rotas para gerenciamento de peças
// Rota para obter as peças adicionadas pelo vendedor atual

router.get('/pecas/:id', getVendedorPecas);
router.post('/pecas', adicionarPeca);
router.put('/pecas/:id', atualizarPeca);
router.delete('/pecas/:id', excluirPeca);
// Outras rotas relacionadas ao gerenciamento de peças
// Outras rotas relacionadas ao gerenciamento de peças

// Rota para visualizar os pedidos do vendedor
router.get('/pedidos', visualizarPedidos);

// Rota para atualizar o status de um pedido
router.put('/pedidos/:id', atualizarStatusPedido);

// Rota para controlar o estoque de uma peça

router.get('/estoque/:id', controlarEstoque); //altera estoque

// Rota para visualizar os relatórios
router.get('/relatorios', visualizarRelatorios);

// Rota para visualizar as informações pessoais do vendedor
router.get('/informacoes', visualizarInformacoesPessoais);

// Rota para atualizar as informações pessoais do vendedor
router.put('/informacoes', atualizarInformacoesPessoais);

// Rota para alterar a senha do vendedor
router.put('/senha', alterarSenha);

module.exports = router;
