import {
    BedrockRuntimeClient,
    InvokeModelCommand,
  } from '@aws-sdk/client-bedrock-runtime';
  import { IAIService, AIInsightsInput, AIInsightsResult } from '../../application/interfaces/ai-service.interface';
  import { env } from '../config/env';
  
  export class BedrockAIService implements IAIService {
    private readonly client: BedrockRuntimeClient;
    private readonly modelId: string;
  
    constructor() {
      this.client = new BedrockRuntimeClient({
        region: env.AWS_REGION,
        credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
      });
      this.modelId = env.BEDROCK_MODEL_ID;
    }
  
    async generateInsights(input: AIInsightsInput): Promise<AIInsightsResult> {
      const prompt = this.buildPrompt(input);
  
      try {
        const command = new InvokeModelCommand({
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
          }),
        });
  
        const response = await this.client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
        const aiText = responseBody.content?.[0]?.text || '';
  
        return this.parseResponse(aiText);
      } catch (error) {
        console.error('❌ Bedrock AI error:', error instanceof Error ? error.message : error);
  
        // Graceful fallback — return basic insights without AI
        return this.generateFallbackInsights(input);
      }
    }
  
    private buildPrompt(input: AIInsightsInput): string {
      return `Você é um analista de negócios especializado em delivery de refeições.
  Analise os dados a seguir do período de ${input.period.startDate} a ${input.period.endDate} e forneça insights estratégicos.
  
  DADOS:
  
  Receita:
  - Receita total: R$ ${input.revenue.totalRevenue.toFixed(2)}
  - Total de pedidos: ${input.revenue.totalOrders}
  - Ticket médio: R$ ${input.revenue.averageOrderValue.toFixed(2)}
  
  Pedidos por status:
  ${input.ordersByStatus.map((s) => `- ${s.status}: ${s.count} pedidos`).join('\n')}
  
  Top produtos mais vendidos:
  ${input.topProducts.map((p, i) => `- ${i + 1}. ${p.productName}: ${p.totalQuantity} unidades (R$ ${p.totalRevenue.toFixed(2)})`).join('\n')}
  
  Tempo de entrega:
  - Média: ${input.avgDeliveryTime.averageMinutes} minutos
  - Mais rápido: ${input.avgDeliveryTime.fastestMinutes} minutos
  - Mais lento: ${input.avgDeliveryTime.slowestMinutes} minutos
  
  Responda APENAS em formato JSON válido, sem markdown ou texto adicional, seguindo esta estrutura exata:
  {
    "summary": "resumo executivo em 2-3 frases",
    "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
    "highlights": ["destaque positivo 1", "destaque positivo 2", "ponto de atenção 1"]
  }`;
    }
  
    private parseResponse(aiText: string): AIInsightsResult {
      try {
        // Clean potential markdown formatting
        const cleaned = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
  
        return {
          summary: parsed.summary || 'Análise não disponível',
          recommendations: parsed.recommendations || [],
          highlights: parsed.highlights || [],
          generatedAt: new Date().toISOString(),
          model: this.modelId,
        };
      } catch {
        return {
          summary: aiText.substring(0, 500),
          recommendations: [],
          highlights: [],
          generatedAt: new Date().toISOString(),
          model: this.modelId,
        };
      }
    }
  
    private generateFallbackInsights(input: AIInsightsInput): AIInsightsResult {
      const recommendations: string[] = [];
      const highlights: string[] = [];
  
      if (input.revenue.totalOrders > 0) {
        highlights.push(`${input.revenue.totalOrders} pedidos no período com ticket médio de R$ ${input.revenue.averageOrderValue.toFixed(2)}`);
      }
  
      if (input.topProducts.length > 0) {
        highlights.push(`Produto mais vendido: ${input.topProducts[0].productName} com ${input.topProducts[0].totalQuantity} unidades`);
      }
  
      if (input.avgDeliveryTime.averageMinutes > 45) {
        recommendations.push('Tempo médio de entrega acima de 45 minutos — considere otimizar rotas ou adicionar mais entregadores');
      }
  
      const cancelledOrders = input.ordersByStatus.find((s) => s.status === 'cancelled');
      if (cancelledOrders && cancelledOrders.count > 0) {
        recommendations.push(`${cancelledOrders.count} pedidos cancelados — investigue as causas para reduzir cancelamentos`);
      }
  
      return {
        summary: `Período analisado: ${input.period.startDate} a ${input.period.endDate}. Receita total: R$ ${input.revenue.totalRevenue.toFixed(2)} com ${input.revenue.totalOrders} pedidos.`,
        recommendations,
        highlights,
        generatedAt: new Date().toISOString(),
        model: 'fallback-local',
      };
    }
  }