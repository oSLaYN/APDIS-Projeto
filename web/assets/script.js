async function validSession() {
    try {
        const authorized = await fetch("/api/auth/isAuthorized", { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' }});
        const userData = await authorized.json();
        return userData;
    } catch (error) {
        console.error(error);
        return Error(error);
    }
}

const paths = ["/login", "/register", "/recover-password", "/create-password"]
function InThatPage(gotPath) {
    return paths.includes(gotPath);
}

async function CheckSession() {
    const user = await validSession();
    if (!user) {
        if (!InThatPage(window.location.pathname)) {
            const messageBox = document.getElementById("message");
            if (messageBox) {
                messageBox.textContent = "Sem Sessão Iniciada! A Redirecionar...";
                messageBox.style.color = '#e74c3c';
                messageBox.style.backgroundColor = '#fde8e8';
            }
        
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        }
    } else {
        if (InThatPage(window.location.pathname)) {
            console.log("Im In That Page");
            window.location.href = "/";
        }
    }
}

async function CheckAdminSession() {
    const user = await validSession();
    const admin = (user ? (user.type == "admin" || user.type == "superadmin") : false)
    if (!user || !admin) {
        const messageBox = document.getElementById("message");
        if (messageBox) {
            messageBox.textContent = "Sem Acesso! A Redirecionar...";
            messageBox.style.color = '#e74c3c';
            messageBox.style.backgroundColor = '#fde8e8';
        }

        setTimeout(() => {
            window.location.href = "/";
        }, 1500);
    }
}

async function toggleDadosInstituicao() {
    const conteudo = document.getElementById("conteudoInstituicao");
    const divInstituicao = document.querySelector(".dadosinstiuicao");
    const textInstituicao = document.getElementById("dadosinstiuicao");

    // Alterna a visibilidade do conteúdo
    if (conteudo.style.display === "none" || conteudo.style.display === "") {
        conteudo.style.display = "block";
        divInstituicao.classList.add("visible"); // Adiciona a classe "visible"
        textInstituicao.textContent = "▼";
    } else {
        conteudo.style.display = "none";
        divInstituicao.classList.remove("visible"); // Remove a classe "visible"
        textInstituicao.textContent = "▶";
    }
}

function handleSearch() {
    const searchInput = document.querySelector('.search-box');
    const searchTerm = searchInput.value.toLowerCase().trim(); // Remove espaços extras
    const posts = document.querySelectorAll('.post');
    
    posts.forEach(post => {
        const descriptions = post.querySelectorAll('p');
        let hasMatchInDescription = false;
        descriptions.forEach(desc => { if (desc.textContent.toLowerCase().includes(searchTerm)) hasMatchInDescription = true; });
        let hasMatchInDocumentData = false;
        const documentDataStr = post.getAttribute('documentData');
        if (documentDataStr) {
            // Transforma todo o texto do documentData em mínusculas para melhor pesquisa
            const normalizedDocData = documentDataStr.toLowerCase().replace(/[.,;]/g, ''); // Remove pontos, vírgulas ou ponto-e-vírgula
            // Transforma todo o texto da pesquisa em mínusculas para comparar com o documentData
            const normalizedSearchTerm = searchTerm.toLowerCase().replace(/[.,;]/g, '');
            // Comparação da pesquisa com a informação no documentData
            const docDataTokens = normalizedDocData.split(/\s+/);
            const searchTokens = normalizedSearchTerm.split(/\s+/);
            // Verifica se TODOS os termos da pesquisa existem no texto do documentData (em qualquer ordem)
            hasMatchInDocumentData = searchTokens.every(token => docDataTokens.some(docToken => docToken.includes(token)))
        }
        post.style.display = (hasMatchInDescription || hasMatchInDocumentData) ? 'block' : 'none';
    });
}

async function uploadFile(pedidoId) {
    const fileInput = document.getElementById(`fileInput-${pedidoId}`);
    const statusDiv = document.getElementById(`uploadStatus-${pedidoId}`);
    
    if (!fileInput.files.length) {
        statusDiv.innerHTML = '<p class="error">Por favor, selecione um ficheiro</p>';
        return;
    }

    try {
        statusDiv.innerHTML = '<p class="loading">A enviar ficheiro...</p>';

        const formData = new FormData();
        formData.append('id', pedidoId);
        formData.append('file', fileInput.files[0]);
        
        const response = await fetch('/api/documents/acceptRequest', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const result = await response.json();
        
        if (response.ok) {
            statusDiv.innerHTML = `<p class="success">${result.message}</p>`;
            setTimeout(() => location.reload(), 1500);
        } else {
            statusDiv.innerHTML = `<p class="error">${result.error || 'Erro no upload'}</p>`;
        }
    } catch (error) {
        statusDiv.innerHTML = `<p class="error">Falha na conexão: ${error.message}</p>`;
    }
}


async function downloadFile(pedidoId) {
    try {
        const downloadUrl = `/api/documents/downloadRequest?id=${pedidoId}`;
        const response = await fetch(downloadUrl, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Download falhou');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Extrair nome do ficheiro do cabeçalho
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || `documento_${pedidoId}`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
    } catch (error) {
        alert(`${error.message}`);
        console.error(`Falha na conexão: ${error.message}`);
    }
}
