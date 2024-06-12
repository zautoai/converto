
export const DEFAULT_SCHEMA_NAME = 'public';
export const SYSTEM_CONST = {
    DEFALT_ROLE :'user',
    ADMIN_ROLE: 'admin',
    SUPERUSER_ROLE: 'superadmin',
    TRAINING_CONTENT_PATH: 'uploads'
}

export const MEDIA_EXTENTIONS = [
    '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm', '.avi', '.mov',
    '.mp3', '.ogg', '.wav', '.pptx', '.swf',
    '.svg', '.gltf'
];

export const ALLOWED_EXTENSIONS = ['.txt', '.doc', '.docx', '.pdf'];

export const EMAIL_VERIFICATION_EXPIRES_TIME = new Number(process.env.VERIFICATION_EXPIRES_IN).valueOf();

export const ZAUTO_ORG="ZautoAI";

export const EMBEDDING_PROVIDER_SBERT="SBERT"

export const EMBEDDING_PROVIDER_OPENAI="OPENAI"

export const DEFAULT_SECRET_KEY="dNL4BMDRaYfvVzPxiGpHGKXaTAsG7n7dqFIlq7I3skKTsknstU"

export const DEFALT_ROLES = [
    {
        name: 'admin'
    },
    {
        name: 'user'
    },
    {
        name: 'superadmin'
    }
]