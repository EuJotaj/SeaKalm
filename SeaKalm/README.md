# SeaKalm

Frontend estático para o projeto **SeaKalm** — histórias e experiência focada em acalmar e tranquilizar.

## O que há neste repositório

- **`SeaKalm/frontend-seakalm/`** — páginas HTML, CSS e JavaScript do site.

Não há código de servidor neste repositório. Chaves de API, senhas de base de dados e outros segredos **não** devem ser commitados; use variáveis de ambiente ou ficheiros locais ignorados pelo Git (ver `.gitignore`).

## Como abrir o projeto

1. Servir os ficheiros com um servidor HTTP local (recomendado), por exemplo na pasta `SeaKalm/frontend-seakalm/src`:

   ```bash
   npx --yes serve SeaKalm/frontend-seakalm/src
   ```

   Ou use a extensão “Live Server” no VS Code / Cursor apontando para `index.html`.

2. Abrir `SeaKalm/frontend-seakalm/src/index.html` diretamente no navegador também funciona para navegação básica, mas alguns recursos podem comportar-se melhor com um servidor local.

## API e backend

O JavaScript referencia uma API em `http://localhost:8080/api` (login, histórias, chat, etc.). Sem um backend a correr nesse endereço, essas funcionalidades não estarão disponíveis. Para apontar para outro URL, ajuste a constante `API_URL` nos ficheiros em `SeaKalm/frontend-seakalm/src/js/`.

## Licença

Defina a licença do projeto aqui, se aplicável.
