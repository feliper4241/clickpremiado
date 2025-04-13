const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura o body parser para lidar com requisições JSON
app.use(bodyParser.json());

// Substitua pela sua string de conexão do MongoDB Atlas
const mongoURI = 'mongodb+srv://mrfeliper61:11MbdQwn2ROyOsxu@cluster0.c7ozx2q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Conecta ao MongoDB Atlas
mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch((err) => console.error('Erro ao conectar no MongoDB Atlas:', err));

// Modelo de Usuário
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Rota para cadastro de usuários
app.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Valida se os campos foram preenchidos
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }
  
  // Verifica se as senhas correspondem
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'As senhas não coincidem.' });
  }
  
  try {
    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }
    
    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Cria um novo usuário
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    res.status(500).json({ message: 'Erro ao cadastrar o usuário.' });
  }
});

// Rota para login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Valida se os campos foram preenchidos
  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }
    
    // Compara a senha digitada com a senha armazenada (criptografada)
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }
    
    res.status(200).json({ message: 'Login efetuado com sucesso.' });
  } catch (error) {
    console.error('Erro durante o login:', error);
    res.status(500).json({ message: 'Erro ao realizar login.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
