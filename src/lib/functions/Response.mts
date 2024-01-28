import { MessageViewModel } from "../models/responses/MessageViewModel.mjs";

export const createMessageObj = (message: string): MessageViewModel => ({ message });
