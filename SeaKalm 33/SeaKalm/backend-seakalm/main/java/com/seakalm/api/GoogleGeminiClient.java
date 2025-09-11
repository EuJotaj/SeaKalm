package com.seakalm.api;

import okhttp3.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class GoogleGeminiClient {

    @Value("${google.gemini.api-key}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    public String getChatResponse(String prompt) throws IOException {
        // Endpoint da API do Gemini Pro
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;

        // Monta o corpo da requisição JSON
        String jsonBody = new JSONObject()
                .put("contents", new JSONObject[] {
                        new JSONObject().put("parts", new JSONObject[] {
                                new JSONObject().put("text", prompt)
                        })
                }).toString();

        RequestBody body = RequestBody.create(jsonBody, JSON);

        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Erro na API do Gemini: " + response.body().string());
            }

            // Extrai o texto da resposta JSON
            JSONObject responseJson = new JSONObject(response.body().string());
            return responseJson.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");
        }
    }
}