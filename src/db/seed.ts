import { pool } from './index.js';

interface SeedArticle {
  title: string;
  url: string;
  source: 'reddit' | 'hackernews' | 'medium' | 'provider_blog';
  content: string;
  summary: string;
  published_at: string;
}

const seedArticles: SeedArticle[] = [
  {
    title: 'OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities',
    url: 'https://hackernews.com/articles/gpt5-announcement',
    source: 'hackernews',
    content: 'OpenAI has officially announced GPT-5, their latest large language model featuring breakthrough reasoning capabilities. The model demonstrates improved logical thinking and can solve complex multi-step problems with greater accuracy.',
    summary: 'GPT-5 brings revolutionary reasoning capabilities to AI language models.',
    published_at: '2024-01-15T10:00:00Z'
  },
  {
    title: 'Understanding Vector Databases for AI Applications',
    url: 'https://medium.com/ai-vectors-explained',
    source: 'medium',
    content: 'Vector databases have become essential infrastructure for AI applications. This comprehensive guide explains how vector embeddings work, compares popular solutions like Pinecone and Weaviate, and provides practical implementation examples.',
    summary: 'A deep dive into vector databases and their role in modern AI systems.',
    published_at: '2024-01-14T14:30:00Z'
  },
  {
    title: 'Reddit Community Debates AI Art Ethics',
    url: 'https://reddit.com/r/technology/ai-art-debate',
    source: 'reddit',
    content: 'A heated discussion on r/technology explores the ethical implications of AI-generated art. Users debate copyright concerns, the impact on human artists, and potential regulatory frameworks for AI creativity.',
    summary: 'Reddit users engage in discussion about AI art and its ethical implications.',
    published_at: '2024-01-13T09:15:00Z'
  },
  {
    title: 'AWS Launches New AI-Powered Code Review Service',
    url: 'https://aws.amazon.com/blog/ai-code-review-launch',
    source: 'provider_blog',
    content: 'Amazon Web Services introduces CodeReviewer AI, a new service that automatically reviews pull requests using machine learning. The service identifies bugs, security vulnerabilities, and suggests performance improvements.',
    summary: 'AWS releases AI-powered automated code review tool for developers.',
    published_at: '2024-01-12T16:00:00Z'
  },
  {
    title: 'Machine Learning in Production: Lessons from Scale',
    url: 'https://hackernews.com/articles/ml-production-lessons',
    source: 'hackernews',
    content: 'Engineers share hard-won lessons from deploying ML models at scale. Topics covered include model monitoring, feature drift detection, A/B testing strategies, and managing model versioning in production environments.',
    summary: 'Practical lessons learned from deploying ML systems in production.',
    published_at: '2024-01-11T11:45:00Z'
  },
  {
    title: 'The Rise of Local LLMs: Running AI Models on Consumer Hardware',
    url: 'https://medium.com/local-llms-guide',
    source: 'medium',
    content: 'With advances in model quantization and efficient architectures, running large language models locally is becoming increasingly viable. This article explores tools like llama.cpp, Ollama, and LM Studio for local AI deployment.',
    summary: 'Guide to running large language models on personal computers.',
    published_at: '2024-01-10T08:20:00Z'
  },
  {
    title: 'Google DeepMind Achieves Breakthrough in Protein Folding Prediction',
    url: 'https://reddit.com/r/science/deepmind-proteins',
    source: 'reddit',
    content: 'New research from Google DeepMind pushes protein structure prediction to unprecedented accuracy levels. The community discusses implications for drug discovery and biological research.',
    summary: 'DeepMind advances protein folding prediction with new breakthrough.',
    published_at: '2024-01-09T13:30:00Z'
  },
  {
    title: 'Microsoft Azure Introduces Automated ML Pipeline Builder',
    url: 'https://azure.microsoft.com/blog/ml-pipeline-builder',
    source: 'provider_blog',
    content: 'Azure Machine Learning now features an automated pipeline builder that simplifies creating end-to-end ML workflows. The tool supports data preprocessing, model training, hyperparameter tuning, and deployment automation.',
    summary: 'Azure releases no-code ML pipeline creation tool.',
    published_at: '2024-01-08T15:00:00Z'
  },
  {
    title: 'Transformers Architecture Deep Dive: Attention Mechanisms Explained',
    url: 'https://hackernews.com/articles/transformers-deep-dive',
    source: 'hackernews',
    content: 'A comprehensive technical explanation of transformer architectures. The article covers self-attention, multi-head attention, positional encodings, and the mathematical foundations behind modern NLP models.',
    summary: 'Technical deep dive into transformer architecture components.',
    published_at: '2024-01-07T10:00:00Z'
  },
  {
    title: 'Building RAG Applications with LangChain and OpenAI',
    url: 'https://medium.com/rag-langchain-tutorial',
    source: 'medium',
    content: 'Retrieval-Augmented Generation combines the power of large language models with external knowledge bases. This tutorial walks through building a production-ready RAG application using LangChain and OpenAI APIs.',
    summary: 'Step-by-step guide to building RAG applications.',
    published_at: '2024-01-06T12:15:00Z'
  },
  {
    title: 'AI Safety Researchers Propose New Alignment Techniques',
    url: 'https://reddit.com/r/MachineLearning/alignment-research',
    source: 'reddit',
    content: 'A new paper presents novel techniques for AI alignment, focusing on constitutional AI and reward modeling improvements. Researchers discuss potential applications and limitations in the comments.',
    summary: 'New AI alignment research proposes improved safety techniques.',
    published_at: '2024-01-05T09:45:00Z'
  },
  {
    title: 'GCP Vertex AI Updates: Enhanced Model Garden and AutoML',
    url: 'https://cloud.google.com/blog/vertex-ai-updates',
    source: 'provider_blog',
    content: 'Google Cloud Platform expands Vertex AI with new pre-trained models in Model Garden and improved AutoML capabilities. Updates include support for custom foundation models and enhanced MLOps features.',
    summary: 'Google Cloud enhances Vertex AI with new features.',
    published_at: '2024-01-04T14:30:00Z'
  }
];

async function seed(): Promise<void> {
  console.log('Starting database seed...');
  
  try {
    for (const article of seedArticles) {
      await pool.query(
        `INSERT INTO articles (title, url, source, content, summary, published_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (url) DO NOTHING`,
        [article.title, article.url, article.source, article.content, article.summary, article.published_at]
      );
    }
    
    const result = await pool.query('SELECT COUNT(*) FROM articles');
    console.log(`Seed complete. Total articles: ${result.rows[0].count}`);
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
