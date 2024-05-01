import { Sentimental } from "../entities/conversation.entity";

export enum Vote {
  UPVOTE = "UPVOTE",
  DOWNVOTE = "DOWNVOTE"
}

export class UpdateMessageDto {

  vote?: Vote;

  feedback?: string;

  sentimental?: Sentimental;
  
}