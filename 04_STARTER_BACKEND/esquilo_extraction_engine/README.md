# Motor de extração assistida

Serviço HTTP separado para extração canônica de carteira a partir de PDF, imagem, DOCX ou texto já extraído.

## Endpoints
- `GET /v1/health`
- `POST /v1/extraction/parse`

## Estratégia
1. tenta regra simples quando há texto extraído
2. se a regra não fecha com confiança alta, chama OpenAI
3. se OpenAI falhar ou devolver resposta inválida, usa Gemini
4. salva request bruto e payload normalizado para auditoria

## Input esperado
```json
{
  "fileName": "carteira_xp.pdf",
  "mimeType": "application/pdf",
  "extractedText": "...opcional...",
  "fileBase64": "...opcional...",
  "documentId": "...opcional..."
}
```

## Observações
- OpenAI entra primeiro para texto e imagem.
- Binário sem texto extraído e não-imagem tende a cair no fallback Gemini por capacidade.
- O serviço não commita nada na carteira. Ele só devolve payload canônico para a camada de preview/import.
