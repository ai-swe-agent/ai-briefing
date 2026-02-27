import { pool } from './index.js';

const sampleArticles = [
  {
    title: 'OpenAI Announces GPT-5: A New Era of AI Understanding',
    url: 'https://example.com/openai-gpt5',
    source: 'hackernews',
    content: 'OpenAI has unveiled GPT-5, marking a significant leap in artificial intelligence capabilities. The new model demonstrates unprecedented reasoning abilities and multimodal understanding.',
    summary: 'OpenAI releases GPT-5 with enhanced reasoning and multimodal capabilities.',
    published_at: '2026-02-25T10:00:00Z',
  },
  {
    title: 'The Rise of AI Agents in Software Development',
    url: 'https://example.com/ai-agents-dev',
    source: 'medium',
    content: 'AI agents are revolutionizing how developers write and maintain code. From automated debugging to intelligent code generation, these tools are changing the landscape of software engineering.',
    summary: 'AI agents transform software development with automated debugging and code generation.',
    published_at: '2026-02-24T14:30:00Z',
  },
  {
    title: 'Reddit Community Discusses Future of Machine Learning',
    url: 'https://example.com/reddit-ml-future',
    source: 'reddit',
    content: 'The machine learning subreddit has been buzzing with discussions about the future direction of ML research. Key topics include federated learning, edge AI, and responsible AI development.',
    summary: 'Reddit ML community debates future research directions.',
    published_at: '2026-02-23T09:15:00Z',
  },
  {
    title: 'AWS Announces New AI Services for Enterprise',
    url: 'https://example.com/aws-ai-enterprise',
    source: 'provider_blog',
    content: 'Amazon Web Services has announced a suite of new AI services tailored for enterprise customers. The services include advanced NLP capabilities, computer vision tools, and MLOps infrastructure.',
    summary: 'AWS launches enterprise AI services including NLP and computer vision tools.',
    published_at: '2026-02-22T16:45:00Z',
  },
  {
    title: 'Breakthrough in Neural Network Efficiency',
    url: 'https://example.com/nn-efficiency',
    source: 'hackernews',
    content: 'Researchers have achieved a major breakthrough in neural network efficiency, reducing computational requirements by 80% while maintaining accuracy. This could make AI more accessible to smaller organizations.',
    summary: 'Research breakthrough reduces neural network computational requirements by 80%.',
    published_at: '2026-02-21T11:20:00Z',
  },
  {
    title: 'How to Build Production-Ready AI Applications',
    url: 'https://example.com/production-ai',
    source: 'medium',
    content: 'Building AI applications for production requires careful consideration of scalability, reliability, and maintainability. This guide covers best practices for deploying ML models in production environments.',
    summary: 'Guide to building scalable and reliable AI applications for production.',
    published_at: '2026-02-20T08:00:00Z',
  },
  {
    title: 'Google Cloud Introduces Gemini API Improvements',
    url: 'https://example.com/google-gemini-api',
    source: 'provider_blog',
    content: 'Google Cloud has released significant improvements to the Gemini API, including faster response times, expanded context windows, and new fine-tuning capabilities for enterprise customers.',
    summary: 'Google Cloud updates Gemini API with performance improvements and new features.',
    published_at: '2026-02-19T13:30:00Z',
  },
  {
    title: 'Open Source LLMs Challenge Proprietary Models',
    url: 'https://example.com/opensource-llm',
    source: 'reddit',
    content: 'The open source community continues to make strides in large language model development. Recent releases have shown performance comparable to proprietary models at a fraction of the cost.',
    summary: 'Open source LLMs achieve performance comparable to proprietary alternatives.',
    published_at: '2026-02-18T15:00:00Z',
  },
  {
    title: 'AI Safety Research Gains Momentum',
    url: 'https://example.com/ai-safety',
    source: 'hackernews',
    content: 'Major AI research institutions are increasing investment in AI safety research. New frameworks for alignment and interpretability are being developed to ensure AI systems remain beneficial.',
    summary: 'AI safety research receives increased investment and attention.',
    published_at: '2026-02-17T10:45:00Z',
  },
  {
    title: 'Microsoft Azure AI Updates for Developers',
    url: 'https://example.com/azure-ai-devs',
    source: 'provider_blog',
    content: 'Microsoft has announced new Azure AI tools specifically designed for developers. The updates include improved SDK support, better debugging tools, and streamlined deployment options.',
    summary: 'Microsoft releases developer-focused Azure AI improvements.',
    published_at: '2026-02-16T12:00:00Z',
  },
  {
    title: 'The Ethics of AI in Healthcare',
    url: 'https://example.com/ai-healthcare-ethics',
    source: 'medium',
    content: 'As AI becomes more prevalent in healthcare, ethical considerations become paramount. This article explores the balance between innovation and patient privacy, algorithmic bias, and informed consent.',
    summary: 'Exploring ethical considerations of AI in healthcare settings.',
    published_at: '2026-02-15T09:30:00Z',
  },
  {
    title: 'Community Projects Push Boundaries of Local AI',
    url: 'https://example.com/local-ai-projects',
    source: 'reddit',
    content: 'Hobbyist developers are creating impressive AI applications that run entirely on local hardware. These projects demonstrate that powerful AI is not limited to cloud-based solutions.',
    summary: 'Hobbyist developers create powerful local AI applications.',
    published_at: '2026-02-14T14:15:00Z',
  },
];

export async function seedArticles(): Promise<void> {
  console.log('Seeding articles...');
  
  for (const article of sampleArticles) {
    try {
      await pool.query(
        `INSERT INTO articles (title, url, source, content, summary, published_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (url) DO NOTHING`,
        [article.title, article.url, article.source, article.content, article.summary, article.published_at]
      );
    } catch (error) {
      console.error(`Failed to seed article: ${article.title}`, error);
    }
  }
  
  console.log('Seeding complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedArticles()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
