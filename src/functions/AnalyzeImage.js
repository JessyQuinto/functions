const { app } = require('@azure/functions');
const { ComputerVisionClient } = require('@azure/ai-computer-vision');
const { AzureKeyCredential } = require('@azure/core-auth');

// Leer las claves y el endpoint desde las variables de entorno
const cognitiveServiceKey = process.env.COGNITIVE_KEY;
const cognitiveServiceEndpoint = process.env.COGNITIVE_ENDPOINT;

// Crear cliente de Azure Computer Vision
const client = new ComputerVisionClient(
    cognitiveServiceEndpoint,
    new AzureKeyCredential(cognitiveServiceKey)
);

app.http('AnalyzeImage', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            // Leer el cuerpo de la solicitud
            const body = await request.json();
            const imageUrl = body?.imageUrl;

            if (!imageUrl) {
                return {
                    status: 400,
                    body: "Por favor, proporciona una 'imageUrl' en el cuerpo de la solicitud."
                };
            }

            // Llamar a Azure Computer Vision para describir la imagen
            const analysis = await client.describeImage(imageUrl);

            return {
                status: 200,
                body: {
                    description: analysis.captions[0]?.text || 'No se encontró una descripción disponible.',
                    confidence: analysis.captions[0]?.confidence || 0
                }
            };

        } catch (error) {
            context.log('Error:', error.message);
            return {
                status: 500,
                body: {
                    error: 'Error al procesar la imagen.',
                    details: error.message
                }
            };
        }
    }
});
