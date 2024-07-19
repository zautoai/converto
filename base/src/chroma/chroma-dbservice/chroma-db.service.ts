import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChromaClient, Collection, OpenAIEmbeddingFunction } from "chromadb";
import { CHROMA_ENDPOINTS } from 'src/common/constants/endpoint.constants';
import { EMBEDDING_PROVIDER_DENSE, EMBEDDING_PROVIDER_SBERT } from 'src/common/constants/system.constants';
import { WebClientService } from 'src/common/services/web-client.service';
import { AgentFile } from 'src/llm/llms/llm.models';
import { Site } from 'src/site/entities/site.entity';

@Injectable()
export class ChromaDBService {

    private embedder: OpenAIEmbeddingFunction;
    private chunkSize: number = Number.parseInt(process.env.CHUNCK_SIZE);
    private similarityThreshold = 0.25

    constructor(private webClient: WebClientService) {
        this.embedder = new OpenAIEmbeddingFunction({
            openai_api_key: process.env.OPENAI_API_KEY,
            openai_model: process.env.OPEN_AI_EMBEDDING_MODEL
        });
    }

    async getClient() {
        const client = new ChromaClient({
            path: process.env.CHROMA_URL,
            auth: {
                provider: process.env.CHROMA_AUTH_PROVIDER,
                credentials: process.env.CHROMA_AUTH_CREDENTIALS
            }
        });
        // const client = new ChromaClient({ path: process.env.CHROMA_URL });
        const isAlive = await client.heartbeat();
        if (!isAlive) throw Error('ChromaDB is not running.')
        return client;
    }

    async hearbeat() {
        const client = await this.getClient()
        return { heartbeat: await client.heartbeat() }
    }

    async hasNamespace(client: ChromaClient, namespace: string) {
        if (!namespace) throw new Error("No namespace value provided.");
        const collection = await client
            .getCollection({ name: namespace })
            .catch((e) => {
                console.error("ChromaDB::namespaceExists", e.message);
                return null;
            });
        return !!collection;
    }

    async createNameSapce(nameSpace: string) {
        if (!nameSpace) throw new Error("No namespace value provided.");
        const client = await this.getClient();
        let namespaceExists = await this.hasNamespace(client, nameSpace);
        if (!namespaceExists) {
            await client.createCollection({ name: nameSpace, embeddingFunction: this.embedder });
        }
    }

    async deleteNameSapce(nameSpace: string) {
        nameSpace = `${(process.env.NAME || 'DEV')}_${nameSpace}`;
        if (!nameSpace) throw new Error("No namespace value provided.");
        const client = await this.getClient();
        let namespaceExists = await this.hasNamespace(client, nameSpace);
        if (!namespaceExists) {
            await client.deleteCollection({ name: nameSpace });
        }
    }

    async findDenseEmbedding(contnet: string[]) {
        try {
            console.log('Finding Dense Embedding...')
            const data = {
                sentences: contnet
            }
            const response = await axios.post(process.env.DENSE_ENDPOINT, data);
            return response.data.embeddings;
        }
        catch (e) {
            console.log(e);
            throw 'Dense Embedding: Failed to find vectors.';
        }
    }

    async findOpenAIVectors(contnet: string[]) {
        console.log('Finding OpenAI Embedding...')
        try {
            const vectors = await this.embedder.generate(contnet)
            return vectors;
        } catch (error) {
            console.log(error)
            throw 'OpenAI Embedding: Failed to find vectors.'
        }
    }

    async findSBERTVectors(contnet: string[]) {
        console.log('Finding SBERT Embedding...')
        try {
            const url = process.env.SBERT_URL;
            const credentials = process.env.SBERT_CREDENTIALS;
            const base64Encoded = Buffer.from(credentials, "utf-8").toString("base64");
            const vectors = await this.webClient.post(url, { documents: contnet }, {
                Authorization: 'Basic ' + base64Encoded
            });
            return vectors.vectors;
        } catch (error) {
            throw new Error('SiteServcie: findSimpleVectors - Unable to find vectors.')
        }
    }

    splitContent(pageContent: string) {
        let sentences = pageContent.split('.');
        sentences = sentences.filter(sentence => sentence.length > 2);

        const mergedSentences = [];
        let currentMergedSentence = '';

        for (let i = 0; i < sentences.length; i++) {
            const currentSentence = sentences[i];

            if (currentSentence.length >= this.chunkSize) {
                mergedSentences.push(currentSentence);
            } else {
                if (currentMergedSentence.length + currentSentence.length <= this.chunkSize) {
                    currentMergedSentence += " " + currentSentence + '.';
                } else {
                    if (currentMergedSentence.length > 4) {
                        mergedSentences.push(currentMergedSentence);
                    }
                    currentMergedSentence = currentSentence + '.';
                }
            }
        }
        if (currentMergedSentence.length > 4) {
            mergedSentences.push(currentMergedSentence);
        }
        return mergedSentences;
    }


    async addDataTonamesapce(namespace: string, data: any, site: Site) {
        namespace = `${(process.env.NAME || 'DEV')}_${namespace}`;
        try {
            const { pageContent, ...metadata } = data;
            let sentances = this.splitContent(pageContent);
            const submission = {
                ids: [],
                embeddings: [],
                metadatas: [],
                documents: [],
            };
            const vectors = (process.env.EMBEDDING_PROVIDER == EMBEDDING_PROVIDER_SBERT)
                ? (await this.findSBERTVectors(sentances))
                : (process.env.EMBEDDING_PROVIDER == EMBEDDING_PROVIDER_DENSE)
                    ? (await this.findDenseEmbedding(sentances))
                    : (await this.findOpenAIVectors(sentances));
            if (vectors && await vectors.length > 0) {
                for (let i = 0; i < vectors.length; i++) {
                    const vector = vectors[i];
                    submission.ids.push(`${site.id}_${i + 1}`);
                    submission.embeddings.push(vector);
                    submission.metadatas.push(metadata)
                    submission.documents.push(sentances[i]);
                }
            }
            const client = await this.getClient();
            await this.createNameSapce(namespace);
            const collection = await client.getCollection({ name: namespace });
            const result = await this.insertDocsToCollection(collection, submission);
            console.log(`Adding Site ${site.url} to Chroma Status: ${result}`)
            return result;
        } catch (error) {
            console.log(error)
        }

        return false;
    }

