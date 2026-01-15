import { Injectable } from '@nestjs/common';
import { Mistral } from '@mistralai/mistralai';

@Injectable()
export class MistralService {
  private readonly client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY,
  });

  async generate(prompt: string): Promise<string> {
    const response = await this.client.chat.complete({
      model: 'mistral-small',
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'Tu es un expert pédagogique.' },
        { role: 'user', content: prompt },
      ],
    });
    
    if(response.choices.length === 0 || !response.choices[0].message.content){
      throw new Error('No response from Mistral API');
    }
    const content = response.choices[0].message.content;

    const text =
    typeof content === 'string'
        ? content
        : content
          .filter((chunk): chunk is { type: "text"; text: string } => chunk.type === "text")
          .map(chunk => chunk.text)
          .join("");;
        
    return text;
  }
}
