require('dotenv').config();
var functions = {};
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_API
  }
});
  
functions.sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const resetLink = `https://projeto.matz.pt/create-password?token=${resetToken}`;

    const mailOptions = {
      from: '"APDIS" <slayn@matz.pt>',
      to: userEmail,
      subject: 'Pedido de Recuperação de Password',
      text: `Olá, clica no seguinte link para alterares a tua password: ${resetLink}`,
      html: `<p>Olá,</p><p>Clica no seguinte link para alterares a tua password:</p><a href="${resetLink}">Alterar Password</a>`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
};

functions.sendApprovedAssociatedEmail = async(data, token) => {
  try {
    const resetLink = `https://projeto.matz.pt/create-password?token=${token}`;
    const mailOptions = {
      from: '"APDIS" <slayn@matz.pt>',
      to: data.email,
      subject: 'Pedido de Associado',
      text: `A APDIS vem por este meio informar que o seu pedido de registo à plataforma foi aceite com sucesso. 
      \nComo tal, deve definir a sua password a partir do seguinte link: ${resetLink}
      \nEm caso de alguma dúvida, pode contactar-nos dos vários meios alternativos.
      \nCom os melhores cumprimentos,
      APDIS`,
      html: `A APDIS vem por este meio informar que o seu pedido de registo à plataforma foi aceite com sucesso. 
      \nComo tal, deve definir a sua password a partir do seguinte link: ${resetLink}
      \nEm caso de alguma dúvida, pode contactar-nos dos vários meios alternativos.
      \nCom os melhores cumprimentos,
      APDIS`,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

functions.sendRejectedAssociatedEmail = async(data) => {
  try {
    const mailOptions = {
      from: '"APDIS" <slayn@matz.pt>',
      to: data.email,
      subject: 'Pedido de Associado',
      text: `A APDIS vem por este meio informar que o seu pedido de registo à plataforma foi rejeitado. 
      \nEm caso de alguma dúvida, pode contactar-nos dos vários meios alternativos.
      \nCom os melhores cumprimentos,
      APDIS`,
      html: `A APDIS vem por este meio informar que o seu pedido de registo à plataforma foi rejeitado. 
      \nEm caso de alguma dúvida, pode contactar-nos dos vários meios alternativos.
      \nCom os melhores cumprimentos,
      APDIS`,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

functions.sendNewRegisterEmail = async(data) => {
  try {
    const mailOptions = {
      from: '"APDIS" <slayn@matz.pt>',
      to: '"APDIS" <slayn@matz.pt>',
      subject: 'Pedido de Associado',
      text: `Um novo pedido de registo foi enviado para a plataforma, foram enviados os seguintes dados:`,
      html: `Um novo pedido de registo foi enviado para a plataforma, foram enviados os seguintes dados:\n
            Dados Pessoais:\n
            Nº Associado: ${data.associado}\n
            Nome: ${data.nome}\n
            E-Mail: ${data.email}\n
            Unidade de Saúde: ${data.unidsaude}\n
            Cargo: ${data.cargo}`
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

functions.sendNewAssociatedEmail = async(data) => {
  try {
    const instituicao = (data.instituicao != undefined ? {
      instituicao: data.instituicao.instituicao,
      email: data.instituicao.email,
      endereco: data.instituicao.endereco,
      localidade: data.instituicao.localidade,
      codpostal: data.instituicao.codpostal,
      funcao: data.instituicao.funcao
    } : null);
    const pessoais = {
      nome: data.pessoal.nome,
      email: data.pessoal.emailPessoal,
      nif: data.pessoal.nif,
      endereco: data.pessoal.enderecoPessoal,
      localidade: data.pessoal.localidadePessoal,
      codpostal: data.pessoal.codPostalPessoal,
      telefone: data.pessoal.telefone,
      tipo: data.pessoal.tipo,
      habliterarias: data.pessoal.habliterarias
    }

    const instituicaoDados = (instituicao ? 
      `|\n
        Insituição: ${instituicao.instituicao} |\n
        E-Mail: ${instituicao.email} |\n
        Endereço: ${instituicao.endereco} |\n
        Localidade: ${instituicao.localidade} |\n
        Código-Postal: ${instituicao.codpostal} |\n
        Função: ${instituicao.funcao}`: "\n"
    )

    const mailOptions = {
      from: '"APDIS" <slayn@matz.pt>',
      to: '"APDIS" <slayn@matz.pt>',
      subject: 'Pedido de Associado',
      text: `Um novo pedido de associado foi enviado para a plataforma, foram enviados os seguintes dados`,
      html: `Um novo pedido de associado foi enviado para a plataforma, foram enviados os seguintes dados:\n
            Dados Pessoais:\n
            Nome: ${pessoais.nome} |\n
            E-Mail: ${pessoais.email} |\n
            NIF: ${pessoais.nif} |\n
            Endereço: ${pessoais.endereco} |\n
            Localidade: ${pessoais.localidade} |\n
            Código-Postal: ${pessoais.codpostal} |\n
            Telefone: ${pessoais.telefone} |\n
            Tipo: ${pessoais.tipo} |\n
            Habilidade Literárias: ${pessoais.habliterarias}\n
            ${instituicaoDados}`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

functions.sendAcceptedRequestEmail = async(data) => {
  try {
    const mailOptions = {
      from: '"APDIS" <slayn@matz.pt>',
      to: data.email,
      subject: 'Pedido de Documento',
      text: `A APDIS tem o prazer em informar que o pedido com a descrição ${data.description} foi concluido com sucesso por ${data.accepted}. Pode consultar o estado do mesmo no seguinte link: https://projeto.matz.pt/request?id=${data.id}`,
      html: `A APDIS tem o prazer em informar que o pedido com a descrição ${data.description} foi concluido com sucesso por ${data.accepted}. Pode consultar o estado do mesmo no seguinte link: https://projeto.matz.pt/request?id=${data.id}`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

functions.generateToken = async() => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
  
    let token = '';
  
    for (let i = 0; i < 4; i++) {
      token += letters[Math.floor(Math.random() * letters.length)];
    }
  
    for (let i = 0; i < 4; i++) {
      token += numbers[Math.floor(Math.random() * numbers.length)];
    }
  
    token = token.split('').sort(() => 0.5 - Math.random()).join('');
  
    return token;
};
  
module.exports = functions;