    async addFileDataTonamesapce(namespace: string, data: any, agentFile: AgentFile) {
        namespace = `${(process.env.NAME || 'DEV')}_${namespace}`;
        try {
            const { textContent, ...metadata } = data;
            let sentances = this.splitContent(textContent);
            const submission = {
                ids: [],
                embeddings: [],
                metadatas: [],
                documents: [],
            };
            const vectors = (process.env.EMBEDDING_PROVIDER == EMBEDDING_PROVIDER_SBERT)
                ? (await this.findSBERTVectors(sentances))
                : (process.env.EMBEDDING_PROVIDER == EMBEDDING_PROVIDER_DENSE)
                    ? (await this.findDenseEmbedding(sentances))
                    : (await this.findOpenAIVectors(sentances));
            if (vectors && await vectors.length > 0) {
                for (let i = 0; i < vectors.length; i++) {
                    const vector = vectors[i];
                    submission.ids.push(`${agentFile.id}_${i + 1}`);
                    submission.embeddings.push(vector);
                    submission.metadatas.push(metadata)
                    submission.documents.push(sentances[i]);
                }
            }
            const client = await this.getClient();
            await this.createNameSapce(namespace);
            const collection = await client.getCollection({ name: namespace });
            const result = await this.insertDocsToCollection(collection, submission);
            console.log(`Adding file ${agentFile.fileName} to Chroma Status: ${result}`)
            return result;
        } catch (error) {
            console.log(error)
        }

        return false;
    }

    async insertDocsToCollection(collection: Collection, submission: any) {
        const url = `${process.env.CHROMA_URL}/${CHROMA_ENDPOINTS.API_PREFIX}${CHROMA_ENDPOINTS.COLLECTIONS}${collection.id}/${CHROMA_ENDPOINTS.ADD_ITEMS}`;

        const credentials = process.env.CHROMA_AUTH_CREDENTIALS;
        const base64Encoded = Buffer.from(credentials, "utf-8").toString("base64");
        const headers = { Authorization: 'Basic ' + base64Encoded };
        const response = await this.webClient.post(url, submission, headers);
        return response;
    }


    async queryDocsFromNamesapce(namespace: string, queryEmbeddings: any, nResults: number) {
        const client = await this.getClient();
        const collectionInstance = await client.getCollection({ name: namespace });
        const queryResult = await collectionInstance.query({ queryEmbeddings, nResults });
        return queryResult;
    }

    distanceToSimilarity(distance: number) {
        if (distance === null || typeof distance !== "number") return 0.0;
        if (distance >= 1.0) return 1;
        if (distance <= 0) return 0;
        return 1 - distance;
    }

    async queryDocs(namespace: string, userMessage: string) {
        namespace = `${(process.env.NAME || 'DEV')}_${namespace}`;
        const vectors = (EMBEDDING_PROVIDER_SBERT == process.env.EMBEDDING_PROVIDER)
            ? await this.findSBERTVectors([userMessage])
            : (EMBEDDING_PROVIDER_DENSE == process.env.EMBEDDING_PROVIDER)
                ? await this.findDenseEmbedding([userMessage])
                : await this.findOpenAIVectors([userMessage]);
        const queryEmbeddings = vectors && vectors.length > 0 ? vectors[0] : null;
        let similarRecords = await this.queryDocsFromNamesapce(namespace, queryEmbeddings, 5);
        let _similarRecords = {
            documents: [],
            ids: [],
            metadatas: [],
            scores: []
        }
        for (let i = 0; i < similarRecords.distances[0].length; i++) {
            const similarityScore = this.distanceToSimilarity(similarRecords.distances[0][i]);
            if (similarityScore >= this.similarityThreshold) {
                _similarRecords.documents.push(similarRecords.documents[0][i]);
                _similarRecords.ids.push(similarRecords.ids[0][i]);
                _similarRecords.metadatas.push(similarRecords.metadatas[0][i]);
                _similarRecords.metadatas.push(similarityScore);
            }
        }
        return _similarRecords;
    }

    async removeDocs(namespace: string, site: string) {
        namespace = `${(process.env.NAME || 'DEV')}_${namespace}`;
        const client = await this.getClient();
        const collectionInstance = await client.getCollection({ name: namespace });
        const result = await collectionInstance.delete({
            where: { "url": { "$eq": site } }
        });
        return result;
    }

    async removeMultipleDocs(namespace: string, sites: string[]) {
        const client = await this.getClient();
        const collectionInstance = await client.getCollection({ name: namespace });
        for (let site of sites) {
            const result = await collectionInstance.delete({
                where: { "url": { "$eq": site } }
            });
        }
        return true;
    }

    async removeFileDocs(namespace: string, fileId: string) {
        namespace = `${(process.env.NAME || 'DEV')}_${namespace}`;
        const client = await this.getClient();
        const collectionInstance = await client.getCollection({ name: namespace });
        const result = await collectionInstance.delete({
            where: { "fileId": { "$eq": fileId } }
        });
        return result;
    }
}
