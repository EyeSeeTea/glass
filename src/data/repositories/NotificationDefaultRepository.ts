import { D2Api, Pager } from "@eyeseetea/d2-api/2.34";
import { Future, FutureData } from "../../domain/entities/Future";
import { Notification } from "../../domain/entities/Notifications";
import { Id, Ref } from "../../domain/entities/Ref";
import { NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { Instance } from "../entities/Instance";

export class NotificationDefaultRepository implements NotificationRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    get(id: Id): FutureData<Notification> {
        return apiToFuture(
            //TODO: Api has a bug retrieving data filtering by id (userMessages) however data is correct retrieving data by Id
            // d2api get resource by id does not work then here I don't use type safe endpoint
            this.api
                .get<D2MessageConversationDetail>(`/messageConversations/${id}`, {
                    fields: "id,lastMessage,messages[lastUpdated,sender[name],text],subject,userMessages[user[id,name,username]],user[id,name,username]",
                })
                .map(response => {
                    return this.buildNotificationDetail(response.data);
                })
        );
    }

    getAll(): FutureData<Notification[]> {
        return apiToFuture(
            this.api
                .get<D2MessageConversationResponse>(`/messageConversations`, {
                    fields: "id,lastMessage,messages[text],subject",
                    page: 1,
                    pageSize: 10,
                    filter: "messageType:eq:PRIVATE",
                    order: "lastMessage:desc",
                })
                .map(response => {
                    return response.data.messageConversations.map(this.buildNotification);
                })
        );
    }

    send(subject: string, message: string, users: Ref[]): FutureData<void> {
        return apiToFuture(
            this.api.messageConversations.post({
                subject: subject,
                text: message,
                users: users,
            })
        ).flatMap(_res => Future.success(undefined));
    }

    private buildNotification(messageConversation: D2MessageConversation): Notification {
        return {
            id: messageConversation.id,
            date: messageConversation.lastMessage,
            subject: messageConversation.subject,
            messages: messageConversation.messages.map(msg => {
                return {
                    text: msg.text,
                };
            }),
        };
    }

    private buildNotificationDetail(messageConversation: D2MessageConversationDetail): Notification {
        return {
            id: messageConversation.id,
            date: messageConversation.lastMessage,
            subject: messageConversation.subject,
            users: messageConversation.userMessages.map(userMesage => userMesage.user),
            messages: messageConversation.messages.map(msg => {
                return {
                    text: msg.text,
                    sender: msg.sender.name,
                    date: msg.lastUpdated,
                };
            }),
        };
    }
}

type D2MessageConversationResponse = {
    messageConversations: D2MessageConversation[];
    pager: Pager;
};

type D2MessageConversation = {
    id: string;
    subject: string;
    lastMessage: string;
    messages: {
        text: string;
    }[];
};

type D2MessageConversationDetail = {
    id: string;
    subject: string;
    lastMessage: string;
    user: {
        id: string;
        name: string;
        username: string;
    };
    userMessages: {
        user: {
            id: string;
            name: string;
            username: string;
        };
    }[];
    messages: {
        text: string;
        sender: { name: string };
        lastUpdated: string;
    }[];
};
